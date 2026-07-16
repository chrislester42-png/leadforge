import Link from "next/link";
import { Search, Zap, Mail, Send, ArrowRight, CheckCircle, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Source leads from LinkedIn & the web",
    description: "Apify's lead-finder extracts verified B2B contacts matching your exact criteria — title, industry, location — at scale.",
  },
  {
    icon: Mail,
    title: "Enrich with verified emails",
    description: "Anymailfinder finds and verifies professional emails for every lead. Real inboxes, not spam traps.",
  },
  {
    icon: Zap,
    title: "AI personalization at scale",
    description: "Claude writes a unique opening line for every lead using your prompt. Contextual, natural, and fast — not mail-merge templates.",
  },
  {
    icon: Send,
    title: "Push to Instantly in one click",
    description: "Enriched, personalized leads go straight into your Instantly campaign. Scrape to sequence in minutes.",
  },
];

const steps = [
  { number: "01", title: "Configure once", description: "Add your Apify, Anymailfinder, Anthropic, and Instantly keys. Set your AI personalization prompt." },
  { number: "02", title: "Scrape on demand", description: "Enter job title, industry, location, and count. Watch leads appear in real time." },
  { number: "03", title: "Send immediately", description: "Download the CSV or push to Instantly. Every lead has a verified email and a personal opener." },
];

