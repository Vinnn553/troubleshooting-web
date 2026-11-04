// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Mendukung nama variabel lama (ANON_KEY) maupun format terbaru Supabase (PUBLISHABLE_KEY)
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 1. Client Publik (bisa digunakan di Client Component & Server Component)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Client Admin / Backend (hanya untuk Server Component, Server Actions, & Route Handlers)
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
};
