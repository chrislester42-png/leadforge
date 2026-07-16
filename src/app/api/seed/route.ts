import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const FAKE_LEADS = [
  { firstname: "Sarah", lastname: "Chen", email: "s.chen@lattice.com", email_verified: true, company: "Lattice", title: "VP Marketing", location: "San Francisco, CA", linkedin_url: "https://linkedin.com/in/sarah-chen", phone: "", website: "lattice.com", source: "apify", personalization: "Your recent post about OKR alignment at scale caught my attention — the way you framed the connection between manager enablement and retention is exactly what we're seeing in our data." },
  { firstname: "James", lastname: "Okafor", email: "j.okafor@rippling.com", email_verified: true, company: "Rippling", title: "Head of Growth", location: "San Francisco, CA", linkedin_url: "https://linkedin.com/in/james-okafor", phone: "+14155550123", website: "rippling.com", source: "apify", personalization: "Saw Rippling's expansion into payroll APIs — your team's approach to bundling workforce management is creating a new category. Would love to share how we're helping growth teams like yours find decision-makers faster." },
  { firstname: "Elena", lastname: "Vasquez", email: "e.vasquez@outreach.io", email_verified: true, company: "Outreach", title: "Director of Sales", location: "Seattle, WA", linkedin_url: "https://linkedin.com/in/elena-vasquez", phone: "", website: "outreach.io", source: "apify", personalization: "The SDR productivity report you published last quarter had some eye-opening benchmarks. We've been helping sales orgs hit those numbers with AI-enriched prospecting." },
  { firstname: "Marcus", lastname: "Rivera", email: "m.rivera@close.com", email_verified: true, company: "Close", title: "Senior AE", location: "Austin, TX", linkedin_url: "https://linkedin.com/in/marcus-rivera", phone: "", website: "close.com", source: "apify", personalization: "Noticed Close just launched the AI call assistant — the focus on inside sales workflows really sets you apart. Curious if your team is exploring AI on the prospecting side too." },
  { firstname: "Aisha", lastname: "Patel", email: "a.patel@salesloft.com", email_verified: true, company: "Salesloft", title: "VP Revenue Operations", location: "Atlanta, GA", linkedin_url: "https://linkedin.com/in/aisha-patel", phone: "+14045550199", website: "salesloft.com", source: "apify", personalization: "Your talk at SaaStr about aligning RevOps with product-led growth was the best session I attended. We're building tools that automate the top-of-funnel research your team probably still does manually." },
  { firstname: "David", lastname: "Kim", email: "d.kim@gong.io", email_verified: false, company: "Gong", title: "Sales Manager", location: "San Francisco, CA", linkedin_url: "https://linkedin.com/in/david-kim-gong", phone: "", website: "gong.io", source: "apify", personalization: "Gong's conversation intelligence data must give you incredible insight into what top reps do differently. We're applying a similar AI-first philosophy to lead sourcing." },
  { firstname: "", lastname: "", email: "info@bayareacatering.com", email_verified: false, company: "Bay Area Catering Co", title: "", location: "Oakland, CA", linkedin_url: "", phone: "+15105550177", website: "bayareacatering.com", source: "gmaps", personalization: "" },
  { firstname: "", lastname: "", email: "hello@sfcleanteam.com", email_verified: true, company: "SF Clean Team", title: "", location: "San Francisco, CA", linkedin_url: "", phone: "+14155550234", website: "sfcleanteam.com", source: "gmaps", personalization: "" },
  { firstname: "Nina", lastname: "Johansson", email: "nina@hubspot-partner.se", email_verified: true, company: "GrowthLoop", title: "CEO", location: "Stockholm, Sweden", linkedin_url: "https://linkedin.com/in/nina-johansson", phone: "", website: "growthloop.se", source: "apify", personalization: "Your LinkedIn posts about scaling outbound in the Nordics have been really insightful. We just helped a Stockholm-based SaaS team 3x their pipeline — happy to share what worked." },
  { firstname: "Raj", lastname: "Mehta", email: null, email_verified: false, company: "TechCorp India", title: "CTO", location: "Bangalore, India", linkedin_url: "https://linkedin.com/in/raj-mehta-tc", phone: "", website: "techcorp.in", source: "apify", personalization: "" },
];

export async function POST() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const jobs = [
    { status: "done", job_title: "VP Marketing", industry: "SaaS", location: "San Francisco, CA", keywords: "Series A funded", target_count: 100, lead_count: 6, completed_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { status: "done", job_title: "CEO", industry: "Real Estate", location: "New York, NY", keywords: "commercial", target_count: 150, lead_count: 4, completed_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { status: "running", job_title: "Head of Growth", industry: "FinTech", location: "London, UK", keywords: "payments", target_count: 200, lead_count: 0, completed_at: null },
    { status: "failed", job_title: "CTO", industry: "Healthcare", location: "Boston, MA", keywords: "telehealth", target_count: 50, lead_count: 0, completed_at: null, error_message: "Apify actor timed out after 300s — try reducing target count or narrowing location." },
    { status: "pending", job_title: "Director of Sales", industry: "Cybersecurity", location: "Austin, TX", keywords: "", target_count: 75, lead_count: 0, completed_at: null },
  ];

  const insertedJobs = [];
  for (const job of jobs) {
    const { data, error } = await supabase.from("scrape_jobs").insert({ user_id: user.id, ...job }).select().single();
    if (error) return NextResponse.json({ error: `Job insert failed: ${error.message}` }, { status: 500 });
    insertedJobs.push(data);
  }

  // Attach leads to the first "done" job (VP Marketing)
  const vpJob = insertedJobs[0];
  const vpLeads = FAKE_LEADS.slice(0, 6).map(l => ({ ...l, job_id: vpJob.id, user_id: user.id }));
  const { error: e1 } = await supabase.from("leads").insert(vpLeads);
  if (e1) return NextResponse.json({ error: `Leads insert (job 1): ${e1.message}` }, { status: 500 });

  // Attach leads to the second "done" job (CEO Real Estate)
  const ceoJob = insertedJobs[1];
  const ceoLeads = FAKE_LEADS.slice(6, 10).map(l => ({ ...l, job_id: ceoJob.id, user_id: user.id }));
  const { error: e2 } = await supabase.from("leads").insert(ceoLeads);
  if (e2) return NextResponse.json({ error: `Leads insert (job 2): ${e2.message}` }, { status: 500 });

  return NextResponse.json({
    success: true,
    jobs: insertedJobs.length,
    leads: vpLeads.length + ceoLeads.length,
  });
}
