import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const fwd = req.headers.get("x-forwarded-for") || "";
    const ip = fwd.split(",")[0]?.trim() || "";
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return NextResponse.json({ ok: false }, { status: 400 });

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const hp = String(body.hp || "").trim();

    if (hp) return NextResponse.json({ ok: true });
    if (!name || !email || !message) return NextResponse.json({ ok: false }, { status: 400 });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return NextResponse.json({ ok: false }, { status: 400 });

    const to = process.env.CONTACT_TO || "";
    const from = process.env.CONTACT_FROM || "onboarding@resend.dev";
    if (!to || !process.env.RESEND_API_KEY) return NextResponse.json({ ok: false }, { status: 500 });

    const subject = `New contact from ${name}`;
    const text = `Name: ${name}\nEmail: ${email}\nIP: ${ip}\n\n${message}`;

    const resend = new Resend(process.env.RESEND_API_KEY as string);
    await resend.emails.send({ to, from, subject, text });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
