import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { instantlyFetch } from "@/lib/instantly";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: config } = await supabase
    .from("user_configs")
    .select("instantly_key")
    .eq("user_id", user.id)
    .single();

  if (!config?.instantly_key) {
    return NextResponse.json({ error: "No Instantly API key configured" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const start_date = searchParams.get("start_date") ?? thirtyDaysAgo.toISOString().split("T")[0];
  const end_date = searchParams.get("end_date") ?? now.toISOString().split("T")[0];

  try {
    const analytics = await instantlyFetch(
      config.instantly_key,
      "/campaigns/analytics/overview",
      {
        params: {
          campaign_id: params.id,
          start_date,
          end_date,
        },
      }
    );
    return NextResponse.json(analytics);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Instantly API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
