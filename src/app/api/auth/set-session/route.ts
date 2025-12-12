import { NextResponse } from "next/server";

// No-op endpoint: we no longer set session cookies server-side to avoid cookie mutation errors.
export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json().catch(() => ({}));

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
