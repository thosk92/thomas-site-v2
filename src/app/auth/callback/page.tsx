"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CallbackPage() {
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        window.location.href = "/chat";
      } else {
        window.location.href = "/";
      }
    }

    checkSession();
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <p>Caricamento…</p>
    </main>
  );
}
