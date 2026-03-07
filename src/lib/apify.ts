const APIFY_BASE = "https://api.apify.com/v2";

export async function runApifyActor(
  actorId: string,
  input: Record<string, unknown>,
  apiKey: string
): Promise<unknown[]> {
  const startRes = await fetch(`${APIFY_BASE}/acts/${actorId}/runs?token=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!startRes.ok) throw new Error(`Apify start failed: ${await startRes.text()}`);
  const { data: { id: runId } } = await startRes.json();

  // Poll until finished (max 5 minutes)
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${apiKey}`);
    const { data: { status } } = await statusRes.json();
    if (status === "SUCCEEDED") break;
    if (status === "FAILED" || status === "ABORTED") throw new Error(`Apify run ${status}`);
  }

  const dataRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}/dataset/items?token=${apiKey}&format=json`);
  if (!dataRes.ok) throw new Error("Failed to fetch Apify results");
  return dataRes.json();
}

export function mapLeadFinderResult(item: Record<string, unknown>) {
  return {
    firstname: (item.firstName ?? item.first_name ?? "") as string,
    lastname: (item.lastName ?? item.last_name ?? "") as string,
    email: (item.email ?? "") as string,
    company: (item.company ?? item.companyName ?? "") as string,
    title: (item.jobTitle ?? item.title ?? item.position ?? "") as string,
    location: (item.location ?? item.country ?? "") as string,
    linkedin_url: (item.linkedInUrl ?? item.linkedin ?? "") as string,
    phone: (item.phone ?? "") as string,
    website: (item.companyWebsite ?? item.website ?? "") as string,
    source: "apify" as const,
  };
}

export function mapGMapsResult(item: Record<string, unknown>) {
  return {
    firstname: "",
    lastname: "",
    email: (item.email ?? "") as string,
    company: (item.title ?? item.name ?? "") as string,
    title: "",
    location: (item.address ?? item.city ?? "") as string,
    linkedin_url: "",
    phone: (item.phone ?? item.phoneUnformatted ?? "") as string,
    website: (item.website ?? "") as string,
    source: "gmaps" as const,
  };
}
