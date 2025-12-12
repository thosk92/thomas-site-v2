import { NextResponse } from "next/server";
import { createClientReadOnly } from "@/lib/supabaseServerClient";
import { createAdminClient } from "@/lib/supabaseAdminClient";

export async function POST() {
  const supabase = await createClientReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  const { error } = await admin.from("conversations").delete().eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
