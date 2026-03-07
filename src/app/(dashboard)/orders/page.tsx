import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default async function OrdersPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: jobs } = await supabase
    .from("scrape_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  const statusVariant: Record<string, "pending" | "running" | "done" | "failed" | "secondary"> = {
    pending: "pending", running: "running", enriching: "running",
    personalizing: "running", done: "done", failed: "failed",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Orders</h1>
          <p className="text-muted-foreground">All your scrape jobs and their results.</p>
        </div>
        <Link href="/scrape" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          + New Scrape
        </Link>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {!jobs?.length && (
            <div className="py-12 text-center text-muted-foreground">
              No jobs yet.{" "}
              <Link href="/scrape" className="text-foreground font-medium hover:underline">
                Start scraping →
              </Link>
            </div>
          )}
          {jobs?.map(job => (
            <Link key={job.id} href={`/orders/${job.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium text-sm">
                  {[job.job_title, job.industry, job.location].filter(Boolean).join(" · ") || "Untitled job"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{job.lead_count} leads</span>
                <Badge variant={statusVariant[job.status] ?? "secondary"}>{job.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
