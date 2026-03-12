import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkljcmuoouoygkjtpsod.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbGpjbXVvb3VveWdranRwc29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDgyNzUsImV4cCI6MjA4MDI4NDI3NX0.3kU_ADn48MnspgqTouIlcpv4X3MQ4pdJsKgpBzFKgfI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)