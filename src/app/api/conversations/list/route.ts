import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { getRequestUser, tryGetAdminClient } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = await createClient();
  const user = await getRequestUser(req, supabase);

  if (!user) {
    return NextResponse.json({ conversations: [] });
  }

  const admin = tryGetAdminClient();
  const client = admin ?? supabase;

  const { data, error } = await client
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ conversations: data ?? [] });
}
