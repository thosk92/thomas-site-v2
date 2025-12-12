import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabaseServerClient";

export async function POST() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const res = NextResponse.json({ success: true });

  // Clear Supabase auth cookies (sb-<ref>-auth-token and related)
  cookieStore.getAll().forEach((c) => {
    if (c.name.includes("sb-") && c.name.includes("auth")) {
      res.cookies.set({
        name: c.name,
        value: "",
        path: "/",
        maxAge: 0,
      });
    }
  });

  return res;
}
