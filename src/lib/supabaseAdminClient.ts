import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createAdminClient(): SupabaseClient | null {
  if (!supabaseUrl) {
    console.warn("[supabaseAdminClient] Missing NEXT_PUBLIC_SUPABASE_URL");
    return null;
  }

  const key = serviceRoleKey ?? anonKey;
  if (!key) {
    console.warn("[supabaseAdminClient] Missing Supabase keys");
    return null;
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  });
}
