"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function InstantlyPushButton({ jobId }: { jobId: string }) {
  const [campaignName, setCampaignName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);
  const [showInput, setShowInput] = useState(false);

  async function handlePush() {
    if (!campaignName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/instantly/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, campaignName }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    setShowInput(false);
  }

  if (result?.success) return (
    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      <span>✓</span> {result.count} leads sent to <strong>{campaignName}</strong>
    </div>
  );

  if (!showInput) return (
    <Button variant="outline" size="sm" onClick={() => setShowInput(true)}>
      <Send size={14} className="mr-1.5" /> Send to Instantly
    </Button>
  );

  return (
    <div className="flex items-center gap-2">
      <input
        className="h-9 rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Campaign name..."
        value={campaignName}
        onChange={e => setCampaignName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handlePush()}
        autoFocus
      />
      <Button variant="accent" size="sm" onClick={handlePush} disabled={loading || !campaignName.trim()}>
        {loading ? "Sending..." : "Push"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setShowInput(false)}>Cancel</Button>
    </div>
  );
}
