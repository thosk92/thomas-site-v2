import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createAdminClient() {
  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  // Prefer the service role key; if missing, fall back to anon to avoid crashing the app.
  // Operations that need elevated permissions will fail gracefully if the key is missing.
  const key = serviceRoleKey ?? anonKey;
  if (!key) {
    throw new Error("Missing Supabase keys");
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  });
}
