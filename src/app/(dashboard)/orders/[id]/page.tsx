import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { OrderActions } from "@/components/orders/order-actions";
import { SendToInstantlyButton } from "@/components/orders/send-to-instantly-button";
import { ArrowLeft, Download, Calendar, Users, ShieldCheck, Hash } from "lucide-react";

const statusVariant: Record<string, "pending" | "running" | "done" | "failed"> = {
  pending: "pending", running: "running", enriching: "running",
  personalizing: "running", done: "done", failed: "failed",
};

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

  const verifiedCount = leads?.filter(l => l.email_verified).length ?? 0;
  const searchName = [job.job_title, job.industry, job.location].filter(Boolean).join(" · ") || "Untitled job";
  const shortId = job.id.slice(0, 8);

  return (
    <div>
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={13} /> Back to orders
      </Link>

      {/* Header bar */}
      <div className="rounded-xl border border-border bg-card shadow-sm mb-8">
        <div className="flex items-center justify-between px-6 py-5">
          {/* Left: search name + status */}
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-lg font-extrabold tracking-tight truncate">{searchName}</h1>
              <Badge variant={statusVariant[job.status] ?? "secondary"}>{job.status}</Badge>
            </div>
            {job.error_message && (
              <p className="text-xs text-destructive mt-1 max-w-lg truncate" title={job.error_message}>{job.error_message}</p>
            )}
          </div>

          {/* Right: download + actions */}
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {job.status === "done" && (
              <>
                <SendToInstantlyButton jobId={job.id} leadCount={leads?.filter(l => l.email).length ?? 0} />
                <a
                  href={`/api/scrape/${job.id}/download`}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download size={14} /> Download CSV
                </a>
              </>
            )}
            <OrderActions jobId={job.id} status={job.status} />
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-border grid grid-cols-4 divide-x divide-border">
          <div className="px-5 py-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Hash size={14} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Job ID</p>
              <p className="text-sm font-semibold tabular-nums mt-0.5" title={job.id}>{shortId}</p>
            </div>
          </div>
          <div className="px-5 py-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Date</p>
              <p className="text-sm font-semibold mt-0.5">{new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
          <div className="px-5 py-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Users size={14} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Leads</p>
              <p className="text-sm font-extrabold tabular-nums mt-0.5">{job.lead_count}</p>
            </div>
          </div>
          <div className="px-5 py-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <ShieldCheck size={14} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Verified Emails</p>
              <p className="text-sm font-extrabold tabular-nums mt-0.5">{verifiedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-bold">Leads ({leads?.length ?? 0})</h2>
        </div>
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
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{[lead.firstname, lead.lastname].filter(Boolean).join(" ") || "\u2014"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.email ? (
                      <span className="flex items-center gap-1.5">
                        {lead.email}
                        {lead.email_verified && <ShieldCheck size={12} className="text-green-600 shrink-0" />}
                      </span>
                    ) : "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.title || "\u2014"}</td>
                  <td className="px-4 py-3">{lead.company || "\u2014"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.location || "\u2014"}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs text-muted-foreground truncate" title={lead.personalization ?? ""}>{lead.personalization || "\u2014"}</p>
                  </td>
                </tr>
              ))}
              {!leads?.length && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No leads yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
