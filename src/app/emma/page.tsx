"use client";

import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";

type Mode = "home" | "session";
type Lang = "it" | "en";

export default function EmmaHome() {
  const [mode, setMode] = useState<Mode>("home");
  const [lang, setLang] = useState<Lang>("en");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const startSession = useCallback(() => {
    setMode("session");
  }, []);

  async function handleAskAdvice(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    const historyForApi = messages;

    // clear input immediately after sending
    setText("");

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
    lang === "en"
      ? "What would you like to talk about today?"
      : "Di cosa ti piacerebbe parlare oggi?";
  const homeSubtitle =
    lang === "en"
      ? "Whatever is on your mind, you don’t have to carry it alone. EMMA is here to listen with calm and kindness."
      : "Qualunque cosa tu stia portando dentro, non devi farlo da solo. Sono qui per ascoltarti con calma e gentilezza.";
  const homeCta = lang === "en" ? "Talk to EMMA" : "Parla con EMMA";

  const sessionTitle =
    lang === "en" ? "Write what is worrying you" : "Scrivi cosa ti preoccupa";
  const sessionSubtitle =
    lang === "en"
      ? "Use simple words, as if you were telling a friend."
      : "Usa parole semplici, come se lo raccontassi a un’amica.";
  const textareaPlaceholder =
    lang === "en"
      ? "Tell me what’s on your mind…"
      : "Dimmi cosa ti passa per la testa…";
  const askCta = lang === "en" ? "Talk to EMMA" : "Parla con EMMA";
  const loadingLabel =
    lang === "en" ? "EMMA is thinking about an answer for you…" : "EMMA sta pensando alla risposta per te…";

  const examplePillsEn = [
    "I feel overwhelmed lately",
    "I don't know how to handle something",
    "I feel left out by friends",
  ];

  const examplePillsIt = [
    "Mi sento un po’ sopraffatto",
    "Non so come gestire una cosa",
    "Mi sento escluso",
  ];

  const examplePills = lang === "en" ? examplePillsEn : examplePillsIt;

  const handleSelectExample = (value: string) => {
    setMode("session");
    setText(value);
  };

  if (mode === "home") {
    return (
      <div className="emma-gradient-bg flex min-h-screen w-full justify-center px-4 py-6 overflow-x-hidden">
        <div className="mx-auto flex w-full max-w-md flex-col justify-between">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="emma-logo-breath flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md">
                <Image src="/emmalogo.png" alt="EMMA" width={22} height={22} className="h-6 w-6 object-contain" />
              </div>
              <div className="flex flex-col text-left text-xs text-slate-700">
                <span className="font-semibold text-slate-800">
                  {lang === "en" ? "Hi, I’m EMMA 🫶" : "Ciao, sono EMMA 🫶"}
                </span>
                <span>{lang === "en" ? "You can tell me anything." : "Puoi raccontarmi quello che vuoi."}</span>
              </div>
            </div>
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
          </header>

          <main className="flex flex-1 flex-col items-center text-center">
            <h1 className="mb-3 text-2xl font-semibold tracking-tight text-[#1F3A5F] sm:text-3xl">
              {homeTitle}
            </h1>
            <p className="mb-4 max-w-md text-sm text-slate-700 sm:text-base">
              {homeSubtitle}
            </p>

            <div className="mb-4 flex w-full flex-wrap justify-center gap-2">
              {examplePills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handleSelectExample(pill)}
                  className="rounded-full bg-white/85 px-3 py-1 text-xs text-slate-700 shadow-sm hover:bg-white emma-btn-soft"
                >
                  {pill}
                </button>
              ))}
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-600">
              <span className="rounded-full bg-white/80 px-2 py-1 shadow-sm">{lang === "en" ? "Private & Anonymous" : "Privato e anonimo"}</span>
              <span className="rounded-full bg-white/80 px-2 py-1 shadow-sm">{lang === "en" ? "No account needed" : "Nessun account"}</span>
              <span className="rounded-full bg-white/80 px-2 py-1 shadow-sm">{lang === "en" ? "Safe space" : "Uno spazio sicuro"}</span>
            </div>

            <button
              type="button"
              onClick={startSession}
              className="mc-cta emma-btn-soft inline-flex w-full max-w-xs items-center justify-center rounded-full bg-[#5d4dfc] px-8 py-4 text-base font-semibold text-white shadow-md sm:max-w-sm sm:text-lg"
            >
              {homeCta}
            </button>
          </main>
        </div>
      </div>
    );
  }

  const followup = messages.length > 0;

  return (
    <div className="emma-gradient-bg flex min-h-screen w-full justify-center px-4 py-6 overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="emma-logo-breath flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md">
              <Image src="/emmalogo.png" alt="EMMA" width={22} height={22} className="h-6 w-6 object-contain" />
            </div>
            <div className="flex flex-col text-left text-xs text-slate-700">
              <span className="font-semibold text-slate-800">
                {lang === "en" ? "Hi, I’m EMMA 🫶" : "Ciao, sono EMMA 🫶"}
              </span>
              <span>{lang === "en" ? "Take a breath, I’m here." : "Fai un respiro, sono qui con te."}</span>
            </div>
          </div>
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
        </header>

        <div className="mb-4 space-y-2 text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-[#1F3A5F] sm:text-3xl">
            {sessionTitle}
          </h1>
          <p className="max-w-xl text-sm text-slate-700 sm:text-base">
            {sessionSubtitle}
          </p>
        </div>

        {!messages.length && (
          <div className="mb-4 text-sm text-slate-700 sm:text-base">
            {lang === "en" ? "I’m here, take your time." : "Sono qui, prenditi il tuo tempo."}
          </div>
        )}

        {messages.length > 0 && (
          <div className="mb-4 space-y-3 text-sm text-slate-800 sm:text-base max-h-[60vh] overflow-y-auto no-scrollbar">
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
                      ? "bg-[#dfe8ff] text-slate-900"
                      : "bg-[#ece8ff] text-slate-900")
                  }
                >
                  {m.content}
                  {m.role === "assistant" && idx === messages.length - 1 && loading && (
                    <div className="mt-1 emma-typing">
                      <span className="emma-typing-dot" />
                      <span className="emma-typing-dot" />
                      <span className="emma-typing-dot" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <form onSubmit={handleAskAdvice} className="space-y-3 mt-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="emma-input-fade w-full rounded-3xl border border-slate-200/80 bg-white/90 p-4 text-sm shadow-sm focus:border-[#a5b4fc] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe] sm:text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.form;
                if (form) {
                  form.requestSubmit();
                }
              }
            }}
            placeholder={textareaPlaceholder}
          />

          <button
            type="submit"
            disabled={loading}
            className="emma-btn-soft inline-flex w-full items-center justify-center rounded-full bg-[#5d4dfc] px-8 py-3 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
          >
            {loading ? loadingLabel : askCta}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
