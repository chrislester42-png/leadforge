import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(_req: Request, { params }: { params: { jobId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("job_id", params.jobId)
    .order("created_at");

  if (!leads?.length) return new Response("No leads", { status: 404 });

  const headers = ["firstname", "lastname", "email", "company", "title", "location", "linkedin_url", "phone", "website", "personalization"];
  const rows = leads.map(l =>
    headers.map(h => `"${((l as Record<string, unknown>)[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${params.jobId.slice(0, 8)}.csv"`,
    },
  });
}
