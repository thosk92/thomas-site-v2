import { NextResponse } from "next/server";
import { createClientReadOnly } from "@/lib/supabaseServerClient";
import { createAdminClient } from "@/lib/supabaseAdminClient";

export async function POST(req: Request) {
  const supabase = await createClientReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, role, content } = await req.json().catch(() => ({}));
  if (!conversationId || !role || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  const { data, error } = await admin
    .from("messages")
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: data });
}
