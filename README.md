# LeadForge

B2B lead generation SaaS. Configure your API keys, submit a scrape job with targeting criteria (job title, industry, location, count), and the platform runs a three-stage async pipeline:

1. **Scrape** — pulls LinkedIn leads via Apify, with automatic fallback to Google Maps data when yield is under 50% of target
2. **Enrich** — finds and verifies professional emails for each lead via Anymailfinder
3. **Personalize** — Claude writes a custom cold-email opener per lead using the user's saved prompt template

Results are stored in Supabase, downloadable as CSV, or pushed directly to an Instantly campaign.

## Tech stack

- Next.js 14 (App Router) + React 18 + TypeScript (strict)
- Tailwind CSS with a custom HSL design-token system
- Radix UI primitives, React Hook Form + Zod
- Supabase (auth + database, SSR cookie sessions)
- Anthropic Claude API for per-lead personalization
- Deployed on Netlify

## Running locally

```bash
npm install
npm run dev
```

Requires a `.env.local` with Supabase credentials; per-user API keys (Apify, Anymailfinder, Anthropic, Instantly) are configured in-app and stored server-side.

## Structure

- `src/app/(dashboard)/` — dashboard, scrape job form, order history, config
- `src/app/api/` — pipeline routes (scrape, enrich, personalize, Instantly push)
- `supabase/` — database schema and migrations
