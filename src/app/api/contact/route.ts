import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const fwd = req.headers.get("x-forwarded-for") || "";
    const ip = fwd.split(",")[0]?.trim() || "";
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      console.error("contact:error", { code: "BAD_BODY" });
      return NextResponse.json({ ok: false, code: "BAD_BODY" }, { status: 400 });
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const hp = String(body.hp || "").trim();

    if (hp) return NextResponse.json({ ok: true });
    if (!name || !email || !message) {
      console.error("contact:error", { code: "BAD_INPUT" });
      return NextResponse.json({ ok: false, code: "BAD_INPUT" }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("contact:error", { code: "BAD_EMAIL" });
      return NextResponse.json({ ok: false, code: "BAD_EMAIL" }, { status: 400 });
    }

    const to = process.env.CONTACT_TO || "";
    const from = process.env.CONTACT_FROM || "onboarding@resend.dev";
    if (!to || !process.env.RESEND_API_KEY) {
      console.error("contact:error", { code: "MISSING_ENV", hasTo: !!to, hasKey: !!process.env.RESEND_API_KEY });
      return NextResponse.json({ ok: false, code: "MISSING_ENV" }, { status: 500 });
    }

    const subject = `New contact from ${name}`;
    const text = `Name: ${name}\nEmail: ${email}\nIP: ${ip}\n\n${message}`;

    const resend = new Resend(process.env.RESEND_API_KEY as string);
    const result = await resend.emails.send({ to, from, subject, text });
    if ((result as any)?.error) {
      console.error("contact:error", { code: "SEND_FAILED" });
      return NextResponse.json({ ok: false, code: "SEND_FAILED" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact:error", { code: "UNEXPECTED" });
    return NextResponse.json({ ok: false, code: "UNEXPECTED" }, { status: 500 });
  }
}
