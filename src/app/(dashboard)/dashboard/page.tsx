import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, CheckCircle, Clock } from "lucide-react";
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

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Leads", value: stats.totalLeads.toLocaleString(), icon: Users, color: "text-blue-500" },
    { label: "Total Jobs", value: stats.totalJobs.toString(), icon: Search, color: "text-purple-500" },
    { label: "Completed Jobs", value: stats.doneJobs.toString(), icon: CheckCircle, color: "text-green-500" },
    { label: "In Progress", value: (stats.totalJobs - stats.doneJobs).toString(), icon: Clock, color: "text-accent" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Your lead generation overview.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon size={16} className={color} />
              </div>
              <span className="text-3xl font-bold">{value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Jobs</CardTitle></CardHeader>
        <CardContent>
          {stats.recentJobs.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No jobs yet.{" "}
              <Link href="/scrape" className="text-foreground font-medium hover:underline">
                Start your first scrape →
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {stats.recentJobs.map((job: Record<string, unknown>) => (
                <div key={job.id as string} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{(job.job_title as string) || "Untitled"} — {job.industry as string}</p>
                    <p className="text-xs text-muted-foreground">{new Date(job.created_at as string).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{job.lead_count as number} leads</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      job.status === "done" ? "bg-green-100 text-green-800" :
                      job.status === "failed" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>{job.status as string}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
