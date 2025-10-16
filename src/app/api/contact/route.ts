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
    const fromEmail = process.env.CONTACT_FROM || "onboarding@resend.dev";
    if (!to || !process.env.RESEND_API_KEY) {
      console.error("contact:error", { code: "MISSING_ENV", hasTo: !!to, hasKey: !!process.env.RESEND_API_KEY });
      return NextResponse.json({ ok: false, code: "MISSING_ENV" }, { status: 500 });
    }

    const subject = `New contact from ${name}`;
    const text = `Name: ${name}\nEmail: ${email}\nIP: ${ip}\n\n${message}`;

    const resend = new Resend(process.env.RESEND_API_KEY as string);
    const html = `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><pre style=\"white-space:pre-wrap\">${message}</pre>`;

    let attempt = 0;
    const maxAttempts = 3;
    while (attempt < maxAttempts) {
      try {
        const result = await resend.emails.send({
          to,
          from: fromEmail,
          subject,
          text,
          html,
          replyTo: email,
        });
        const hasError = typeof (result as { error?: { message?: string } }).error !== "undefined";
        if (!hasError) {
          return NextResponse.json({ ok: true });
        }
        const errMsg = (result as { error?: { message?: string } }).error?.message || "unknown";
        console.error("contact:error", { code: "SEND_FAILED", message: errMsg });
      } catch {
        // ignore and retry
      }
      attempt++;
      await new Promise((r) => setTimeout(r, 300 * Math.pow(2, attempt))); // 300ms, 600ms, 1200ms
    }
    console.error("contact:error", { code: "SEND_RETRY_FAILED" });
    return NextResponse.json({ ok: false, code: "SEND_RETRY_FAILED" }, { status: 502 });

  } catch {
    console.error("contact:error", { code: "UNEXPECTED" });
    return NextResponse.json({ ok: false, code: "UNEXPECTED" }, { status: 500 });
  }
}
