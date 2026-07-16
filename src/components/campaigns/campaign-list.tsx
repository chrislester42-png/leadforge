"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateCampaignDialog } from "./create-campaign-dialog";
import {
  Plus,
  Megaphone,
  ExternalLink,
  Pause,
  Play,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  status: number;
  created_at: string;
}

interface CampaignAnalytics {
  sent: number;
  unique_opened: number;
  unique_replies: number;
  unique_clicks: number;
}

const STATUS_LABEL: Record<number, string> = {
  0: "draft",
  1: "active",
  2: "paused",
  3: "completed",
};

const STATUS_VARIANT: Record<number, "secondary" | "done" | "pending"> = {
  0: "secondary",
  1: "done",
  2: "pending",
  3: "secondary",
};

function rate(numerator: number, denominator: number): string {
  return denominator > 0
    ? (numerator / denominator * 100).toFixed(1) + "%"
    : "--";
}

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<
    Record<string, CampaignAnalytics | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noKey, setNoKey] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoKey(false);

    try {
      const res = await fetch("/api/instantly/campaigns?limit=50");
      const data = await res.json();

      if (data.error) {
        if (
          data.error.toLowerCase().includes("no instantly api key") ||
          data.error.toLowerCase().includes("api key")
        ) {
          setNoKey(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error);
      }

      const list: Campaign[] = Array.isArray(data) ? data : data.data ?? [];
      setCampaigns(list);
      setLoading(false);

      // Fetch analytics for each campaign in parallel
      for (const campaign of list) {
        fetch(`/api/instantly/campaigns/${campaign.id}/analytics`)
          .then((r) => r.json())
          .then((a) => {
            if (a.error) {
              setAnalytics((prev) => ({ ...prev, [campaign.id]: null }));
            } else {
              // Analytics may come back as an array with one entry or as an object
              const entry = Array.isArray(a) ? a[0] : a;
              setAnalytics((prev) => ({
                ...prev,
                [campaign.id]: {
                  sent: entry?.sent ?? 0,
                  unique_opened: entry?.unique_opened ?? 0,
                  unique_replies: entry?.unique_replies ?? 0,
                  unique_clicks: entry?.unique_clicks ?? 0,
                },
              }));
            }
          })
          .catch(() => {
            setAnalytics((prev) => ({ ...prev, [campaign.id]: null }));
          });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch campaigns");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  async function handleToggle(campaign: Campaign) {
    setTogglingId(campaign.id);
    const action = campaign.status === 1 ? "pause" : "activate";

    try {
      const res = await fetch(
        `/api/instantly/campaigns/${campaign.id}/toggle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to toggle campaign");
      }

      await fetchCampaigns();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to toggle campaign");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">
            Campaigns
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your Instantly email campaigns.
          </p>
        </div>
        <Button variant="accent" onClick={() => setCreateOpen(true)}>
          <Plus size={16} className="mr-2" />
          New campaign
        </Button>
      </div>

      {/* No API key */}
      {noKey && (
        <Card>
          <CardContent className="pt-6">
            <div className="py-10 flex flex-col items-center text-center">
              <h3 className="font-semibold text-sm mb-1">
                No Instantly API key configured
              </h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-xs">
                Add your Instantly API key in settings to manage campaigns.
              </p>
              <Link
                href="/config"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-85 transition-all"
              >
                Go to settings
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading skeletons */}
      {loading && !noKey && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-muted h-40"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="py-10 flex flex-col items-center text-center">
              <h3 className="font-semibold text-sm mb-1 text-destructive">
                Something went wrong
              </h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-xs">
                {error}
              </p>
              <Button variant="outline" onClick={fetchCampaigns}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !noKey && !error && campaigns.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="py-14 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Megaphone size={20} className="text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-sm mb-1">No campaigns yet</h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-xs">
                Create your first Instantly campaign to start sending emails.
              </p>
              <Button variant="accent" onClick={() => setCreateOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign grid */}
      {!loading && !noKey && !error && campaigns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map((campaign) => {
            const a = analytics[campaign.id];
            const analyticsLoading = a === undefined;

            return (
              <Card
                key={campaign.id}
                className="border-0 shadow-sm ring-1 ring-black/5"
              >
                <CardContent className="pt-5 pb-5">
                  {/* Row 1: Name + badge + actions */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm truncate">
                        {campaign.name}
                      </span>
                      <Badge
                        variant={STATUS_VARIANT[campaign.status] ?? "secondary"}
                      >
                        {STATUS_LABEL[campaign.status] ?? "unknown"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {(campaign.status === 1 || campaign.status === 2) && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={togglingId === campaign.id}
                          onClick={() => handleToggle(campaign)}
                        >
                          {togglingId === campaign.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : campaign.status === 1 ? (
                            <Pause size={14} />
                          ) : (
                            <Play size={14} />
                          )}
                        </Button>
                      )}
                      <a
                        href={`https://app.instantly.ai/app/campaign/${campaign.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm" asChild>
                          <span>
                            <ExternalLink size={14} />
                          </span>
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Row 2: Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase">
                        Sent
                      </div>
                      <div className="text-lg font-extrabold tabular-nums mt-0.5">
                        {analyticsLoading ? (
                          <span className="animate-pulse bg-muted rounded w-12 h-5 inline-block" />
                        ) : a ? (
                          a.sent.toLocaleString()
                        ) : (
                          "--"
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase">
                        Opens
                      </div>
                      <div className="text-lg font-extrabold tabular-nums mt-0.5">
                        {analyticsLoading ? (
                          <span className="animate-pulse bg-muted rounded w-12 h-5 inline-block" />
                        ) : a ? (
                          rate(a.unique_opened, a.sent)
                        ) : (
                          "--"
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase">
                        Replies
                      </div>
                      <div className="text-lg font-extrabold tabular-nums mt-0.5">
                        {analyticsLoading ? (
                          <span className="animate-pulse bg-muted rounded w-12 h-5 inline-block" />
                        ) : a ? (
                          rate(a.unique_replies, a.sent)
                        ) : (
                          "--"
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase">
                        Clicks
                      </div>
                      <div className="text-lg font-extrabold tabular-nums mt-0.5">
                        {analyticsLoading ? (
                          <span className="animate-pulse bg-muted rounded w-12 h-5 inline-block" />
                        ) : a ? (
                          rate(a.unique_clicks, a.sent)
                        ) : (
                          "--"
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create campaign dialog */}
      <CreateCampaignDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={fetchCampaigns}
      />
    </div>
  );
}
