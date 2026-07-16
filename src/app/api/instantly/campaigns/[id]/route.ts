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

  try {
    const campaign = await instantlyFetch(config.instantly_key, `/campaigns/${params.id}`);
    return NextResponse.json(campaign);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Instantly API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
