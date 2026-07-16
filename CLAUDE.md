# LeadForge — CLAUDE.md

## Project Overview

LeadForge is a B2B lead generation SaaS. Users configure their API keys, submit scrape jobs with targeting criteria (job title, industry, location, count), and the platform runs a 3-stage async pipeline:

1. **Scrape** — Apify `code_crafter~lead-finder` pulls LinkedIn leads. Falls back to `compass~crawler-google-places` (Google Maps) if yield is under 50% of target.
2. **Enrich** — Anymailfinder verifies/finds professional emails for each lead.
3. **Personalize** — Claude (`claude-haiku-4-5-20251001`) writes a custom cold-email opener per lead using the user's saved prompt template.

Results are stored in Supabase, downloadable as CSV, or pushed directly to an Instantly campaign.

---

## Tech Stack

- **Framework:** Next.js 14.2.35 (App Router, React 18, TypeScript strict)
- **Styling:** Tailwind CSS 3.4 with a custom HSL design token system
- **UI primitives:** Radix UI (Label, Slot, Switch, Dialog, Tabs, Select, Dropdown)
- **Forms:** React Hook Form + Zod
- **Auth + DB:** Supabase (SSR cookie-based sessions via `@supabase/ssr`)
- **Animation:** CSS keyframes (fade-in-up, slide-in-right) — Framer Motion and GSAP are installed but not yet used
- **Deployment:** Netlify (`@netlify/plugin-nextjs`)

---

## Dev Commands

```bash
npm run dev      # local dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

---

## Environment Variables

All required in `.env.local`. Only two are `NEXT_PUBLIC_` — everything else is server-only via Supabase row data.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

User API keys (Apify, Anymailfinder, Anthropic, Instantly) are stored **per-user in the `user_configs` table**, not in env vars. They are fetched server-side at scrape time.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Landing page (marketing)
│   ├── layout.tsx                        # Root layout (Plus Jakarta Sans font)
│   ├── globals.css                       # Tailwind base + CSS variables + animations
│   ├── auth/
│   │   ├── login/page.tsx                # Login (split-panel layout)
│   │   ├── signup/page.tsx               # Signup with email verification flow
│   │   └── callback/route.ts             # Supabase OAuth/email code exchange
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Wraps all dashboard routes with Sidebar
│   │   ├── dashboard/page.tsx            # Stats cards + recent jobs (Server Component)
│   │   ├── scrape/page.tsx               # Hosts <ScrapeForm />
│   │   ├── config/page.tsx               # API keys + personalization prompt (Client Component)
│   │   └── orders/
│   │       ├── page.tsx                  # All scrape jobs list (Server Component)
│   │       └── [id]/page.tsx             # Job detail + leads table + download + Instantly push
│   └── api/
│       ├── scrape/
│       │   ├── start/route.ts            # POST — creates scrape_job row, returns jobId
│       │   ├── [jobId]/stream/route.ts   # GET — SSE stream running the full pipeline
│       │   └── [jobId]/download/route.ts # GET — streams CSV of leads for a job
│       └── instantly/
│           └── push/route.ts             # POST — batches leads into Instantly campaign
├── components/
│   ├── layout/sidebar.tsx                # Dark sidebar nav with sign-out
│   ├── scrape/
│   │   ├── scrape-form.tsx               # Form → POST /api/scrape/start → renders terminal
│   │   └── progress-terminal.tsx         # SSE consumer, renders live log + progress bar
│   ├── orders/
│   │   └── instantly-push-button.tsx     # Inline campaign-name input → POST /api/instantly/push
│   └── ui/
│       ├── button.tsx                    # CVA variants: default, accent, outline, ghost, destructive
│       ├── input.tsx                     # Styled <input>
│       ├── label.tsx                     # Radix Label wrapper
│       ├── card.tsx                      # Card, CardHeader, CardTitle, CardContent
│       └── badge.tsx                     # CVA variants including status: pending/running/done/failed
└── lib/
    ├── supabase.ts                       # createBrowserClient (MUST use @supabase/ssr, not supabase-js)
    ├── apify.ts                          # runApifyActor() + mapLeadFinderResult() + mapGMapsResult()
    ├── anymailfinder.ts                  # enrichEmail() — finds + verifies email for a person
    ├── claude.ts                         # generatePersonalization() — calls claude-haiku with user prompt
    └── utils.ts                          # cn() (clsx + tailwind-merge)
```

---

## Database Schema (Supabase / PostgreSQL)

