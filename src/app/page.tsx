"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import GoogleLogo from "../../g-logo.png";
import EmmaLogoWhite from "../../logo emma bianco .png";
import { mapLocaleToLang } from "@/lib/languageDetection";

type Lang = "it" | "en";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signupNotice, setSignupNotice] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;

      if (sessionUser) {
        window.location.href = "/chat"; // redirect post-login verso area con sidebar
        return;
      }

      setUser(null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          window.location.href = "/chat";
        }
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const navLang = mapLocaleToLang(navigator.language || navigator.languages?.[0]);
      setLang(navLang.startsWith("it") ? "it" : "en");
    }
  }, []);

  if (loading) return null;

  return (
    <div className="emma-chat-bg flex min-h-screen w-full items-center justify-center px-4 pb-10 pt-14">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5/60 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent" aria-hidden />
        <div className="relative grid gap-10 px-6 py-10 md:grid-cols-2 md:px-10 md:py-12">
          <div className="flex flex-col justify-center space-y-5 text-white/90">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-indigo-100/80">
              <span>EMMA</span>
              <span className="h-1 w-1 rounded-full bg-indigo-200" />
              <span>{lang === "en" ? "Secure access" : "Accesso sicuro"}</span>
            </div>
            <Image src={EmmaLogoWhite} alt="EMMA Logo" width={90} height={90} className="logo-glow" />
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {lang === "en"
                  ? "Sign in to start your experience with EMMA"
                  : "Accedi per iniziare la tua esperienza con EMMA"}
              </h1>
              <p className="text-sm text-white/75 md:text-base">
                {lang === "en"
                  ? "Private, calm, focused on your words. Your session starts the moment you enter."
                  : "Privato, sereno, focalizzato sulle tue parole. La sessione inizia appena entri."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[12px] text-white/70 backdrop-blur">
              {lang === "en"
                ? "Language is selected automatically based on your region. You can change it later from the sidebar."
                : "La lingua è selezionata in automatico in base alla tua regione. Potrai cambiarla più tardi dalla sidebar."}
            </div>
          </div>

          <main className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-6 text-white shadow-inner shadow-black/30">
            <div className="flex flex-col gap-3">
              <button
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:-translate-y-[1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                onClick={() =>
                  supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback?next=/chat`,
                    },
                  })
                }
              >
                <span className="inline-flex items-center justify-center gap-3">
                  <Image src={GoogleLogo} width={20} height={20} alt="Google Logo" />
                  {lang === "en" ? "Continue with Google" : "Continua con Google"}
                </span>
              </button>

              <div className="relative my-2 flex items-center">
                <span className="h-px flex-1 bg-white/10" />
                <span className="px-3 text-[11px] uppercase tracking-[0.18em] text-white/50">
                  {lang === "en" ? "or" : "oppure"}
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="flex flex-col gap-2 text-left">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === "en" ? "Email" : "Email"}
                  className="w-full rounded-xl border border-white/15 bg-white/85 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === "en" ? "Password" : "Password"}
                  className="w-full rounded-xl border border-white/15 bg-white/85 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                />

                <div className="mt-2 flex flex-col gap-2">
                  <button
                    disabled={authLoading}
                    className="w-full rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
                    onClick={async () => {
                      setAuthError(null);
                      setSignupNotice(null);
                      setResetNotice(null);
                      setAuthLoading(true);
                      try {
                        const { data, error } = await supabase.auth.signInWithPassword({
                          email,
                          password,
                        });
                        if (error) {
                          setAuthError(error.message);
                        } else if (data.session) {
                          await fetch("/api/auth/set-session", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              access_token: data.session.access_token,
                              refresh_token: data.session.refresh_token,
                            }),
                          }).catch(() => {});
                        }
                      } finally {
                        setAuthLoading(false);
                      }
                    }}
                  >
                    {lang === "en" ? "Sign in with email" : "Accedi con email"}
                  </button>
                  <button
                    disabled={authLoading}
                    className="w-full rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                    onClick={async () => {
                      setAuthError(null);
                      setSignupNotice(null);
                      setResetNotice(null);
                      setAuthLoading(true);
                      try {
                        const { data, error } = await supabase.auth.signUp({
                          email,
                          password,
                          options: {
                            data: { lang },
                          },
                        });
                        if (error) {
                          setAuthError(error.message);
                        } else {
                          if (data.session) {
                            await fetch("/api/auth/set-session", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                access_token: data.session.access_token,
                                refresh_token: data.session.refresh_token,
                              }),
                            }).catch(() => {});
                          }
                          setSignupNotice(
                            lang === "en"
                              ? "We’ve sent you a verification email. Please check the inbox of the address you used to sign up."
                              : "Ti abbiamo inviato un'email di verifica. Controlla la casella di posta dell'indirizzo che hai usato per l'iscrizione."
                          );
                        }
                      } finally {
                        setAuthLoading(false);
                      }
                    }}
                  >
                    {lang === "en" ? "Sign up with email" : "Registrati con email"}
                  </button>
                  <button
                    type="button"
                    disabled={authLoading}
                    className="w-full text-[12px] text-white/80 underline-offset-2 hover:underline disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={async () => {
                      setAuthError(null);
                      setSignupNotice(null);
                      setResetNotice(null);
                      if (!email) {
                        setAuthError(
                          lang === "en"
                            ? "Please enter your email address to reset your password."
                            : "Inserisci il tuo indirizzo email per reimpostare la password."
                        );
                        return;
                      }
                      setAuthLoading(true);
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(email);
                        if (error) {
                          setAuthError(error.message);
                        } else {
                          setResetNotice(
                            lang === "en"
                              ? "We’ve sent you an email with instructions to reset your password."
                              : "Ti abbiamo inviato un'email con le istruzioni per reimpostare la password."
                          );
                        }
                      } finally {
                        setAuthLoading(false);
                      }
                    }}
                  >
                    {lang === "en" ? "Forgot password?" : "Password dimenticata?"}
                  </button>
                </div>

                {authError && (
                  <p className="mt-1 text-xs text-red-200">{authError}</p>
                )}
                {signupNotice && !authError && (
                  <p className="mt-1 text-xs text-emerald-200">{signupNotice}</p>
                )}
                {resetNotice && !authError && (
                  <p className="mt-1 text-xs text-emerald-200">{resetNotice}</p>
                )}
              </div>

              <button
                className="mt-1 w-full rounded-xl border border-white/30 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                onClick={() => {
                  window.location.href = "/chat";
                }}
              >
                {lang === "en" ? "Continue as guest" : "Continua come ospite"}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
