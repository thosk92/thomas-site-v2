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

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        name,
        age,
        gender,
        personal_goal,
        language_preference,
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, profile: data });
}
