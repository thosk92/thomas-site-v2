"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CallbackPage() {
  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      // TEMP: niente redirect, solo log per debug OAuth (Apple)
      console.log("/auth/callback session", data, error);
    }

    checkSession();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <p className="mb-2 font-semibold">OAuth callback</p>
      <p className="text-sm opacity-80">
        Debug attivo: la pagina non reindirizza automaticamente. Puoi copiare l&apos;URL dalla barra
        del browser e incollarlo nella chat.
      </p>
    </main>
  );
}
