"use client";

import { useState, useCallback } from "react";

type Mode = "home" | "session";
type Lang = "it" | "en";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function EmmaHome() {
  const [mode, setMode] = useState<Mode>("home");
  const [lang, setLang] = useState<Lang>("it");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(() => {
    setMode("session");
  }, []);

  async function handleAskAdvice(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/emma/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, lang, history: messages }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("[emma advice] error", res.status, t);
        setError(
          lang === "en"
            ? "I can't generate advice right now. Please try again in a moment."
            : "Al momento non riesco a generare un consiglio. Riprova tra poco.",
        );
        return;
      }

      const data = (await res.json()) as { advice?: string };
      if (!data.advice) {
        setError(lang === "en" ? "EMMA's reply is empty. Please try again." : "La risposta di EMMA è vuota. Riprova.");
        return;
      }

      const assistantReply = data.advice.trim();

      setMessages((prev) => [
        ...prev,
        { role: "user", content: value },
        { role: "assistant", content: assistantReply },
      ]);
      setText("");
    } catch (err) {
      console.error("[emma advice] exception", err);
      setError(
        lang === "en"
          ? "An error occurred while calling the AI."
          : "Si è verificato un errore chiamando l'AI.",
      );
    } finally {
      setLoading(false);
    }
  }

  const homeTitle =
    lang === "en" ? "What would you like to talk about today?" : "Di cosa vuoi parlare oggi?";
  const homeSubtitle =
    lang === "en"
      ? "Write in a few words what is worrying you. EMMA will answer right away with practical advice and a new perspective."
      : "Scrivi in poche parole cosa ti preoccupa. EMMA ti risponderà subito con un consiglio pratico e una nuova prospettiva.";
  const homeCta = lang === "en" ? "Talk to EMMA" : "Parla con EMMA";

  const sessionTitle =
    lang === "en" ? "Write what is worrying you" : "Scrivi cosa ti preoccupa";
  const sessionSubtitle =
    lang === "en"
      ? "Use simple words, as if you were telling a friend."
      : "Usa parole semplici, come se lo dicessi a un amico.";
  const textareaPlaceholder =
    lang === "en"
      ? "Write your thought or worry here…\nExample: 'Lately I feel a bit left out by my friends and I don't know how to handle it.'"
      : "Scrivi qui il tuo pensiero o la tua preoccupazione…\nEsempio: 'Ultimamente mi sento un po' escluso dagli altri e non so bene come gestirla.'";
  const askCta = lang === "en" ? "Ask for advice" : "Chiedi un consiglio";
  const loadingLabel =
    lang === "en" ? "EMMA is thinking about an answer for you…" : "EMMA sta pensando alla risposta per te…";

  if (mode === "home") {
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex w-full items-center justify-end">
          <div className="inline-flex rounded-full bg-white/80 p-1 text-xs font-medium text-slate-700 shadow-sm">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={
                "rounded-full px-3 py-1 transition-colors " +
                (lang === "en" ? "bg-[#4f46e5] text-white" : "text-slate-700 hover:bg-slate-100")
              }
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("it")}
              className={
                "rounded-full px-3 py-1 transition-colors " +
                (lang === "it" ? "bg-[#4f46e5] text-white" : "text-slate-700 hover:bg-slate-100")
              }
            >
              IT
            </button>
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-[#1F3A5F] sm:text-3xl">
          {homeTitle}
        </h1>
        <p className="mb-8 max-w-xl text-sm text-slate-700 sm:text-base">
          {homeSubtitle}
        </p>

        <button
          type="button"
          onClick={startSession}
          className="mc-cta inline-flex w-full max-w-xs items-center justify-center rounded-full bg-[#4f46e5] px-8 py-4 text-base font-semibold text-white shadow-[0_18px_60px_rgba(31,58,95,0.75)] transition-transform transition-shadow duration-300 ease-out hover:scale-[1.05] hover:shadow-[0_22px_80px_rgba(31,58,95,0.9)] sm:max-w-sm sm:text-lg"
        >
          {homeCta}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col justify-center px-4 py-8 sm:py-10">
      <div className="mb-6 space-y-2 text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1F3A5F] sm:text-3xl">
          {sessionTitle}
        </h1>
        <p className="max-w-xl text-sm text-slate-700 sm:text-base">
          {sessionSubtitle}
        </p>
      </div>

      <form onSubmit={handleAskAdvice} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full rounded-3xl border border-slate-200/80 bg-white/90 p-4 text-sm shadow-[0_10px_35px_rgba(15,23,42,0.08)] focus:border-[#a5b4fc] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe] sm:text-base"
          placeholder={textareaPlaceholder}
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#4f46e5] px-8 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(31,58,95,0.65)] transition-transform transition-shadow duration-200 ease-out hover:scale-[1.02] hover:shadow-[0_18px_55px_rgba(31,58,95,0.8)] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
        >
          {loading ? loadingLabel : askCta}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {messages.length > 0 && (
        <div className="mt-6 space-y-3 rounded-3xl bg-white/90 p-5 text-sm text-slate-800 shadow-[0_16px_60px_rgba(15,23,42,0.16)] sm:p-6 sm:text-base">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                "flex " +
                (m.role === "user" ? "justify-end" : "justify-start")
              }
            >
              <div
                className={
                  "max-w-[85%] rounded-2xl px-4 py-2 whitespace-pre-line " +
                  (m.role === "user"
                    ? "bg-[#4f46e5] text-white"
                    : "bg-slate-100 text-slate-800")
                }
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
