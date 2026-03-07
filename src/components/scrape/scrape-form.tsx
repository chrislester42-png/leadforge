"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTerminal } from "./progress-terminal";

const schema = z.object({
  jobTitle: z.string().min(1, "Required"),
  industry: z.string().min(1, "Required"),
  location: z.string().optional(),
  keywords: z.string().optional(),
  targetCount: z.number().min(10).max(1000),
});

type ScrapeFormData = z.infer<typeof schema>;

export function ScrapeForm() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<ScrapeFormData>({
    resolver: zodResolver(schema),
    defaultValues: { targetCount: 100 },
  });

  async function onSubmit(values: ScrapeFormData) {
    setStarting(true);
    setStartError("");
    const res = await fetch("/api/scrape/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (data.error) { setStartError(data.error); setStarting(false); return; }
    setJobId(data.jobId);
  }

  if (jobId) return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Scrape in progress</h2>
      <ProgressTerminal jobId={jobId} />
      <p className="text-sm text-muted-foreground mt-4">
        You can safely leave this page — the job will continue running.
      </p>
    </div>
  );

  return (
    <Card className="max-w-lg">
      <CardHeader><CardTitle>New Scrape Job</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Job Title</Label>
              <Input placeholder="CEO, Marketing Manager..." {...register("jobTitle")} />
              {errors.jobTitle && <p className="text-destructive text-xs">{errors.jobTitle.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Industry / Niche</Label>
              <Input placeholder="SaaS, Real Estate..." {...register("industry")} />
              {errors.industry && <p className="text-destructive text-xs">{errors.industry.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Location <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input placeholder="New York, USA..." {...register("location")} />
            </div>
            <div className="space-y-1.5">
              <Label>Lead Count</Label>
              <Input type="number" min={10} max={1000} {...register("targetCount", { valueAsNumber: true })} />
              {errors.targetCount && <p className="text-destructive text-xs">{errors.targetCount.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Keywords <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input placeholder="e.g. 'Series A funded', 'hiring'..." {...register("keywords")} />
          </div>
          {startError && <p className="text-destructive text-sm">{startError}</p>}
          <Button type="submit" variant="accent" className="w-full" disabled={starting}>
            {starting ? "Starting..." : "Start Scrape →"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
