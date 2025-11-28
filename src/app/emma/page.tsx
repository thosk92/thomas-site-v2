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
      <div className="emma-immersive-bg flex min-h-screen w-full justify-center px-4 py-8 overflow-x-hidden">
        <div className="mx-auto flex w-full max-w-[420px] flex-col text-center text-white">
          <header className="mb-6 flex items-center justify-end">
            <div className="inline-flex rounded-full bg-white/10 p-1 text-[11px] font-medium text-white/80">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={
                  "rounded-full px-3 py-1 transition-colors " +
                  (lang === "en" ? "bg-white text-[#1D2150]" : "text-white/80 hover:bg-white/10")
                }
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("it")}
                className={
                  "rounded-full px-3 py-1 transition-colors " +
                  (lang === "it" ? "bg-white text-[#1D2150]" : "text-white/80 hover:bg-white/10")
                }
              >
                IT
              </button>
            </div>
          </header>

          <main className="flex flex-1 flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-3">
              <p className="text-[15px] text-white/90">
                {lang === "en" ? "Hi, I’m EMMA 🫶" : "Ciao, sono EMMA 🫶"}
              </p>
              <h1 className="text-[24px] font-semibold leading-snug text-white">
                {homeTitle}
              </h1>
              <p className="max-w-[90%] text-[16px] text-white/80">
                {homeSubtitle}
              </p>
            </div>

            <div className="flex w-full flex-wrap justify-center gap-2">
              {examplePills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handleSelectExample(pill)}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[15px] text-white/90 backdrop-blur-sm hover:bg-white/15 emma-btn-soft"
                >
                  {pill}
                </button>
              ))}
            </div>

            <p className="text-[13px] text-white/70">
              {lang === "en"
                ? "Private & anonymous · No account needed · Safe space"
                : "Privato e anonimo · Nessun account · Spazio sicuro"}
            </p>

            <button
              type="button"
              onClick={startSession}
              className="mc-cta emma-btn-soft mt-1 inline-flex w-full items-center justify-center rounded-full bg-[#6C63FF] px-6 py-3 text-[16px] font-semibold text-white shadow-[0_2px_12px_rgba(108,99,255,0.35)]"
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
    <div className="emma-immersive-bg flex min-h-screen w-full justify-center px-4 py-8 overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[420px] flex-col text-white">
        <header className="mb-6 flex items-center justify-between">
          <div className="emma-logo-breath flex h-9 w-9 items-center justify-center">
            <Image src="/logo-emma-bianco.png" alt="EMMA" width={20} height={20} className="h-5 w-5 object-contain" />
          </div>
          <div className="inline-flex rounded-full bg-white/80 p-1 text-[11px] font-medium text-slate-700 shadow-sm">
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

        <div className="mb-6 space-y-2 text-left text-white">
          <p className="text-[13px] text-white/80">
            {lang === "en" ? "I’m here, take your time." : "Sono qui, prenditi il tuo tempo."}
          </p>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1F3A5F]">
            {sessionTitle}
          </h1>
          <p className="max-w-[90%] text-[15px] text-white/80">
            {sessionSubtitle}
          </p>
        </div>

        {messages.length > 0 && (
          <div className="mb-6 space-y-3 text-[15px] text-slate-800 max-h-[60vh] overflow-y-auto no-scrollbar">
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
                    "max-w-[85%] rounded-[18px] px-4 py-3 whitespace-pre-line emma-bubble " +
                    (m.role === "user"
                      ? "bg-[#dfe8ff] text-slate-900"
                      : "bg-[#F2EDFF] text-slate-900")
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

        <form onSubmit={handleAskAdvice} className="mt-2 space-y-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="emma-input-fade w-full rounded-[18px] border border-slate-200/80 bg-white/90 p-4 text-sm shadow-sm focus:border-[#a5b4fc] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe] sm:text-base"
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
            className="emma-btn-soft inline-flex w-full items-center justify-center rounded-[18px] bg-[#5d4dfc] px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
          >
            {loading ? loadingLabel : askCta}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
