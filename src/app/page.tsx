"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import GoogleLogo from "../../g-logo.png";
import EmmaLogoWhite from "../../logo emma bianco .png";

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

  if (loading) return null;

  return (
    <div className="emma-immersive-bg flex min-h-screen w-full justify-center px-6 overflow-x-hidden">
      <div
        className="mx-auto flex w-full max-w-[480px] flex-col text-center text-white pt-16 pb-10"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        <header className="mb-4 flex items-center justify-end">
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
          <Image
            src={EmmaLogoWhite}
            alt="EMMA Logo"
            width={120}
            height={120}
            className="mb-4"
          />

          <h1 className="text-[24px] font-semibold mb-2 text-white">
            {lang === "en"
              ? "Sign in to start your experience with EMMA"
              : "Accedi per iniziare la tua esperienza con EMMA"}
          </h1>

          <div className="flex flex-col gap-4 w-full max-w-xs mt-2">
            {/* GOOGLE */}
            <button
              className="w-full bg-white text-black border border-gray-300 px-4 py-3 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/chat`,
                  },
                })
              }
            >
              <Image src={GoogleLogo} width={20} height={20} alt="Google Logo" />
              {lang === "en" ? "Sign in with Google" : "Accedi con Google"}
            </button>

            {/* EMAIL / PASSWORD */}
            <div className="mt-4 flex flex-col gap-2 text-left">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === "en" ? "Email" : "Email"}
                className="w-full rounded-lg px-3 py-2 text-sm text-slate-900 border border-white/40 bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === "en" ? "Password" : "Password"}
                className="w-full rounded-lg px-3 py-2 text-sm text-slate-900 border border-white/40 bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />

              <div className="mt-2 flex flex-col gap-2">
                <button
                  disabled={authLoading}
                  className="w-full rounded-xl bg-white/90 text-slate-900 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-70 disabled:cursor-not-allowed"
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
                  className="w-full rounded-xl border border-white/60 text-white px-4 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-70 disabled:cursor-not-allowed"
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
                  className="w-full text-[12px] text-white/80 underline-offset-2 hover:underline mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
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

            {/* GUEST */}
            <button
              className="w-full border border-white/40 px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition"
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
  );
}
