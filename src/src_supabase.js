import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseKey = 'YOUR_PUBLIC_ANON_KEY';
export const supabase = createClient(supabaseUrl, supabaseKey);