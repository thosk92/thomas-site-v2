"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ChatRedirectPage() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;

      if (!user) {
        window.location.href = "/";
      } else {
        window.location.href = "/emma";
      }
    });
  }, []);

  return null;
}
