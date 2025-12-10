import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error("[auth callback] failed to exchange code", err);
    }
  }

  const redirectTo = url.searchParams.get("next") || "/emma";
  return NextResponse.redirect(new URL(redirectTo, url.origin));
}
