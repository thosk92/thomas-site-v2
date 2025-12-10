"use client";

import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { createConversation } from "@/lib/supabase/conversations";
import { saveMessage } from "@/lib/supabase/messages";

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
  const [showDataSheet, setShowDataSheet] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      const metaLang =
        (sessionUser?.user_metadata?.lang as Lang | undefined) ?? undefined;
      if (metaLang === "en" || metaLang === "it") {
        setLang(metaLang);
      }
    });
  }, []);

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
      let convId = conversationId;

      // Crea una conversazione se l'utente è loggato e non ne esiste ancora una
      if (!convId && user) {
        try {
          const title = value.length > 80 ? `${value.slice(0, 77)}...` : value;
          const conv = await createConversation(user.id, title);
          convId = conv.id;
          setConversationId(conv.id);
        } catch (err) {
          console.error("[emma] failed to create conversation", err);
        }
      }

      // Salva il messaggio dell'utente se abbiamo una conversazione
      if (convId && user) {
        try {
          await saveMessage(convId, "user", value);
        } catch (err) {
          console.error("[emma] failed to save user message", err);
        }
      }

      const res = await fetch("/api/emma/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: value, conversationId: convId }),
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

      // Salva il messaggio di EMMA a fine stream
      if (convId && user) {
        try {
          await saveMessage(convId, "assistant", assistantText);
        } catch (err) {
          console.error("[emma] failed to save assistant message", err);
        }
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
      ? "What do you need today?"
      : "Di cosa hai bisogno oggi?";
  const homeSubtitle =
    lang === "en"
      ? "Emma helps you understand what you’re going through and gives you words and guidance when something overwhelms you or leaves you stuck."
      : "Emma ti aiuta a capire cosa stai vivendo e ti offre parole e soluzioni quando qualcosa ti fa stare male o ti lascia spiazzato.";
  const homeCta = lang === "en" ? "Talk to EMMA" : "Parla con EMMA";

  const sessionTitle =
    lang === "en" ? "Write what’s weighing on you" : "Scrivi cosa ti pesa addosso";
  const sessionSubtitle =
    lang === "en"
      ? "Emma will help you understand it and find a way forward."
      : "Emma ti aiuterà a capirlo e a trovare un modo per affrontarlo.";
  const textareaPlaceholder =
    lang === "en"
      ? "Write what’s on your mind…"
      : "Scrivi cosa ti passa per la mente…";
  const askCta = lang === "en" ? "Talk to EMMA" : "Parla con EMMA";
  const loadingLabel =
    lang === "en" ? "EMMA is thinking about an answer for you…" : "EMMA sta pensando alla risposta per te…";

  const examplePillsEn = [
    "I feel overwhelmed",
    "I don’t know how to handle something",
    "Something is making me anxious",
    "I feel left out",
  ];

  const examplePillsIt = [
    "Mi sento sopraffatto",
    "Non so come gestire una situazione",
    "Qualcosa mi fa stare male",
    "Mi sento escluso",
  ];

  const examplePills = lang === "en" ? examplePillsEn : examplePillsIt;

  const handleSelectExample = (value: string) => {
    setMode("session");
    setText(value);
  };

  if (mode === "home") {
    return (
      <div className="flex min-h-screen w-full justify-center px-6 overflow-x-hidden">
        <div
          className="mx-auto flex w-full max-w-[480px] flex-col text-center text-white pt-16 pb-10"
          style={{ minHeight: "calc(100vh - 56px)" }}
        >
          <header className="mb-6 flex items-center justify-between">
            <div className="text-left text-[11px] text-[#C9CEFF]">
              {user ? (
                <p>
                  {lang === "en" ? "You are using EMMA as " : "Stai usando EMMA come "}
                  <span className="font-semibold">{user.email}</span>
                </p>
              ) : (
                <p>
                  {lang === "en" ? "You are using EMMA as a guest" : "Stai usando EMMA come ospite"}
                </p>
              )}
            </div>
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

          <main className="flex flex-1 flex-col items-center gap-6 pt-4">
            <div className="flex flex-col items-center gap-3">
              <p className="text-[14px] font-light text-[#C9CEFF]">
                {lang === "en" ? "Hi, I’m EMMA" : "Ciao, sono EMMA"}
              </p>
              <h1 className="text-[30px] font-semibold leading-snug text-white">
                {homeTitle}
              </h1>
              <p className="max-w-[92%] text-[16px] leading-relaxed text-[#C9CEFF]">
                {homeSubtitle}
              </p>
            </div>

            <div className="flex w-full flex-wrap justify-center gap-3">
              {examplePills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handleSelectExample(pill)}
                  className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-[15px] text-white/90 backdrop-blur-sm hover:bg-white/20 emma-btn-soft"
                >
                  {pill}
                </button>
              ))}
            </div>

            <p className="footer-info">
              {lang === "en"
                ? "Private & anonymous · No account needed · Safe space"
                : "Privato e anonimo · Nessun account · Spazio sicuro"}
            </p>

            <button
              type="button"
              onClick={startSession}
              className="emma-btn-soft mt-2 inline-flex w-full max-w-[320px] items-center justify-center rounded-full bg-[#4f46e5] px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-[#4338ca] mx-auto"
            >
              {homeCta}
            </button>
          </main>

          <footer className="mt-6 text-center text-[11px] text-white/60">
            <button
              type="button"
              onClick={() => setShowDataSheet(true)}
              className="underline-offset-2 hover:underline"
            >
              {lang === "en" ? "How we use your data" : "Come usiamo i tuoi dati"}
            </button>
          </footer>

          {showDataSheet && (
            <div className="emma-bottom-sheet-overlay" onClick={() => setShowDataSheet(false)}>
              <div
                className="emma-bottom-sheet"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between text-[12px] text-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setShowDataSheet(false)}
                    className="text-sm text-white/70 hover:text-white"
                  >
                    {lang === "en" ? "Close" : "Chiudi"}
                  </button>
                  <span className="uppercase tracking-[0.18em] text-indigo-200/90">EMMA</span>
                </div>
                <h2 className="mb-2 text-[18px] font-semibold text-white">
                  {lang === "en" ? "How we use your data" : "Come usiamo i tuoi dati"}
                </h2>
                <p className="text-[14px] leading-relaxed text-slate-100/90">
                  {lang === "en"
                    ? "EMMA stores only what is necessary to respond to your message. Your conversations are not used to profile you or show advertising. You can close this app at any time and your current session will end."
                    : "EMMA conserva solo ciò che serve per rispondere al tuo messaggio. Le tue conversazioni non vengono usate per profilarti o mostrarti pubblicità. Puoi chiudere l’app in qualsiasi momento e la tua sessione attuale terminerà."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Session view
  return (
    <div className="flex min-h-screen w-full justify-center px-6 overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[480px] flex-col text-white pt-20 pb-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="text-left text-[11px] text-[#C9CEFF]">
            {user ? (
              <p>
                {lang === "en" ? "You are using EMMA as " : "Stai usando EMMA come "}
                <span className="font-semibold">{user.email}</span>
              </p>
            ) : (
              <p>
                {lang === "en" ? "You are using EMMA as a guest" : "Stai usando EMMA come ospite"}
              </p>
            )}
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
          <p className="text-[14px] font-light text-[#C9CEFF]">
            {lang === "en" ? "I’m here. Start when you’re ready." : "Sono qui. Inizia quando vuoi."}
          </p>
          <h1 className="text-[28px] font-semibold tracking-tight text-white">
            {sessionTitle}
          </h1>
          <p className="max-w-[90%] text-[16px] text-[#C9CEFF]">
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

        <form onSubmit={handleAskAdvice} className="mt-9 flex flex-col items-center space-y-5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="emma-input-fade emma-textarea"
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
            className="emma-btn-soft mx-auto inline-flex w-full max-w-[320px] items-center justify-center rounded-full bg-[#4f46e5] px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? loadingLabel : askCta}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <footer className="mt-6 text-center text-[11px] text-white/60">
          <button
            type="button"
            onClick={() => setShowDataSheet(true)}
            className="underline-offset-2 hover:underline"
          >
            {lang === "en" ? "How we use your data" : "Come usiamo i tuoi dati"}
          </button>
        </footer>

        {showDataSheet && (
          <div className="emma-bottom-sheet-overlay" onClick={() => setShowDataSheet(false)}>
            <div
              className="emma-bottom-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between text-[12px] text-slate-200/80">
                <button
                  type="button"
                  onClick={() => setShowDataSheet(false)}
                  className="text-sm text-white/70 hover:text-white"
                >
                  {lang === "en" ? "Close" : "Chiudi"}
                </button>
                <span className="uppercase tracking-[0.18em] text-indigo-200/90">EMMA</span>
              </div>
              <h2 className="mb-2 text-[18px] font-semibold text-white">
                {lang === "en" ? "How we use your data" : "Come usiamo i tuoi dati"}
              </h2>
              <p className="text-[14px] leading-relaxed text-slate-100/90">
                {lang === "en"
                  ? "EMMA stores only what is necessary to respond to your message. Your conversations are not used to profile you or show advertising. You can close this app at any time and your current session will end."
                  : "EMMA conserva solo ciò che serve per rispondere al tuo messaggio. Le tue conversazioni non vengono usate per profilarti o mostrarti pubblicità. Puoi chiudere l’app in qualsiasi momento e la tua sessione attuale terminerà."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
