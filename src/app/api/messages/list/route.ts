import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { getRequestUser, tryGetAdminClient } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const supabase = await createClient();
  const user = await getRequestUser(req, supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure the conversation belongs to the current user before reading messages
  const admin = tryGetAdminClient();
  const client = admin ?? supabase;

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
    return NextResponse.json({ messages: [] });
  }

  const { data, error } = await client
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ messages: data ?? [] });
}
