"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import GoogleLogo from "../../g-logo.png";
import EmmaLogoWhite from "../../logo emma bianco .png";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;

      if (sessionUser) {
        window.location.href = "/emma"; // <<< QUI il redirect corretto
        return;
      }

      setUser(null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          window.location.href = "/emma"; // <<< ANCHE QUI
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
        <main className="flex flex-1 flex-col items-center gap-6 pt-4">
          <Image
            src={EmmaLogoWhite}
            alt="EMMA Logo"
            width={120}
            height={120}
            className="mb-4"
          />

          <h1 className="text-[24px] font-semibold mb-2 text-white">
            Sign in to start your experience with EMMA
          </h1>

          <div className="flex flex-col gap-4 w-full max-w-xs mt-2">
            {/* GOOGLE */}
            <button
              className="w-full bg-white text-black border border-gray-300 px-4 py-3 rounded-xl flex items-center justify-center gap-3"
              onClick={() =>
                supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                })
              }
            >
              <Image src={GoogleLogo} width={20} height={20} alt="Google Logo" />
              Sign in with Google
            </button>

            {/* EMAIL / PASSWORD */}
            <div className="mt-4 flex flex-col gap-2 text-left">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-lg px-3 py-2 text-sm text-slate-900 border border-white/40 bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg px-3 py-2 text-sm text-slate-900 border border-white/40 bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />

              <div className="mt-2 flex flex-col gap-2">
                <button
                  disabled={authLoading}
                  className="w-full rounded-xl bg-white/90 text-slate-900 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={async () => {
                    setAuthError(null);
                    setAuthLoading(true);
                    try {
                      const { error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                      });
                      if (error) {
                        setAuthError(error.message);
                      }
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                >
                  Sign in with email
                </button>
                <button
                  disabled={authLoading}
                  className="w-full rounded-xl border border-white/60 text-white px-4 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={async () => {
                    setAuthError(null);
                    setAuthLoading(true);
                    try {
                      const { error } = await supabase.auth.signUp({
                        email,
                        password,
                      });
                      if (error) {
                        setAuthError(error.message);
                      }
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                >
                  Sign up with email
                </button>
              </div>

              {authError && (
                <p className="mt-1 text-xs text-red-200">{authError}</p>
              )}
            </div>

            {/* GUEST */}
            <button
              className="w-full border border-white/40 px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition"
              onClick={() => {
                window.location.href = "/emma";
              }}
            >
              Continue as guest
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
