import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, age, gender, personal_goal, language_preference } = body;

  const payload = {
    id: user.id,
    name,
    age,
    gender,
    personal_goal,
    language_preference,
  };

  // Persist language also in auth metadata so it's always stored, even if the DB column is missing
  if (language_preference) {
    try {
      await supabase.auth.updateUser({ data: { lang: language_preference } });
    } catch (err) {
      console.error("[profile] failed to persist auth lang", err);
    }
  }

  const attemptUpsert = async (withLanguage: boolean) => {
    const insertPayload = withLanguage
      ? payload
      : { ...payload, language_preference: undefined };
    return supabase
      .from("profiles")
      .upsert(insertPayload, { onConflict: "id" })
      .select()
      .single();
  };

  const attemptUpdate = async (withLanguage: boolean) => {
    const updatePayload = withLanguage
      ? payload
      : { ...payload, language_preference: undefined };
    return supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select()
      .single();
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

  return NextResponse.json({ success: true, profile: data });
}
