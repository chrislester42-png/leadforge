"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

const bullets = [
  "Verified emails via Anymailfinder",
  "AI personalizations with Claude",
  "One-click Instantly integration",
];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    // If session is immediately available, email confirmation is disabled — go straight to dashboard
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setSuccess(true);
  }

  if (success) return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="text-center max-w-sm px-6">
        <div className="w-14 h-14 rounded-2xl bg-accent-muted flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={24} className="text-accent-dim" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-2">Check your email</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          We sent a confirmation link to <strong className="text-foreground">{email}</strong>.<br />
          Click it to activate your account.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-[45%] bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
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
            Start finding<br />verified leads today.
          </h1>
          <p className="text-sidebar-foreground text-base leading-relaxed mb-8">
            Set up in minutes. 100 free leads included. No credit card required.
          </p>
          <ul className="space-y-3">
            {bullets.map(b => (
              <li key={b} className="flex items-center gap-3 text-sm text-sidebar-foreground">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-white/25 text-xs">© 2026 LeadForge. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight mb-1">Create your account</h2>
            <p className="text-muted-foreground text-sm">Start scraping verified leads in minutes</p>
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
                placeholder="Min. 8 characters"
                minLength={8}
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-foreground font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
