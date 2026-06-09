import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are present, otherwise export mock/null client for local fallback
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url');

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase credentials missing. App is running in Local Simulation Mode. ' +
    'To sync official matches, create a .env file based on .env.example.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
