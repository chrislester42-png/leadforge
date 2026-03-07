import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId, campaignName } = await request.json();

  const { data: config } = await supabase
    .from("user_configs")
    .select("instantly_key")
    .eq("user_id", user.id)
    .single();

  if (!config?.instantly_key) {
    return NextResponse.json({ error: "No Instantly API key configured" }, { status: 400 });
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("job_id", jobId)
    .not("email", "is", null);

  if (!leads?.length) return NextResponse.json({ error: "No leads with emails" }, { status: 400 });

  let pushed = 0;
  for (let i = 0; i < leads.length; i += 100) {
    const batch = leads.slice(i, i + 100).map(l => ({
      email: l.email,
      first_name: l.firstname,
      last_name: l.lastname,
      company_name: l.company,
      personalization: l.personalization,
    }));
    const res = await fetch("https://api.instantly.ai/api/v1/lead/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: config.instantly_key, campaign_name: campaignName, leads: batch }),
    });
    if (res.ok) pushed += batch.length;
  }

  return NextResponse.json({ success: true, count: pushed });
}
