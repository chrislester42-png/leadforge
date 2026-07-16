import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { instantlyFetch } from "@/lib/instantly";

export async function GET(request: Request) {
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
  const params: Record<string, string> = {};
  for (const key of ["limit", "search", "status", "starting_after"]) {
    const val = searchParams.get(key);
    if (val) params[key] = val;
  }

  try {
    const data = await instantlyFetch(config.instantly_key, "/campaigns", { params });
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Instantly API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
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

  const { name } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
  }

  const body = {
    name,
    campaign_schedule: {
      schedules: [
        {
          name: "Default",
          timing: { from: "09:00", to: "17:00" },
          days: { "1": true, "2": true, "3": true, "4": true, "5": true },
          timezone: "America/Chicago",
        },
      ],
    },
  };

  try {
    const campaign = await instantlyFetch(config.instantly_key, "/campaigns", {
      method: "POST",
      body,
    });
    return NextResponse.json(campaign);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Instantly API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
