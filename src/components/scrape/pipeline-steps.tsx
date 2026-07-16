"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_ORDER = ["scraping", "enriching", "personalizing", "done"] as const;
type KnownStage = (typeof STAGE_ORDER)[number];

const STEPS: { label: string; description: string; stage: KnownStage }[] = [
  {
    label: "Apify extraction",
    description: "Sourcing contacts from LinkedIn & web",
    stage: "scraping",
  },
  {
    label: "Anymailfinder enrichment",
    description: "Verifying professional inboxes",
    stage: "enriching",
  },
  {
    label: "AI personalization",
    description: "Claude writes a unique opener per lead",
    stage: "personalizing",
  },
  {
    label: "Completion & output",
    description: "Ready to export or push to Instantly",
    stage: "done",
  },
];

function getStatus(stepStage: KnownStage, activeStage: string): "idle" | "active" | "done" {
  const activeIdx = STAGE_ORDER.indexOf(activeStage as KnownStage);
  const stepIdx = STAGE_ORDER.indexOf(stepStage);
  if (activeIdx === -1) return "idle";
  if (stepIdx < activeIdx) return "done";
  if (stepIdx === activeIdx) return "active";
  return "idle";
}

export function PipelineSteps({ activeStage }: { activeStage: string }) {
  return (
    <div className="h-full">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/60 mb-8">
        Pipeline
      </p>
      <div>
        {STEPS.map((step, i) => {
          const status = getStatus(step.stage, activeStage);
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.label} className="flex gap-4">
              {/* Connector column */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500",
                    status === "done" && "border-accent bg-accent",
                    status === "active" && "border-accent bg-accent/10",
                    status === "idle" && "border-border bg-transparent"
                  )}
                >
                  {status === "done" ? (
                    <Check size={12} strokeWidth={2.5} className="text-accent-foreground" />
                  ) : (
                    <span
                      className={cn(
                        "text-[11px] font-bold leading-none",
                        status === "active" ? "text-accent-dim" : "text-muted-foreground/30"
                      )}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-px flex-1 my-2 min-h-[32px] transition-colors duration-700",
                      status === "done" ? "bg-accent/40" : "bg-border"
                    )}
                  />
                )}
              </div>

              {/* Text column */}
              <div className={cn("pb-8", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-sm font-semibold leading-snug transition-colors duration-300",
                    status === "done" && "text-muted-foreground",
                    status === "active" && "text-foreground",
                    status === "idle" && "text-muted-foreground/50"
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    "text-xs mt-1 leading-relaxed transition-colors duration-300",
                    status === "active" ? "text-muted-foreground" : "text-muted-foreground/40"
                  )}
                >
                  {step.description}
                </p>
                {status === "active" && (
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-accent-dim text-[11px] font-medium">Running</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
