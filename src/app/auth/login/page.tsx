"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const stats = [
  { value: "3×", label: "Reply rate" },
  { value: "18m", label: "Per campaign" },
  { value: "97%", label: "Email accuracy" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-[45%] bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="font-extrabold text-sm" style={{ color: "hsl(0 0% 5%)" }}>L</span>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">LeadForge</span>
        </div>
        <div className="relative">
          <h1 className="text-white text-4xl font-extrabold leading-[1.1] tracking-tight mb-4">
            Enrich leads,<br />scale revenue.
          </h1>
          <p className="text-sidebar-foreground text-base leading-relaxed mb-8">
            AI-powered lead generation and personalization for modern sales teams.
          </p>
          <div className="flex gap-3">
            {stats.map(({ value, label }) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <p className="text-white text-xl font-extrabold tabular-nums">{value}</p>
                <p className="text-sidebar-foreground text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/25 text-xs">© 2026 LeadForge. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight mb-1">Welcome back</h2>
            <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-foreground font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
