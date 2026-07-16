const INSTANTLY_BASE = "https://api.instantly.ai/api/v2";

export interface InstantlyCampaign {
  id: string;
  name: string;
  status: number; // 0=drafting, 1=active, 2=paused, 3=completed
  created_at: string;
  updated_at: string;
}

export interface InstantlyAnalytics {
  sent: number;
  contacted: number;
  opened: number;
  unique_opened: number;
  replies: number;
  unique_replies: number;
  clicks: number;
  unique_clicks: number;
  bounced: number;
  unsubscribed: number;
  opportunities: number;
}

export interface InstantlyLeadPushResult {
  total_sent: number;
  leads_uploaded: number;
  duplicated_leads: number;
  skipped_count: number;
  invalid_email_count: number;
}

export async function instantlyFetch<T = unknown>(
  apiKey: string,
  path: string,
  options?: { method?: string; body?: Record<string, unknown> | unknown[]; params?: Record<string, string> }
): Promise<T> {
  const url = new URL(`${INSTANTLY_BASE}${path}`);
  if (options?.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }

  const res = await fetch(url.toString(), {
    method: options?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instantly API error ${res.status}: ${text}`);
  }

  return res.json();
}
