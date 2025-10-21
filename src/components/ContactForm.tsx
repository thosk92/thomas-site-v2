"use client";
import { useState } from "react";
import PrivacyLink from "@/components/PrivacyLink";

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErr("Please fill in all fields.");
      setState("error");
      return;
    }
    if (!emailRe.test(email)) {
      setErr("Please enter a valid email address.");
      setState("error");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({ name, email, message, hp: "" }),
        cache: "no-store",
      });
      if (!res.ok) {
        const rawErr: unknown = await res.json().catch(() => ({}));
        let code = "UNKNOWN";
        let provider = "";
        if (rawErr && typeof rawErr === "object") {
          if ("code" in rawErr && typeof (rawErr as { code?: unknown }).code === "string") {
            code = (rawErr as { code: string }).code;
          }
          if (
            "providerMessage" in rawErr &&
            typeof (rawErr as { providerMessage?: unknown }).providerMessage === "string"
          ) {
            provider = (rawErr as { providerMessage: string }).providerMessage;
          }
        }
        throw new Error(`HTTP ${res.status} ${code}${provider ? ` - ${provider}` : ""}`);
      }
      // Success: set UI first, then best-effort parse
      setState("success");
      try {
        await res.json();
      } catch {
        // ignore
      }
      setName(""); setEmail(""); setMessage("");
    } catch (ex) {
      setState("error");
      const msg = ex instanceof Error ? ex.message : "Something went wrong. Please try again later.";
      setErr(msg);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl" aria-live="polite">
      <input type="text" name="hp" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <div className="grid gap-4">
        <div>
          <label htmlFor="name" className="block text-sm text-[color-mix(in oklab,var(--foreground) 70%, transparent)]">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-md border bg-white px-3 py-2 outline-none focus:ring-1"
            style={{ borderColor: "color-mix(in oklab,var(--foreground) 20%, transparent)" }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 1px color-mix(in oklab,var(--foreground) 40%, transparent) inset`)}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-[color-mix(in oklab,var(--foreground) 70%, transparent)]">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border bg-white px-3 py-2 outline-none focus:ring-1"
            style={{ borderColor: "color-mix(in oklab,var(--foreground) 20%, transparent)" }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 1px color-mix(in oklab,var(--foreground) 40%, transparent) inset`)}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm text-[color-mix(in oklab,var(--foreground) 70%, transparent)]">Message</label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="mt-1 w-full rounded-md border bg-white px-3 py-2 outline-none focus:ring-1"
            style={{ borderColor: "color-mix(in oklab,var(--foreground) 20%, transparent)" }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 1px color-mix(in oklab,var(--foreground) 40%, transparent) inset`)}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>
        <p className="text-xs text-[color-mix(in oklab,var(--foreground) 60%, transparent)]">By submitting, you agree to the processing of your data to handle your request. Read the <PrivacyLink className="underline underline-offset-2" />.</p>
        <div className="flex items-center gap-3">
          <button disabled={state === "loading"} className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60" style={{ background: "var(--foreground)", color: "var(--background)" }}>
            {state === "loading" ? "Sending..." : "Send"}
          </button>
          {state === "success" && <span className="text-sm text-green-700">Sent. I’ll get back to you soon.</span>}
          {state === "error" && <span className="text-sm text-red-700">{err}</span>}
        </div>
      </div>
    </form>
  );
}
