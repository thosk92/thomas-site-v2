"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import AccountProfileForm from "@/components/AccountProfileForm";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  name: string | null;
  age: number | null;
  gender: string | null;
  personal_goal: string | null;
  language_preference: string | null;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionSynced, setSessionSynced] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (!sessionUser) {
        setLoading(false);
        return;
      }

      // Ensure server-side session cookies are set for API routes (needed for profile update)
      if (!sessionSynced && data.session) {
        try {
          await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }),
          });
          setSessionSynced(true);
        } catch {
          // ignore sync errors; API may still work if cookies are already valid
        }
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (active) {
        setProfile({
          name: profileData?.name ?? null,
          age: profileData?.age ?? null,
          gender: profileData?.gender ?? null,
          personal_goal: profileData?.personal_goal ?? null,
          language_preference: profileData?.language_preference ?? null,
        });
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const initialProfile: Profile = profile ?? {
    name: null,
    age: null,
    gender: null,
    personal_goal: null,
    language_preference: null,
  };

  return (
    <div className="emma-chat-bg min-h-screen w-full px-6 pb-16 pt-16 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-200/80">Account</p>
            <h1 className="text-3xl font-semibold text-white">Il tuo profilo</h1>
            <p className="text-sm text-white/70">
              Aggiorna i dati che EMMA può usare per personalizzare le risposte.
            </p>
          </div>
          <Link
            href="/emma"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Torna alla chat
          </Link>
        </header>

        {loading ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur">
            Caricamento…
          </div>
        ) : user ? (
          <AccountProfileForm initialProfile={initialProfile} email={user.email} />
        ) : (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80 backdrop-blur">
            <h2 className="text-xl font-semibold text-white">Accedi per gestire il profilo</h2>
            <p className="mt-2 text-sm text-white/70">
              Per modificare i dati del profilo entra con il tuo account.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Vai al login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