const testimonials = [
  {
    quote: "We replaced a 3-person SDR research process with LeadForge. 400 personalized contacts in 18 minutes. The AI lines are genuinely good — our team thought we wrote them.",
    name: "Marcus R.",
    role: "VP Sales, Series B SaaS",
    stat: "3× reply rate",
  },
  {
    quote: "The Instantly integration is seamless. I scrape, personalize, and launch a campaign before my morning coffee is cold. Nothing else comes close at this price.",
    name: "Priya S.",
    role: "Founder, Outbound Agency",
    stat: "18 min per campaign",
  },
  {
    quote: "I was skeptical about AI openers but these don't read like AI. Reference to the company's recent funding, the person's actual title — it feels researched. Replies prove it.",
    name: "David L.",
    role: "Growth Lead, DevTools startup",
    stat: "41% open rate",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "Solo founders and small teams.",
    features: ["500 leads / month", "Email enrichment", "Claude AI personalization", "CSV export", "Instantly integration"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$149",
    period: "/mo",
    description: "Scaling sales teams that need volume.",
    features: ["5,000 leads / month", "Priority enrichment queue", "Custom AI prompts per campaign", "CSV export", "Instantly integration", "Google Maps fallback", "Priority support"],
    popular: true,
  },
];

const mockLeads = [
  { name: "Sarah Chen", title: "VP Marketing", company: "Lattice", email: "s.chen@lattice.com", personalization: "Your recent post about OKR alignment at scale..." },
  { name: "James Okafor", title: "Head of Growth", company: "Rippling", email: "j.okafor@rippling.com", personalization: "Saw Rippling's expansion into payroll APIs..." },
  { name: "Elena Vasquez", title: "Director of Sales", company: "Outreach", email: "e.vasquez@outreach.io", personalization: "The SDR productivity report you published..." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sidebar flex items-center justify-center">
              <span className="text-accent font-black text-xs">L</span>
            </div>
            <span className="font-bold text-base tracking-tight">LeadForge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Sign in</Link>
            <Link href="/auth/signup" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-85 transition-all duration-200 hover:scale-[1.02]">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — asymmetric layout */}
      <section className="pt-36 pb-20 px-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(ellipse, hsl(82 68% 50%) 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          {/* Left: copy */}
          <div>
            <div className="animate-fade-in inline-flex items-center gap-2 bg-accent-muted rounded px-3 py-1.5 mb-7 text-xs font-semibold text-accent-dim tracking-wide">
              <Zap size={11} />
              AI-powered lead generation
            </div>
            <h1 className="animate-fade-in-up animation-delay-100 text-6xl md:text-7xl font-extrabold leading-[1.04] tracking-tight mb-6">
              Enrich leads.<br />Scale revenue.
            </h1>
            <p className="animate-fade-in-up animation-delay-200 text-lg text-muted-foreground mb-9 leading-relaxed max-w-lg">
              Scrape verified B2B contacts, enrich emails via Anymailfinder, and let Claude write a personalized opener for every single lead — then push straight to Instantly.
            </p>
            <div className="animate-fade-in-up animation-delay-300 flex items-center gap-3 flex-wrap">
              <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:opacity-85 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Start for free <ArrowRight size={15} />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-border hover:bg-secondary transition-colors duration-200">
                See how it works
              </a>
            </div>
            <p className="animate-fade-in-up animation-delay-400 mt-4 text-xs text-muted-foreground">No credit card required · 100 free leads on signup</p>
          </div>

          {/* Right: lead table mockup */}
          <div className="animate-slide-in-right animation-delay-300 hidden lg:block">
            <div className="rounded-2xl bg-sidebar border border-sidebar-border overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="text-sidebar-foreground/40 text-xs font-mono">leads-export.csv — 412 rows</span>
                <div className="w-14" />
              </div>
              <div className="px-4 py-3 border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-accent px-2 py-0.5 rounded bg-accent/10">✓ done</span>
                  <span className="text-xs text-sidebar-foreground/50 font-mono">VP Marketing · SaaS · San Francisco · 412 leads</span>
                </div>
              </div>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-sidebar-border">
                    {["name", "company", "personalization"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-sidebar-foreground/40 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockLeads.map((l, i) => (
                    <tr key={i} className="border-b border-sidebar-border/50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="text-sidebar-foreground font-medium">{l.name}</div>
                        <div className="text-sidebar-foreground/40">{l.title}</div>
                      </td>
                      <td className="px-4 py-3 text-sidebar-foreground/70">{l.company}</td>
                      <td className="px-4 py-3 text-accent/80 max-w-[180px] truncate">{l.personalization}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-sidebar-border flex items-center justify-between">
                <span className="text-xs text-sidebar-foreground/30 font-mono">enriched · personalized · ready</span>
                <div className="w-24 h-1 rounded-full bg-accent/20 overflow-hidden">
                  <div className="h-full w-full bg-accent rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-6 border-y border-border bg-secondary/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Used by teams at</span>
            {["Rippling", "Lattice", "Close", "Outreach", "Apollo", "Salesloft"].map(name => (
              <span key={name} className="text-sm font-semibold text-muted-foreground/50 tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[2fr_3fr] gap-16 items-start">
          {/* Left: sticky header */}
          <div className="md:sticky md:top-28">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">From zero to outreach in minutes</h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-xs">Three steps. No manual research. No stale spreadsheets.</p>
          </div>
          {/* Right: numbered steps vertical stack */}
          <div className="space-y-0 divide-y divide-border">
            {steps.map(({ number, title, description }, i) => (
              <div
                key={number}
                className="animate-fade-in-up py-8 flex gap-6 items-start"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-sidebar flex items-center justify-center shrink-0">
                  <span className="text-accent font-black text-sm font-mono">{number}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-3">Everything you need to build a verified lead list</h2>
            <p className="text-muted-foreground text-lg max-w-lg">One tool. Four stages. Zero manual work.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="animate-fade-in-up bg-card rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group ring-1 ring-black/5"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors duration-300">
                  <Icon size={18} className="text-accent-dim" />
                </div>
                <h3 className="text-base font-bold mb-2 tracking-tight">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-3">Results that speak for themselves</h2>
          </div>
          <div className="space-y-5">
            {/* Featured — full-width dark card */}
            <div className="bg-sidebar rounded-2xl p-8 md:p-10 grid md:grid-cols-[200px_1fr] gap-8 md:gap-12 items-start relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(82_90%_60%_/_0.06)_0%,_transparent_60%)] pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-accent/15 text-accent text-xs font-bold px-2.5 py-1 rounded-md mb-5 tracking-wide">
                  <TrendingUp size={11} />
                  {testimonials[0].stat}
                </div>
                <p className="font-semibold text-white text-sm">{testimonials[0].name}</p>
                <p className="text-sidebar-foreground text-xs mt-0.5">{testimonials[0].role}</p>
              </div>
              <p className="relative text-white/85 text-lg md:text-xl leading-relaxed font-light">&ldquo;{testimonials[0].quote}&rdquo;</p>
            </div>
            {/* Two smaller — 2-col */}
            <div className="grid md:grid-cols-2 gap-5">
              {testimonials.slice(1).map(({ quote, name, role, stat }) => (
                <div key={name} className="bg-card rounded-2xl border border-border p-7 flex flex-col">
                  <div className="inline-flex items-center gap-1.5 bg-accent-muted text-accent-dim text-xs font-bold px-2.5 py-1 rounded-md self-start mb-5 tracking-wide">
                    <TrendingUp size={11} />
                    {stat}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground flex-1 mb-6">&ldquo;{quote}&rdquo;</p>
                  <div className="border-t border-border pt-4">
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight mb-3">Simple pricing, no surprises</h2>
            <p className="text-muted-foreground text-lg">Start free. Scale when you need it.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {pricingPlans.map(({ name, price, period, description, features, popular }) => (
              <div key={name} className={`rounded-2xl p-8 relative flex flex-col ${popular ? "bg-card ring-2 ring-accent/60 shadow-xl shadow-accent/8" : "bg-card ring-1 ring-black/5 shadow-sm"}`}>
                {popular && (
                  <div className="absolute -top-3 left-6 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded tracking-wide">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1">{name}</h3>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="text-5xl font-extrabold tracking-tight">{price}</span>
                  <span className="text-muted-foreground text-sm">{period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle size={14} className="text-accent-dim mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block text-center py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${popular ? "bg-primary text-primary-foreground hover:opacity-85" : "border-2 border-border hover:border-foreground/30"}`}
                >
                  Start free trial
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">All plans include a 7-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-sidebar rounded-3xl p-14 text-center relative overflow-hidden">
            {/* Radial glow — top center */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(82_68%_50%_/_0.12)_0%,_transparent_65%)] pointer-events-none" />
            {/* Radial glow — bottom right */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse,_hsl(82_68%_50%_/_0.05)_0%,_transparent_70%)] pointer-events-none" />
            <div className="relative">
              <h2 className="text-white text-4xl font-extrabold tracking-tight mb-4 leading-tight">
                Get 100 free leads today.
              </h2>
              <p className="text-sidebar-foreground mb-9 text-lg max-w-md mx-auto leading-relaxed">
                Verified emails and Claude-written openers. No card required.
              </p>
              <Link href="/auth/signup" className="inline-flex items-center gap-2.5 bg-accent text-accent-foreground px-8 py-4 rounded-xl text-sm font-bold hover:opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Start for free <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-sidebar flex items-center justify-center">
              <span className="text-accent font-black text-xs">L</span>
            </div>
            <span className="font-bold text-foreground tracking-tight">LeadForge</span>
          </div>
          <p className="text-xs">© 2026 LeadForge. All rights reserved.</p>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-foreground transition-colors">Privacy policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
