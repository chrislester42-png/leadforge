"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SseEvent {
  stage: string;
  progress?: number;
  total?: number;
  message: string;
}

interface ProgressTerminalProps {
  jobId: string;
  onStageChange?: (stage: string) => void;
}

export function ProgressTerminal({ jobId, onStageChange }: ProgressTerminalProps) {
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentTotal, setCurrentTotal] = useState(100);
  const logRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const es = new EventSource(`/api/scrape/${jobId}/stream`);

    es.onmessage = (e) => {
      const data: SseEvent = JSON.parse(e.data);
      setEvents(prev => [...prev, data]);
      if (data.progress !== undefined) setCurrentProgress(data.progress);
      if (data.total !== undefined) setCurrentTotal(data.total);
      onStageChange?.(data.stage);
      if (data.stage === "done") { setDone(true); es.close(); router.refresh(); }
      if (data.stage === "error") { setError(data.message); es.close(); }
    };

    es.onerror = () => { setError("Connection lost."); es.close(); };

    return () => es.close();
  }, [jobId, router]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events]);

  const pct = currentTotal > 0 ? Math.round((currentProgress / currentTotal) * 100) : 0;
  const stageColors: Record<string, string> = {
    scraping: "text-blue-400",
    enriching: "text-purple-400",
    personalizing: "text-yellow-400",
    done: "text-green-400",
    error: "text-red-400",
  };

  return (
    <div className="rounded-2xl bg-sidebar border border-white/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-white/40 text-xs ml-2 font-mono">leadforge — scrape progress</span>
      </div>

      <div ref={logRef} className="h-64 overflow-y-auto px-4 py-3 font-mono text-xs space-y-1">
        {events.map((e, i) => (
          <p key={i} className={stageColors[e.stage] ?? "text-white/70"}>
            <span className="text-white/30">[{e.stage}]</span> {e.message}
          </p>
        ))}
        {!events.length && <p className="text-white/30 animate-pulse">Connecting...</p>}
      </div>

      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/50 text-xs">{events[events.length - 1]?.stage ?? "waiting"}</span>
          <span className="text-white/70 text-xs font-mono">{done ? 100 : pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${done ? 100 : pct}%` }}
          />
        </div>
      </div>

      {done && (
        <div className="px-4 py-3 bg-green-500/10 border-t border-green-500/20">
          <p className="text-green-400 text-sm font-medium">
            ✓ Scrape complete!{" "}
            <Link href={`/orders/${jobId}`} className="underline hover:no-underline">
              View results →
            </Link>
          </p>
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/20">
          <p className="text-red-400 text-sm">✗ {error}</p>
        </div>
      )}
    </div>
  );
}
