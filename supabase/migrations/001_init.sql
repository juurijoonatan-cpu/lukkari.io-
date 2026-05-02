-- Run this in Supabase SQL Editor once, before deploying the app.

CREATE TABLE IF NOT EXISTS profiles (
  id                      UUID REFERENCES auth.users PRIMARY KEY,
  stripe_customer_id      TEXT UNIQUE,
  subscription_status     TEXT NOT NULL DEFAULT 'none',
  subscription_period_end TIMESTAMPTZ,
  ai_requests_this_month  INT NOT NULL DEFAULT 0,
  requests_reset_at       TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now())
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "own_profile_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
