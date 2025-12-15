import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { getRequestUser, tryGetAdminClient } from "@/lib/apiAuth";

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = await getRequestUser(req, supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, id } = await req.json().catch(() => ({}));
  const admin = tryGetAdminClient();

  const upsertPayload: any = { user_id: user.id, title: title ?? null };
  if (id) upsertPayload.id = id;

  const client = admin ?? supabase;

  const { data, error } = await client.from("conversations").upsert(upsertPayload, { onConflict: "id" }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ conversation: data });
}
