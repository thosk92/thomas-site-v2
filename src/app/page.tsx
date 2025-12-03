"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import GoogleLogo from "../../g-logo.png";

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
    <main className="flex flex-col items-center justify-center min-h-screen px-6 bg-[#1D2150] text-[#F8FAFC]">

      <Image
        src="/emmalogo.png"
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
  );
}
