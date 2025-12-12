import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";

// This endpoint syncs the Supabase session cookies for server-side API routes.
// It must run in a Route Handler (not a Server Component) to be allowed to modify cookies.
export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json().catch(() => ({}));

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, session: data.session });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to set session" }, { status: 400 });
  }
}
