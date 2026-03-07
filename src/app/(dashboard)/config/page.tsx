"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  apify_key: z.string().min(1, "Required"),
  anymailfinder_key: z.string().min(1, "Required"),
  anthropic_key: z.string().min(1, "Required"),
  instantly_key: z.string().optional(),
  personalization_prompt: z.string().min(10, "Prompt too short"),
});

type ConfigForm = z.infer<typeof schema>;

export default function ConfigPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ConfigForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      personalization_prompt: "Write a 1-2 sentence personalized opening for a cold email to {{firstname}} who works as {{title}} at {{company}}. Reference something specific about their role. Be natural and conversational.",
    },
  });

  useEffect(() => {
    async function loadConfig() {
      const supabase = createClient();
      const { data } = await supabase.from("user_configs").select("*").single();
      if (data) reset(data);
    }
    loadConfig();
  }, [reset]);

  async function onSubmit(values: ConfigForm) {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("user_configs").upsert({ ...values, user_id: user!.id });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Configuration</h1>
      <p className="text-muted-foreground text-sm mb-8">Set up your API keys and personalization settings.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>API Keys</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "apify_key" as const, label: "Apify API Key", placeholder: "apify_api_..." },
              { name: "anymailfinder_key" as const, label: "Anymailfinder API Key", placeholder: "amf_..." },
              { name: "anthropic_key" as const, label: "Anthropic API Key", placeholder: "sk-ant-..." },
              { name: "instantly_key" as const, label: "Instantly API Key (optional)", placeholder: "inst_..." },
            ].map(({ name, label, placeholder }) => (
              <div key={name} className="space-y-1.5">
                <Label htmlFor={name}>{label}</Label>
                <Input id={name} type="password" placeholder={placeholder} {...register(name)} />
                {errors[name] && <p className="text-destructive text-xs">{errors[name]?.message}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Personalization Prompt</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Claude uses this prompt to generate the <code className="bg-muted px-1 rounded">{"{{personalization}}"}</code> column.
              Available variables: <code className="bg-muted px-1 rounded">{"{{firstname}}"}</code>, <code className="bg-muted px-1 rounded">{"{{title}}"}</code>, <code className="bg-muted px-1 rounded">{"{{company}}"}</code>
            </p>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              {...register("personalization_prompt")}
            />
            {errors.personalization_prompt && <p className="text-destructive text-xs mt-1">{errors.personalization_prompt.message}</p>}
          </CardContent>
        </Card>

        <Button type="submit" variant="accent" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Configuration"}
        </Button>
      </form>
    </div>
  );
}
