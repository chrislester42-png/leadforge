import Link from "next/link";
import { Search, Zap, Mail, Send, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Source Leads from LinkedIn & Web",
    description: "Powered by Apify's lead-finder, we extract verified B2B contacts from LinkedIn and the web — matching your exact target profile by title, industry, and location.",
  },
  {
    icon: Mail,
    title: "Enrich with Verified Emails",
    description: "Anymailfinder finds and verifies professional email addresses for every lead, so you land in real inboxes — not spam folders.",
  },
  {
    icon: Zap,
    title: "AI-Powered Personalization",
    description: "Claude writes a unique personalization line for every single lead using your custom prompt. Not templates — real, contextual openers at scale.",
  },
  {
    icon: Send,
    title: "Push to Instantly in One Click",
    description: "Your enriched, personalized leads land directly inside your Instantly campaign. From scrape to sequence in minutes.",
  },
];

const steps = [
  { number: "01", title: "Configure", description: "Add your Apify, Anymailfinder, Anthropic, and Instantly API keys. Set your AI personalization prompt once." },
  { number: "02", title: "Scrape", description: "Enter your target: job title, industry, location, and lead count. LeadForge handles the rest in real time." },
  { number: "03", title: "Send", description: "Download your CSV or push directly to an Instantly campaign. Every lead enriched, every opener personalized." },
];

const testimonials = [
  { quote: "I went from manually researching leads to having 500 personalized contacts ready in under 20 minutes. Game changer.", name: "Alex M.", role: "Founder, B2B SaaS" },
  { quote: "The AI personalizations are genuinely good — not the generic stuff. Our reply rate jumped 3x.", name: "Sarah K.", role: "Head of Sales, Tech Startup" },
  { quote: "Finally a tool that handles the whole pipeline. Scrape → enrich → personalize → send. Done.", name: "James T.", role: "Growth Lead, Agency" },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for solo founders and small teams.",
    features: ["500 leads/month", "Email enrichment included", "Claude AI personalization", "CSV export", "Instantly integration"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$149",
    period: "/month",
    description: "For scaling sales teams that need volume.",
    features: ["5,000 leads/month", "Priority enrichment", "Custom AI prompts", "CSV export", "Instantly integration", "Google Maps fallback", "Priority support"],
    popular: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar flex items-center justify-center">
              <span className="text-accent font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-lg">LeadForge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8 text-sm font-medium" style={{ color: "hsl(82 100% 40%)" }}>
            <Zap size={14} /> AI-powered lead generation
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            Enrich Leads,<br />Scale Your Revenue.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            LeadForge scrapes verified B2B contacts, enriches emails, and uses Claude AI to write personalized openers — ready for your Instantly campaigns.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/signup" className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-base font-semibold hover:opacity-90 transition-all hover:scale-[1.02]">
              Get 100 free leads <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-medium border border-border hover:bg-secondary transition-colors">
              See how it works
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No credit card required. 100 free leads on signup.</p>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-8 border-y border-border bg-secondary/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground font-medium mb-4">Trusted by sales teams, founders, and recruiters</p>
          <div className="flex items-center justify-center gap-10 opacity-40 text-sm font-semibold tracking-widest">
            {["ACME CORP", "GROWTHCO", "SALESIO", "OUTBOUND HQ", "PIPELINE"].map(name => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">From zero to outreach in minutes</h2>
            <p className="text-muted-foreground text-lg">Three steps. No manual work. No stale data.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ number, title, description }) => (
              <div key={number}>
                <div className="text-6xl font-bold mb-4" style={{ color: "hsl(82 100% 68% / 0.25)" }}>{number}</div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to build a verified lead list</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-card rounded-2xl border border-border p-8 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Icon size={20} style={{ color: "hsl(82 100% 45%)" }} />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">What our customers say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role }) => (
              <div key={name} className="bg-card rounded-2xl border border-border p-6">
                <p className="text-muted-foreground mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Scale when you&apos;re ready.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {pricingPlans.map(({ name, price, period, description, features, popular }) => (
              <div key={name} className={`rounded-2xl border p-8 relative ${popular ? "border-accent bg-card shadow-lg" : "border-border bg-card"}`}>
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{price}</span>
                  <span className="text-muted-foreground">{period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} style={{ color: "hsl(82 100% 45%)" }} className="shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all ${popular ? "bg-primary text-primary-foreground hover:opacity-90" : "border border-border hover:bg-secondary"}`}
                >
                  Start free trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-sidebar rounded-3xl p-12">
            <h2 className="text-white text-4xl font-bold mb-4">Get started with 100 free leads today.</h2>
            <p className="text-sidebar-foreground mb-8">Find professional emails and generate personalized openers in seconds.</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-accent text-black px-8 py-4 rounded-xl text-base font-bold hover:scale-[1.02] transition-transform">
              Start for free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-sidebar flex items-center justify-center">
              <span className="text-accent font-bold text-xs">L</span>
            </div>
            <span className="font-semibold text-foreground">LeadForge</span>
          </div>
          <p>© 2026 LeadForge. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
