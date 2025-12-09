import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdminClient";

export async function POST(req: Request) {
  const admin = createAdminClient();
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
