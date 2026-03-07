import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { runApifyActor, mapLeadFinderResult, mapGMapsResult } from "@/lib/apify";
import { enrichEmail } from "@/lib/anymailfinder";
import { generatePersonalization } from "@/lib/claude";

export const maxDuration = 300;

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(_req: Request, { params }: { params: { jobId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: job } = await supabase.from("scrape_jobs").select("*").eq("id", params.jobId).single();
  if (!job || job.user_id !== user.id) return new Response("Not found", { status: 404 });

  const { data: config } = await supabase.from("user_configs").select("*").eq("user_id", user.id).single();
  if (!config) return new Response("No config", { status: 400 });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(new TextEncoder().encode(sseEvent(data)));

      try {
        await supabase.from("scrape_jobs").update({ status: "running" }).eq("id", params.jobId);
        send({ stage: "scraping", progress: 0, total: job.target_count, message: "Starting Apify lead scrape..." });

        // Stage 1: Apify lead-finder
        const rawItems = await runApifyActor(
          "code_crafter~lead-finder",
          {
            searchQuery: [job.job_title, job.industry, job.keywords].filter(Boolean).join(" "),
            location: job.location ?? "",
            maxResults: job.target_count,
          },
          config.apify_key
        ) as Record<string, unknown>[];

        let mappedLeads: ReturnType<typeof mapLeadFinderResult | typeof mapGMapsResult>[] = rawItems.map(mapLeadFinderResult);
        send({ stage: "scraping", progress: mappedLeads.length, total: job.target_count, message: `Found ${mappedLeads.length} leads from LinkedIn.` });

        // Fallback: Google Maps
        if (mappedLeads.length < job.target_count * 0.5 && job.industry) {
          send({ stage: "scraping", progress: mappedLeads.length, total: job.target_count, message: "Not enough leads — trying Google Maps fallback..." });
          const gmapsItems = await runApifyActor(
            "compass~crawler-google-places",
            {
              searchStringsArray: [`${job.industry} ${job.location ?? ""}`.trim()],
              maxCrawledPlaces: job.target_count - mappedLeads.length,
            },
            config.apify_key
          ) as Record<string, unknown>[];
          mappedLeads = [...mappedLeads, ...gmapsItems.map(mapGMapsResult)];
          send({ stage: "scraping", progress: mappedLeads.length, total: job.target_count, message: `Total after fallback: ${mappedLeads.length} leads.` });
        }

        // Stage 2: Enrich emails
        await supabase.from("scrape_jobs").update({ status: "enriching" }).eq("id", params.jobId);
        send({ stage: "enriching", progress: 0, total: mappedLeads.length, message: "Enriching emails via Anymailfinder..." });

        const enrichedLeads = [];
        for (let i = 0; i < mappedLeads.length; i++) {
          const lead = { ...mappedLeads[i], email_verified: false as boolean };
          if (!lead.email) {
            const enriched = await enrichEmail(lead.firstname, lead.lastname, lead.company, lead.website, config.anymailfinder_key);
            lead.email = enriched.email ?? "";
            lead.email_verified = enriched.email_verified;
          } else {
            lead.email_verified = true;
          }
          enrichedLeads.push(lead);
          if (i % 10 === 0) send({ stage: "enriching", progress: i + 1, total: mappedLeads.length, message: `Enriched ${i + 1}/${mappedLeads.length}` });
        }

        // Stage 3: Personalize
        await supabase.from("scrape_jobs").update({ status: "personalizing" }).eq("id", params.jobId);
        send({ stage: "personalizing", progress: 0, total: enrichedLeads.length, message: "Generating AI personalizations with Claude..." });

        const finalLeads = [];
        for (let i = 0; i < enrichedLeads.length; i++) {
          const lead = { ...enrichedLeads[i], personalization: "" as string };
          if (lead.email) {
            try {
              lead.personalization = await generatePersonalization(
                config.personalization_prompt,
                lead,
                config.anthropic_key
              );
            } catch {
              lead.personalization = "";
            }
          }
          finalLeads.push(lead);
          if (i % 5 === 0) send({ stage: "personalizing", progress: i + 1, total: enrichedLeads.length, message: `Personalized ${i + 1}/${enrichedLeads.length}` });
        }

        // Write to DB in batches of 25
        const withIds = finalLeads.map(l => ({ ...l, job_id: params.jobId, user_id: user.id }));
        for (let i = 0; i < withIds.length; i += 25) {
          await supabase.from("leads").insert(withIds.slice(i, i + 25));
        }

        await supabase.from("scrape_jobs").update({
          status: "done",
          lead_count: finalLeads.length,
          completed_at: new Date().toISOString(),
        }).eq("id", params.jobId);

        send({ stage: "done", total: finalLeads.length, message: `Done! ${finalLeads.length} leads ready.` });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        await supabase.from("scrape_jobs").update({ status: "failed", error_message: message }).eq("id", params.jobId);
        send({ stage: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
