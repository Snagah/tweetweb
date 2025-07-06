import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-public-anon-key'
export const supabase = createClient(supabaseUrl, supabaseKey)
