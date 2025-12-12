import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { createAdminClient } from "@/lib/supabaseAdminClient";

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

  let admin: ReturnType<typeof createAdminClient> | null = null;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.warn("[profile update] admin client unavailable, falling back to user client");
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
      .eq("id", user.id)
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
