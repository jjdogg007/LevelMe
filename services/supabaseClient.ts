
import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper to check if Supabase is active
export const isSupabaseConfigured = () => !!supabase;
