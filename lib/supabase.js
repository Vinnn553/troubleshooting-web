// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY (atau NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) wajib dikonfigurasi.'
    );
  }

  return { url, key };
}

let publicClient;
export function getSupabase() {
  if (!publicClient) {
    const { url, key } = getSupabaseCredentials();
    publicClient = createClient(url, key);
  }

  return publicClient;
}

export const getServiceSupabase = () => {
  const { url } = getSupabaseCredentials();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY wajib dikonfigurasi untuk operasi admin.');
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
};
