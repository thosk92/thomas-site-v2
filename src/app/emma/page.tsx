"use client";

import Image from "next/image";
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

    const historyForApi = messages;

    setError(null);
    setLoading(true);

    // Show the user's message in the chat immediately and prepare an empty assistant bubble
    setMessages((prev) => [
      ...prev,
      { role: "user", content: value },
      { role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/emma/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, lang, history: historyForApi }),
      });

      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => "");
        console.error("[emma advice] error", res.status, t);
        setError(
          lang === "en"
            ? "I can't generate advice right now. Please try again in a moment."
            : "Al momento non riesco a generare un consiglio. Riprova tra poco.",
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value: chunk, done } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(chunk, { stream: true });

        const current = assistantText;
        setMessages((prev) => {
          if (!prev.length) return prev;
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex]?.role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: current,
            };
          }
          return updated;
        });
      }

      // flush finale
      assistantText += decoder.decode();
      if (!assistantText.trim()) {
        setError(
          lang === "en"
            ? "EMMA's reply is empty. Please try again."
            : "La risposta di EMMA è vuota. Riprova.",
        );
        return;
      }

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
  const askCta = lang === "en" ? "Ask Emma" : "Chiedi a EMMA";
  const loadingLabel =
    lang === "en" ? "EMMA is thinking about an answer for you…" : "EMMA sta pensando alla risposta per te…";

  if (mode === "home") {
    return (
      <div className="mx-auto w-full max-w-md sm:max-w-lg px-6 py-10 text-center flex flex-col items-center overflow-x-hidden">
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
          className="mc-cta inline-flex w-full max-w-xs items-center justify-center rounded-full bg-[#4f46e5] px-8 py-4 text-base font-semibold text-white sm:max-w-sm sm:text-lg"
        >
          {homeCta}
        </button>
      </div>
    );
  }

  const followup = messages.length > 0;

  return (
    <div className="mx-auto w-full max-w-md sm:max-w-lg px-6 py-8 sm:py-10 overflow-x-hidden">
      <div className="mb-4 space-y-2 text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1F3A5F] sm:text-3xl">
          {sessionTitle}
        </h1>
        <p className="max-w-xl text-sm text-slate-700 sm:text-base">
          {sessionSubtitle}
        </p>
      </div>

      {!messages.length && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <Image src="/emmalogo.png" alt="EMMA" width={20} height={20} className="h-5 w-5 object-contain" />
          </div>
          <p className="text-sm text-slate-700 sm:text-base">
            {lang === "en" ? "Hi, I’m EMMA. Tell me what’s going on." : "Ciao, sono EMMA. Raccontami cosa sta succedendo."}
          </p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="mb-4 space-y-3 text-sm text-slate-800 sm:text-base">
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
                  "max-w-[85%] rounded-2xl px-4 py-2 whitespace-pre-line emma-bubble " +
                  (m.role === "user"
                    ? "bg-[#6366f1] text-white"
                    : "bg-slate-100 text-slate-800")
                }
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAskAdvice} className="space-y-4 mt-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={followup ? 3 : 5}
          className="w-full rounded-3xl border border-slate-200/80 bg-white/90 p-4 text-sm focus:border-[#a5b4fc] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe] sm:text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const form = e.currentTarget.form;
              if (form) {
                form.requestSubmit();
              }
            }
          }}
          placeholder={
            followup
              ? lang === "en"
                ? "Tell me what’s on your mind…"
                : "Dimmi cosa hai in mente…"
              : textareaPlaceholder
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#4f46e5] px-8 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
        >
          {loading ? loadingLabel : askCta}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
