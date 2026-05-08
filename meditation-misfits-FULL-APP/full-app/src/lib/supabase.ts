import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase anon key from your project settings
const supabaseUrl = 'https://dqqdwnzrulmgnqrlhfdc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
