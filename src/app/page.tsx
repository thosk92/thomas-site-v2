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
            Accedi per iniziare la tua esperienza con EMMA
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
              Accedi con Google
            </button>

            {/* GUEST */}
            <button
              className="w-full border border-white/40 px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition"
              onClick={() => {
                window.location.href = "/emma";
              }}
            >
              Continua come ospite
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
