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

  const { title, id } = await req.json().catch(() => ({}));
  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  const upsertPayload: any = { user_id: user.id, title: title ?? null };
  if (id) upsertPayload.id = id;

  const { data, error } = await admin
    .from("conversations")
    .upsert(upsertPayload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ conversation: data });
}
