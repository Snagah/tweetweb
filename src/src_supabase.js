import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://byeaovijxqxgdybaxbnc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZWFvdmlqeHF4Z2R5YmF4Ym5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MDYwMzQsImV4cCI6MjA2NzM4MjAzNH0.AdAVgyGeGqjer1C96QvfeXI2NHhJmSJiqxT8rOd0jNw';
export const supabase = createClient(supabaseUrl, supabaseKey);
