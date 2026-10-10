import { createClient } from '@supabase/supabase-js';

const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) || {};

const SUPABASE_URL =
  env.VITE_SUPABASE_URL || 'https://cquygstwcugjxhjkdnio.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxdXlnc3R3Y3VnanhoamtkbmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNTgxNTcsImV4cCI6MjEwNjgzNDE1N30.mvXXjUH7FBuNqr2yGD2lEGNMIhm8AC132nvxTaxcWsg';

const safeStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' ? window.localStorage : undefined;

// Initialize the single centralized client with session persistence and automatic token refresh
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: typeof window !== 'undefined',
    ...(safeStorage ? { storage: safeStorage } : {}),
  },
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
};
