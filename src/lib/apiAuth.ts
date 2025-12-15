import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabaseAdminClient";

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function tryCreateAdminClient() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

export async function getRequestUser(
  req: Request,
  supabase: SupabaseClient,
): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return user;
  } catch {
    // ignore
  }

  const token = getBearerToken(req);
  if (!token) return null;

  const admin = tryCreateAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

export function tryGetAdminClient() {
  return tryCreateAdminClient();
}
