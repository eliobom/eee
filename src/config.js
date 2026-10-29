// Supabase Configuration
import Constants from 'expo-constants';
import { supabase } from './supabaseClient';

// Supabase Configuration
export const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const JWT_SECRET = process.env.JWT_SECRET;

// Server Configuration
export const SERVER_PORT = 3000;
export const NODE_ENV = 'development';

// Export Supabase client for use throughout the app
export { supabase };
