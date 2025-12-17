import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabaseServerClient";
import { createAdminClient } from "@/lib/supabaseAdminClient";

function extractAccessToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7);
  }
  return req.headers.get("x-supabase-access-token");
}

function extractTokenFromCookies(cookieStore: Awaited<ReturnType<typeof cookies>>): string | null {
  // Supabase stores auth in a cookie named sb-<project-ref>-auth-token
  const all = cookieStore.getAll();
  const authCookie = all.find((c) => c.name.includes("sb-") && c.name.endsWith("-auth-token"));
  if (!authCookie?.value) return null;
  try {
    const parsed = JSON.parse(authCookie.value);
    const accessToken = parsed?.access_token || parsed?.currentSession?.access_token;
    if (typeof accessToken === "string" && accessToken.length > 10) {
      return accessToken;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUser = user;
  const admin = createAdminClient();

  if (!currentUser) {
    const headerToken = extractAccessToken(req);
    const cookieToken = extractTokenFromCookies(cookieStore) ?? cookieStore.get("sb-access-token")?.value;
    const token = headerToken ?? cookieToken;
    if (token) {
      // Try with anon client
      const { data } = await supabase.auth.getUser(token);
      currentUser = data.user;

      // Fallback with admin client (bypasses RLS on auth)
      if (!currentUser && admin) {
        const { data: adminUser } = await admin.auth.getUser(token);
        currentUser = adminUser.user;
      }
    }
  }

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, age, gender, personal_goal, language_preference } = body;

  const normalizedLanguagePreference =
    typeof language_preference === "string"
      ? language_preference
      : language_preference == null
        ? null
        : null;

  const payload = {
    id: currentUser.id,
    name,
    age,
    gender,
    personal_goal,
    language_preference: normalizedLanguagePreference,
  };

  // Persist also in auth metadata so it's stored even if the DB column is missing
  try {
    const authData: Record<string, unknown> = {
      name,
      age,
      gender,
      personal_goal,
    };
    // Explicitly set `lang` to null for "Auto", or to the selected string otherwise.
    authData.lang = normalizedLanguagePreference;

    await supabase.auth.updateUser({
      data: {
        ...authData,
      },
    });
  } catch (err) {
    console.error("[profile] failed to persist auth metadata", err);
  }

  const attemptUpsert = async (withLanguage: boolean) => {
    const insertPayload = withLanguage
      ? payload
      : { ...payload, language_preference: undefined };
    return (admin ?? supabase)
      .from("profiles")
      .upsert(insertPayload, { onConflict: "id" })
      .select()
      .maybeSingle();
  };

  const attemptUpdate = async (withLanguage: boolean) => {
    const updatePayload = withLanguage
      ? payload
      : { ...payload, language_preference: undefined };
    return (admin ?? supabase)
      .from("profiles")
      .update(updatePayload)
      .eq("id", currentUser.id)
      .select()
      .maybeSingle();
  };

  let data, error;
  ({ data, error } = await attemptUpsert(true));

  // Fallback when the column does not exist in the DB (legacy schema)
  if (error && /language_preference/.test(error.message ?? "")) {
    ({ data, error } = await attemptUpsert(false));
  }

  // Fallback when RLS blocks inserts: try an update only
  if (error && /row-level security/i.test(error.message ?? "")) {
    ({ data, error } = await attemptUpdate(true));
    if (error && /language_preference/.test(error.message ?? "")) {
      ({ data, error } = await attemptUpdate(false));
    }
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If the DB schema doesn't have `language_preference`, Supabase will omit it from `data`.
  // Always return it so clients don't accidentally reset UI to "Auto".
  const profileOut = {
    ...payload,
    ...(data ?? {}),
    language_preference:
      payload.language_preference ??
      (data as any)?.language_preference ??
      null,
  };

  return NextResponse.json({ success: true, profile: profileOut });
}
