import { NextResponse } from "next/server";
import { createClientReadOnly } from "@/lib/supabaseServerClient";
import { createAdminClient } from "@/lib/supabaseAdminClient";

export async function GET() {
  const supabase = await createClientReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ conversations: [] });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  const { data, error } = await admin
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ conversations: data ?? [] });
}
