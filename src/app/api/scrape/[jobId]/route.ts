import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function DELETE(_req: Request, { params }: { params: { jobId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Delete leads first (foreign key), then the job
  await supabase.from("leads").delete().eq("job_id", params.jobId);
  const { error } = await supabase.from("scrape_jobs").delete().eq("id", params.jobId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
