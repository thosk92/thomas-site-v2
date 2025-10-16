"use client";
import { useState } from "react";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [err, setErr] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setState("loading");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("success");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (_err: unknown) {
      setState("error");
      setErr("Something went wrong. Please try again later.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl" aria-live="polite">
      <input type="text" name="hp" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <div className="grid gap-4">
        <div>
          <label htmlFor="name" className="block text-sm text-foreground/70">Name</label>
          <input id="name" name="name" required className="mt-1 w-full rounded-md border border-foreground/20 bg-white px-3 py-2 outline-none focus:border-foreground/40" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-foreground/70">Email</label>
          <input id="email" name="email" type="email" required className="mt-1 w-full rounded-md border border-foreground/20 bg-white px-3 py-2 outline-none focus:border-foreground/40" />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm text-foreground/70">Message</label>
          <textarea id="message" name="message" required rows={5} className="mt-1 w-full rounded-md border border-foreground/20 bg-white px-3 py-2 outline-none focus:border-foreground/40" />
        </div>
        <p className="text-xs text-foreground/60">By submitting, you agree to the processing of your data to handle your request. Read the <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.</p>
        <div className="flex items-center gap-3">
          <button disabled={state === "loading"} className="inline-flex items-center rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium disabled:opacity-60">
            {state === "loading" ? "Sending..." : "Send message"}
          </button>
          {state === "success" && <span className="text-sm text-green-700">Sent. I’ll get back to you soon.</span>}
          {state === "error" && <span className="text-sm text-red-700">{err}</span>}
        </div>
      </div>
    </form>
  );
}
