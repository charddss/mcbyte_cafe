import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://reifdkmmicysgefqpnys.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaWZka21taWN5c2dlZnFwbnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTU1MzksImV4cCI6MjA3OTg5MTUzOX0.8IafGU60NURUGPP9-20Wmkz4Wt7v1wp-j15TzMksWAs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
