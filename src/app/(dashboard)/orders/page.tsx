import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
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
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Orders</h1>
          <p className="text-muted-foreground text-sm">All your scrape jobs and their results.</p>
        </div>
        <Link
          href="/scrape"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-85 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          + New scrape
        </Link>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {!jobs?.length && (
            <div className="py-14 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <ClipboardList size={20} className="text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-sm mb-1">No orders yet</h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-xs">
                Start a scrape to generate your first batch of verified leads.
              </p>
              <Link
                href="/scrape"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-85 transition-all"
              >
                Start first scrape
              </Link>
            </div>
          )}
          {jobs?.map(job => (
            <Link
              key={job.id}
              href={`/orders/${job.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 -mx-0 transition-colors group"
            >
              <div>
                <p className="font-medium text-sm group-hover:text-foreground transition-colors">
                  {[job.job_title, job.industry, job.location].filter(Boolean).join(" · ") || "Untitled job"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold tabular-nums">
                  {job.lead_count}
                  <span className="text-muted-foreground font-normal text-xs ml-1">leads</span>
                </span>
                <Badge variant={statusVariant[job.status] ?? "secondary"}>{job.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
