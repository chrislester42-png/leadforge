import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstantlyPushButton } from "@/components/orders/instantly-push-button";
import { ArrowLeft, Download } from "lucide-react";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: job } = await supabase.from("scrape_jobs").select("*").eq("id", params.id).single();
  if (!job) notFound();

  const { data: leads } = await supabase.from("leads").select("*").eq("job_id", params.id).order("created_at");

  return (
    <div className="max-w-5xl">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={13} /> Back to orders
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">
            {[job.job_title, job.industry, job.location].filter(Boolean).join(" · ") || "Scrape job"}
          </h1>
          <p className="text-muted-foreground text-sm">
            <span className="tabular-nums font-semibold text-foreground">{job.lead_count}</span> leads · {new Date(job.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {job.status === "done" && (
            <>
              <a
                href={`/api/scrape/${job.id}/download`}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
              >
                <Download size={14} /> Download CSV
              </a>
              <InstantlyPushButton jobId={job.id} />
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Leads ({leads?.length ?? 0})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Name", "Email", "Title", "Company", "Location", "Personalization"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads?.map(lead => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{[lead.firstname, lead.lastname].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.email || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.title || "—"}</td>
                    <td className="px-4 py-3">{lead.company || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.location || "—"}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-muted-foreground truncate" title={lead.personalization ?? ""}>{lead.personalization || "—"}</p>
                    </td>
                  </tr>
                ))}
                {!leads?.length && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No leads yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
