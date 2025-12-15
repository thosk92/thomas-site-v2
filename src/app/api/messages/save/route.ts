import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { getRequestUser, tryGetAdminClient } from "@/lib/apiAuth";

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = await getRequestUser(req, supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, role, content } = await req.json().catch(() => ({}));
  if (!conversationId || !role || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const admin = tryGetAdminClient();
  const client = admin ?? supabase;

  // Ensure the conversation belongs to the current user before writing messages
  const { data: conversation, error: convError } = await client
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (convError) {
    return NextResponse.json({ error: convError.message }, { status: 400 });
  }

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data, error } = await client
    .from("messages")
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: data });
}
