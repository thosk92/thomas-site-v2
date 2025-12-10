import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { access_token, refresh_token } = await req.json().catch(() => ({}));

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
