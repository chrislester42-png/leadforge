import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  keywords: z.string().optional(),
  targetCount: z.coerce.number().min(10).max(1000).default(100),
});

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { data: job, error } = await supabase
    .from("scrape_jobs")
    .insert({
      user_id: user.id,
      status: "pending",
      job_title: parsed.data.jobTitle,
      industry: parsed.data.industry,
      location: parsed.data.location,
      keywords: parsed.data.keywords,
      target_count: parsed.data.targetCount,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ jobId: job.id });
}
