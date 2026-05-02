-- Hotfix: add SET search_path = public to handle_new_user (Postgres 15+ fix)
-- Run this in Supabase Dashboard → SQL Editor if users get "Database error saving new user"

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
