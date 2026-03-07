import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, CheckCircle, Clock, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const [{ count: totalLeads }, { count: totalJobs }, { count: doneJobs }, { data: recentJobs }] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("scrape_jobs").select("*", { count: "exact", head: true }),
    supabase.from("scrape_jobs").select("*", { count: "exact", head: true }).eq("status", "done"),
    supabase.from("scrape_jobs").select("*").order("created_at", { ascending: false }).limit(5),
  ]);
  return { totalLeads: totalLeads ?? 0, totalJobs: totalJobs ?? 0, doneJobs: doneJobs ?? 0, recentJobs: recentJobs ?? [] };
}

const statusVariant: Record<string, "pending" | "running" | "done" | "failed"> = {
  pending: "pending", running: "running", enriching: "running",
  personalizing: "running", done: "done", failed: "failed",
};

export default async function DashboardPage() {
  const stats = await getStats();
  const isEmpty = stats.totalJobs === 0;

  const statCards = [
    { label: "Total leads", value: stats.totalLeads.toLocaleString(), icon: Users, accent: false },
    { label: "Total jobs", value: stats.totalJobs.toString(), icon: Search, accent: false },
    { label: "Completed", value: stats.doneJobs.toString(), icon: CheckCircle, accent: false },
    { label: "In progress", value: (stats.totalJobs - stats.doneJobs).toString(), icon: Clock, accent: true },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your lead generation overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {statCards.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className="border-border">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-accent-muted" : "bg-secondary"}`}>
                  <Icon size={13} className={accent ? "text-accent-dim" : "text-muted-foreground"} />
                </div>
              </div>
              <span className="text-3xl font-extrabold tracking-tight tabular-nums">{value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent jobs</CardTitle>
            {!isEmpty && (
              <Link href="/orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isEmpty ? (
            /* Empty state */
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-muted flex items-center justify-center mb-4">
                <Zap size={22} className="text-accent-dim" />
              </div>
              <h3 className="font-semibold text-sm mb-1">No scrape jobs yet</h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-xs leading-relaxed">
                Start your first scrape to find verified leads with AI-written personalizations.
              </p>
              <Link
                href="/scrape"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-85 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Start first scrape <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border -mx-6 px-6">
              {stats.recentJobs.map((job: Record<string, unknown>) => (
                <Link
                  key={job.id as string}
                  href={`/orders/${job.id as string}`}
                  className="flex items-center justify-between py-3.5 hover:bg-muted/40 -mx-6 px-6 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {(job.job_title as string) || "Untitled"}
                      {job.industry ? <span className="text-muted-foreground font-normal"> · {job.industry as string}</span> : null}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(job.created_at as string).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold tabular-nums">{job.lead_count as number}<span className="text-muted-foreground font-normal text-xs ml-1">leads</span></span>
                    <Badge variant={statusVariant[job.status as string] ?? "secondary"}>{job.status as string}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
