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
import { PipelineSteps } from "./pipeline-steps";

const schema = z.object({
  jobTitle: z.string().min(1, "Required"),
  industry: z.string().min(1, "Required"),
  location: z.string().optional(),
  keywords: z.string().optional(),
  targetCount: z.number().min(10).max(1000),
});

type ScrapeFormData = z.infer<typeof schema>;

const cardCls = "border-0 shadow-sm ring-1 ring-black/5 h-full";

export function ScrapeForm() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [activeStage, setActiveStage] = useState("idle");
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">New scrape</h1>
        <p className="text-muted-foreground text-sm">Your job is running. You can safely leave this page.</p>
      </div>
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6 items-stretch">
        <Card className={cardCls}>
          <CardContent className="pt-6">
            <ProgressTerminal jobId={jobId} onStageChange={setActiveStage} />
          </CardContent>
        </Card>
        <Card className={cardCls}>
          <CardHeader><CardTitle>Pipeline</CardTitle></CardHeader>
          <CardContent><PipelineSteps activeStage={activeStage} /></CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">New scrape</h1>
        <p className="text-muted-foreground text-sm">Find professionals and companies to build relationships with.</p>
      </div>
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6 items-stretch">
        {/* Job details card */}
        <Card className={cardCls}>
          <CardHeader><CardTitle>Job details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Job title</Label>
                  <Input placeholder="Owner, Practice Owner, Lead Dentist..." {...register("jobTitle")} />
                  {errors.jobTitle && <p className="text-destructive text-xs">{errors.jobTitle.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Industry / niche</Label>
                  <Input placeholder="Dental, Healthcare, Veterinary..." {...register("industry")} />
                  {errors.industry && <p className="text-destructive text-xs">{errors.industry.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Location <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input placeholder="Texas, Dallas-Fort Worth..." {...register("location")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Lead count</Label>
                  <Input type="number" min={10} max={1000} {...register("targetCount", { valueAsNumber: true })} />
                  {errors.targetCount && <p className="text-destructive text-xs">{errors.targetCount.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Keywords <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input placeholder="e.g. 'dental', 'private practice', 'physician'..." {...register("keywords")} />
              </div>
              {startError && <p className="text-destructive text-sm">{startError}</p>}
              <Button type="submit" variant="accent" className="w-full" disabled={starting}>
                {starting ? "Starting..." : "Start scrape →"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pipeline card */}
        <Card className={cardCls}>
          <CardHeader><CardTitle>Pipeline</CardTitle></CardHeader>
          <CardContent><PipelineSteps activeStage="idle" /></CardContent>
        </Card>
      </div>
    </div>
  );
}
