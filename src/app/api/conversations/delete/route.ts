import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { getRequestUser, tryGetAdminClient } from "@/lib/apiAuth";

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = await getRequestUser(req, supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json().catch(() => ({}));
  if (!id) {
    return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });
  }

  const admin = tryGetAdminClient();
  const client = admin ?? supabase;

  const { error } = await client.from("conversations").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