### `user_configs`
One row per user. Stores all API keys and the personalization prompt.
| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | FK → auth.users, UNIQUE |
| `apify_key` | text | |
| `anymailfinder_key` | text | |
| `anthropic_key` | text | |
| `instantly_key` | text | Optional |
| `personalization_prompt` | text | Supports `{{firstname}}`, `{{title}}`, `{{company}}`, `{{location}}` |

### `scrape_jobs`
One row per job submission.
| Column | Type | Notes |
|---|---|---|
| `status` | text | `pending` → `running` → `enriching` → `personalizing` → `done` \| `failed` |
| `job_title`, `industry`, `location`, `keywords` | text | Targeting params |
| `target_count` | int | Requested lead count (10–1000) |
| `lead_count` | int | Final count written at completion |
| `error_message` | text | Set on failure |

### `leads`
One row per scraped lead.
| Column | Type | Notes |
|---|---|---|
| `job_id` | uuid | FK → scrape_jobs |
| `email` | text | May be null if enrichment failed |
| `email_verified` | bool | True if Apify provided it or Anymailfinder validated it |
| `personalization` | text | Claude-generated opener (only for leads with email) |
| `source` | text | `apify` or `gmaps` |

All tables have RLS enabled — users only see their own rows.

---

## Auth Pattern

**Critical:** The browser Supabase client uses `createBrowserClient` from `@supabase/ssr`, NOT `createClient` from `@supabase/supabase-js`. Using the wrong one stores sessions in localStorage, which middleware cannot read, causing a redirect loop on login.

- `src/lib/supabase.ts` → `createBrowserClient` (browser)
- Server components / API routes → `createServerClient` from `@supabase/ssr` with `cookies()`
- `src/middleware.ts` → protects all non-auth, non-API, non-root routes; redirects logged-in users away from `/auth/*`

---

## Scrape Pipeline (SSE Stream)

`GET /api/scrape/[jobId]/stream` is the core of the app. It:
1. Updates job status to `running`, emits SSE events throughout
2. Calls Apify `code_crafter~lead-finder` with search query + location + maxResults
3. If yield < 50% of target and industry is set, falls back to Google Maps actor
4. Loops through leads calling `enrichEmail()` (batching progress events every 10)
5. Loops through enriched leads calling `generatePersonalization()` (events every 5) — only for leads that have an email
6. Bulk-inserts leads in batches of 25
7. Updates job to `done` with final count, or `failed` with error message
8. `maxDuration = 300` (5-min Vercel/Netlify function timeout)

The client-side `<ProgressTerminal />` consumes this stream via `EventSource` and renders a dark terminal UI with color-coded stage labels and a progress bar.

---

## Design System

Colors are all CSS HSL custom properties defined in `globals.css`. Key tokens:
- `--accent`: lime-green (`82 90% 60%`) — primary CTA color
- `--sidebar`: near-black (`0 0% 6%`) — used for sidebar, dark cards, terminal
- `--status-{pending,running,done,failed}` + `-bg` pairs for badge variants

Button variants: `default` (dark), `accent` (lime), `outline`, `ghost`, `destructive`
Badge variants: `default`, `accent`, `secondary`, `outline`, `destructive`, `pending`, `running`, `done`, `failed`

All dashboard pages have `max-w-5xl` or `max-w-2xl` containers. Typography uses Plus Jakarta Sans via `next/font/google`.

---

## Key Conventions

- Server Components for all data-fetching dashboard pages; `"use client"` only where interactivity is needed
- Supabase server clients always pass `setAll: () => {}` in read-only API routes (no cookie mutation needed)
- CSV export escapes double-quotes by doubling them (`"` → `""`)
- Instantly API is called in batches of 100 leads per request
- Claude model is hardcoded to `claude-haiku-4-5-20251001` in `src/lib/claude.ts`; `max_tokens: 150`
- Apify polling: checks status every 5 seconds, max 60 iterations (5 minutes)

---

## Known Tech Debt

- `src/app/auth/callback/route.ts` — `setAll` writes cookies to the cookie store directly. Works, but Next.js warns about mutating cookies in a GET handler in some versions.
- Framer Motion (`framer-motion`) and GSAP (`gsap`) are installed but unused — remove if not planning to use.
- No error boundary on the dashboard — a failing Supabase query will surface as an unhandled server error.
- The Apify actor ID `code_crafter~lead-finder` is hardcoded. Consider making it configurable if switching actors.
