import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mkljcmuoouoygkjtpsod.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbGpjbXVvb3VveWdranRwc29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDgyNzUsImV4cCI6MjA4MDI4NDI3NX0.3kU_ADn48MnspgqTouIlcpv4X3MQ4pdJsKgpBzFKgfI';

// Service role key - only use on server-side for admin operations
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbGpjbXVvb3VveWdranRwc29kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcwODI3NSwiZXhwIjoyMDgwMjg0Mjc1fQ.P1yhGDtcFnxIS1xjRe8rpIk_ZS4BYpi8PWFw-0irCJM';

// JWT Secret for authentication
export const JWT_SECRET =
  '3855b4db0e426a9eb7ae46a82ce4f9aacc6acc40736a864015e3c60e29991860';

// Export the Supabase client (uses anon key for client-side operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Export service role client for server-side/admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Export keys for reference
export { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey };
