import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { createAdminClient } from "@/lib/supabaseAdminClient";

function extractAccessToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7);
  }
  return req.headers.get("x-supabase-access-token");
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUser = user;

  if (!currentUser) {
    const token = extractAccessToken(req);
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      currentUser = data.user;
    }
  }

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, age, gender, personal_goal, language_preference } = body;

  const payload = {
    id: currentUser.id,
    name,
    age,
    gender,
    personal_goal,
    language_preference,
  };

  // Persist also in auth metadata so it's stored even if the DB column is missing
  try {
    await supabase.auth.updateUser({
      data: {
        lang: language_preference,
        name,
        age,
        gender,
        personal_goal,
      },
    });
  } catch (err) {
    console.error("[profile] failed to persist auth metadata", err);
  }

  const admin = createAdminClient();

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

  return NextResponse.json({ success: true, profile: data ?? payload });
}
