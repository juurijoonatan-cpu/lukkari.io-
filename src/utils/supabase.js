import { createClient } from '@supabase/supabase-js';

// Anon key is intentionally public — protected by Row Level Security, not secrecy.
// These are the same values as VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const SUPABASE_URL = "https://dceaizexommjtzkvveyv.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWFpemV4b21tanR6a3Z2ZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTE2MzAsImV4cCI6MjA5Mjc4NzYzMH0.OIhEbefysmgLtwmjUOni-mGJ5WkAczPc-et9TqJ_GLQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;
