"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Check, Loader2 } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: number;
}

interface PushResult {
  success: boolean;
  count: number;
  duplicated: number;
  campaignName: string;
}

interface SendToInstantlyDialogProps {
  jobId: string;
  leadCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendToInstantlyDialog({
  jobId,
  leadCount,
  open,
  onOpenChange,
}: SendToInstantlyDialogProps) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [pushing, setPushing] = useState(false);
  const [result, setResult] = useState<PushResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoadingCampaigns(true);
    fetch("/api/instantly/campaigns?limit=50&status=1")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCampaigns(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setCampaigns(data.data);
        } else {
          setCampaigns([]);
        }
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoadingCampaigns(false));
  }, [open]);

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handlePush() {
    setPushing(true);
    setError(null);

    try {
      let campaignId: string;
      let campaignName: string;

      if (mode === "existing") {
        if (!selectedId) return;
        campaignId = selectedId;
        campaignName =
          campaigns.find((c) => c.id === selectedId)?.name ?? "Campaign";
      } else {
        if (!newName.trim()) return;
        const createRes = await fetch("/api/instantly/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName.trim() }),
        });
        if (!createRes.ok) {
          const err = await createRes.json();
          throw new Error(err.error || "Failed to create campaign");
        }
        const created = await createRes.json();
        campaignId = created.id;
        campaignName = newName.trim();
      }

      const pushRes = await fetch("/api/instantly/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, campaignId }),
      });

      if (!pushRes.ok) {
        const err = await pushRes.json();
        throw new Error(err.error || "Failed to push leads");
      }

      const pushData = await pushRes.json();
      setResult({
        success: true,
        count: pushData.count ?? 0,
        duplicated: pushData.duplicated ?? 0,
        campaignName,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPushing(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      // Reset all states on close
      setMode("existing");
      setCampaigns([]);
      setSelectedId(null);
      setSearchQuery("");
      setNewName("");
      setPushing(false);
      setResult(null);
      setError(null);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {result ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <Check className="text-green-600" size={24} />
            </div>
            <p className="font-semibold mb-1">
              {result.count} leads sent to {result.campaignName}
            </p>
            {result.duplicated > 0 && (
              <p className="text-sm text-muted-foreground">
                {result.duplicated} duplicates skipped
              </p>
            )}
            <Button
              variant="accent"
              className="mt-4"
              onClick={() => handleOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Send to Instantly</DialogTitle>
              <DialogDescription>
                {leadCount} leads with emails ready to send
              </DialogDescription>
            </DialogHeader>

            {/* Mode toggle */}
            <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-4">
              <button
                type="button"
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  mode === "existing"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setMode("existing")}
              >
                Existing campaign
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  mode === "new"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setMode("new")}
              >
                New campaign
              </button>
            </div>

            {mode === "existing" ? (
              <>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    className="pl-9"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1 mt-3">
                  {loadingCampaigns ? (
                    <div className="flex justify-center py-8">
                      <Loader2 size={20} className="animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredCampaigns.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No active campaigns found
                    </p>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                          selectedId === campaign.id
                            ? "ring-2 ring-accent bg-accent/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedId(campaign.id)}
                      >
                        <span className="text-sm font-medium">
                          {campaign.name}
                        </span>
                        {selectedId === campaign.id && (
                          <Check size={14} className="text-accent shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Campaign name
                </label>
                <Input
                  placeholder="Q2 Outreach"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handlePush}
                disabled={
                  pushing ||
                  (mode === "existing" ? !selectedId : !newName.trim())
                }
              >
                {pushing && (
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                )}
                {mode === "existing"
                  ? `Send ${leadCount} leads`
                  : `Create & Send ${leadCount} leads`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
