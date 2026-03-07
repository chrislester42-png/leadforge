-- user_configs: one row per user, stores API keys
CREATE TABLE user_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  apify_key text,
  anymailfinder_key text,
  anthropic_key text,
  instantly_key text,
  personalization_prompt text DEFAULT 'Write a 1-2 sentence personalized opening for a cold email to {{firstname}} who works as {{title}} at {{company}}. Reference something specific about their role or company. Be natural and conversational.',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- scrape_jobs: one row per scrape job
CREATE TABLE scrape_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  -- pending | running | enriching | personalizing | done | failed
  job_title text,
  industry text,
  location text,
  keywords text,
  target_count int DEFAULT 100,
  lead_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  error_message text
);

-- leads: one row per scraped lead
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES scrape_jobs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  firstname text,
  lastname text,
  email text,
  email_verified bool DEFAULT false,
  company text,
  title text,
  location text,
  linkedin_url text,
  phone text,
  website text,
  source text, -- 'apify' | 'gmaps'
  personalization text,
  created_at timestamptz DEFAULT now()
);

-- RLS: users only see their own rows
ALTER TABLE user_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_configs_own" ON user_configs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "scrape_jobs_own" ON scrape_jobs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "leads_own" ON leads FOR ALL USING (user_id = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER user_configs_updated_at
  BEFORE UPDATE ON user_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
