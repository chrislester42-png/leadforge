interface EnrichResult {
  email: string | null;
  email_verified: boolean;
}

export async function enrichEmail(
  firstname: string,
  lastname: string,
  company: string,
  website: string,
  apiKey: string
): Promise<EnrichResult> {
  try {
    const res = await fetch("https://api.anymailfinder.com/v5.0/search/person.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        person_name: `${firstname} ${lastname}`.trim(),
        company_name: company,
        company_domain: website,
      }),
    });
    if (!res.ok) return { email: null, email_verified: false };
    const data = await res.json();
    return {
      email: data.email ?? null,
      email_verified: data.validation === "valid",
    };
  } catch {
    return { email: null, email_verified: false };
  }
}
