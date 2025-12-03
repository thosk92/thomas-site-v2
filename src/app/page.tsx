"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import GoogleLogo from "../../g-logo.png";
import AppleSignIn from "../../apple-account-sign-in.png";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;

      if (sessionUser) {
        window.location.href = "/chat";
      }

      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null;

        if (sessionUser) {
          window.location.href = "/chat";
        }
      },
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 bg-[#1D2150] text-[#F8FAFC]">

      <Image
        src="/emma-logo.png"
        alt="EMMA Logo"
        width={120}
        height={120}
        className="mb-8"
      />

      <h1 className="text-2xl font-semibold mb-6 text-center">
        Accedi per iniziare la tua esperienza con EMMA
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">

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
          Accedi con Google
        </button>

        {/* APPLE */}
        <button
          className="w-full bg-black text-white px-4 py-3 rounded-xl flex items-center justify-center gap-3"
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "apple",
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
              },
            })
          }
        >
          <Image
            src={AppleSignIn}
            width={20}
            height={20}
            alt="Apple Logo"
          />
          Accedi con Apple
        </button>

      </div>
    </main>
  );
}
