"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;

      if (!sessionUser) {
        window.location.href = "/";
      } else {
        setUser(sessionUser);
      }
    });
  }, []);

  if (!user) return null;

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl mb-6">Benvenuto nella chat di EMMA</h1>
      {/* QUI ci metti il componente della chat */}
    </main>
  );
}
