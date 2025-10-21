import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (process.env.CONTACT_DRY_RUN === "1") {
      console.log("contact:dry_run");
      return NextResponse.json({ ok: true, dryRun: true }, { headers: { "Cache-Control": "no-store" } });
    }
    const fwd = req.headers.get("x-forwarded-for") || "";
    const ip = fwd.split(",")[0]?.trim() || "";
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      console.error("contact:error", { code: "BAD_BODY" });
      return NextResponse.json({ ok: false, code: "BAD_BODY" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const hp = String(body.hp || "").trim();

    if (hp) return NextResponse.json({ ok: true });
    if (!name || !email || !message) {
      console.error("contact:error", { code: "BAD_INPUT" });
      return NextResponse.json({ ok: false, code: "BAD_INPUT" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("contact:error", { code: "BAD_EMAIL" });
      return NextResponse.json({ ok: false, code: "BAD_EMAIL" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const to = process.env.CONTACT_TO || "";
    const fromEmail = process.env.CONTACT_FROM || "onboarding@resend.dev";
    if (!to || !process.env.RESEND_API_KEY) {
      console.error("contact:error", { code: "MISSING_ENV", hasTo: !!to, hasKey: !!process.env.RESEND_API_KEY });
      return NextResponse.json({ ok: false, code: "MISSING_ENV" }, { status: 500, headers: { "Cache-Control": "no-store" } });
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
          reply_to: email,
        });
        console.log("contact:sent", { ok: true });
        let id: string | null = null;
        const r: unknown = result;
        if (r && typeof r === "object" && "data" in r) {
          const data = (r as { data?: unknown | null }).data;
          if (data && typeof data === "object" && "id" in data) {
            const maybeId = (data as { id?: unknown }).id;
            if (typeof maybeId === "string") id = maybeId;
          }
        }
        return NextResponse.json({ ok: true, id }, { headers: { "Cache-Control": "no-store" } });
      } catch (e) {
        const err = e as { message?: string; name?: string; stack?: string };
        console.error("contact:error", { code: "SEND_FAILED", message: err?.message || "unknown" });
      }
      attempt++;
      await new Promise((r) => setTimeout(r, 300 * Math.pow(2, attempt))); // 300ms, 600ms, 1200ms
    }
    console.error("contact:error", { code: "SEND_RETRY_FAILED" });
    return NextResponse.json({ ok: false, code: "SEND_RETRY_FAILED" }, { status: 502, headers: { "Cache-Control": "no-store" } });

  } catch (e) {
    const err = e as { message?: string };
    console.error("contact:error", { code: "UNEXPECTED", message: err?.message || "" });
    return NextResponse.json({ ok: false, code: "UNEXPECTED", providerMessage: err?.message || undefined }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
