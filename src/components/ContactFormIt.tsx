"use client";
import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactFormIt() {
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
      setErr("Per favore compila tutti i campi.");
      setState("error");
      return;
    }
    if (!emailRe.test(email)) {
      setErr("Inserisci un indirizzo email valido.");
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
      setState("success");
      try { await res.json(); } catch {}
      setName(""); setEmail(""); setMessage("");
    } catch (ex) {
      setState("error");
      const msg = ex instanceof Error ? ex.message : "Qualcosa è andato storto. Riprova più tardi.";
      setErr(msg);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl" aria-live="polite">
      <input type="text" name="hp" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <div className="grid gap-4">
        <div>
          <label htmlFor="name" className="block text-sm text-foreground/70">Nome</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-foreground/20 bg-white px-3 py-2 outline-none focus:border-foreground/40"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-foreground/70">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-foreground/20 bg-white px-3 py-2 outline-none focus:border-foreground/40"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm text-foreground/70">Messaggio</label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-foreground/20 bg-white px-3 py-2 outline-none focus:border-foreground/40"
          />
        </div>
        <p className="text-xs text-foreground/60">Inviando il form, acconsenti al trattamento dei dati per gestire la tua richiesta. Leggi la <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.</p>
        <div className="flex items-center gap-3">
          <button disabled={state === "loading"} className="inline-flex items-center rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium disabled:opacity-60">
            {state === "loading" ? "Invio..." : "Invia"}
          </button>
          {state === "success" && <span className="text-sm text-green-700">Inviato. Ti risponderò a breve.</span>}
          {state === "error" && <span className="text-sm text-red-700">{err}</span>}
        </div>
      </div>
    </form>
  );
}
