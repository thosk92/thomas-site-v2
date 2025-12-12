"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getConversations,
  deleteConversation,
  deleteAllConversations,
  createConversation,
  updateConversationTitle,
} from "@/lib/supabase/conversations";
import { supabase } from "@/lib/supabaseClient";
import {
  LANG_OPTIONS,
  isSupportedLang,
  mapLocaleToLang,
  type Lang,
} from "@/lib/languageDetection";

type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
};

type Props = {
  userId?: string | null;
};

export default function SidebarConversations({ userId }: Props) {
  const [resolvedUserId, setResolvedUserId] = useState<string | null | undefined>(userId);
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("emma:lang");
      if (isSupportedLang(stored)) return stored;
      return mapLocaleToLang(navigator.language || navigator.languages?.[0]);
    }
    return "en-US";
  });
  const [persistingLang, setPersistingLang] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeConversationId = searchParams.get("conversationId");

  // Sync with userId from props when it changes (SSR -> CSR)
  useEffect(() => {
    if (userId && userId !== resolvedUserId) {
      setResolvedUserId(userId);
      setAuthReady(true);
    }
  }, [userId, resolvedUserId]);

  useEffect(() => {
    let active = true;

    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      const session = data.session;
      const id = session?.user?.id ?? null;
      const email = session?.user?.email ?? null;
      const metaLang = session?.user?.user_metadata?.lang as string | undefined;
      if (!resolvedUserId) setResolvedUserId(id);
      setResolvedEmail(email);
      if (isSupportedLang(metaLang)) {
        setSelectedLang(metaLang);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("emma:lang", metaLang);
        }
      } else if (typeof navigator !== "undefined" && !window.localStorage.getItem("emma:lang")) {
        const navLang = mapLocaleToLang(navigator.language || navigator.languages?.[0]);
        setSelectedLang(navLang);
      }
      setAuthReady(true);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setResolvedUserId(session?.user?.id ?? null);
      setResolvedEmail(session?.user?.email ?? null);
      const metaLang = session?.user?.user_metadata?.lang as string | undefined;
      if (isSupportedLang(metaLang)) {
        setSelectedLang(metaLang);
      }
      setAuthReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [resolvedUserId]);

  // Default language when no session (browser locale)
  useEffect(() => {
    if (resolvedUserId) return;
    if (typeof navigator !== "undefined") {
      setSelectedLang(mapLocaleToLang(navigator.language || navigator.languages?.[0]));
    }
  }, [resolvedUserId]);

  useEffect(() => {
    // Se abbiamo l'utente ma non l'email (es. userId passato da SSR), proviamo a leggerla dalla sessione client
    if (!resolvedUserId || resolvedEmail) return;
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? null;
      if (email) {
        setResolvedEmail(email);
      }
    });
  }, [resolvedUserId, resolvedEmail]);

  const load = useCallback(async () => {
    if (!resolvedUserId) return;
    setLoading(true);
    try {
      const list = await getConversations(resolvedUserId);
      setConversations(list);
    } finally {
      setLoading(false);
    }
  }, [resolvedUserId]);

  useEffect(() => {
    if (!authReady) return;
    load();
  }, [authReady, load]);

  // Load language preference from profile (if available)
  useEffect(() => {
    if (!authReady || !resolvedUserId || profileLoaded) return;
    let active = true;
    (async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("language_preference")
          .eq("id", resolvedUserId)
          .maybeSingle();
        if (!active) return;
        const pref = data?.language_preference as string | undefined;
        if (isSupportedLang(pref)) {
          setSelectedLang(pref);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("emma:lang", pref);
          }
        }
        setProfileLoaded(true);
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, [authReady, resolvedUserId, profileLoaded]);

  const persistLang = useCallback(
    async (lang: Lang) => {
      setPersistingLang(true);
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("emma:lang", lang);
        }
        await fetch("/api/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language_preference: lang }),
        });
        try {
          await supabase.auth.updateUser({ data: { lang } });
        } catch {
          // ignore client metadata failures
        }
        window.dispatchEvent(new CustomEvent("emma:lang-change", { detail: { lang } }));
      } catch (err) {
        console.error("[sidebar] failed to persist profile lang", err);
      } finally {
        setPersistingLang(false);
      }
    },
    [],
  );

  useEffect(() => {
    const onLangChange = (event: Event) => {
      const detail = (event as CustomEvent<{ lang?: Lang }>).detail;
      if (detail?.lang && isSupportedLang(detail.lang)) {
        setSelectedLang(detail.lang);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("emma:lang", detail.lang);
        }
      }
    };
    window.addEventListener("emma:lang-change", onLangChange);
    return () => window.removeEventListener("emma:lang-change", onLangChange);
  }, []);

  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5/60 p-4 text-white shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-white/80">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-indigo-100/80">EMMA</p>
          <p className="text-sm font-semibold text-white">Chat</p>
          <p className="text-[11px] text-white/70">
            {authReady && resolvedUserId
              ? resolvedEmail || "Profilo attivo"
              : "Ospite · accedi per salvare"}
          </p>
        </div>
        <div className="flex flex-col gap-2 text-[11px]">
          <select
            value={selectedLang}
            onChange={(e) => {
              const next = e.target.value as Lang;
              setSelectedLang(next);
              persistLang(next);
            }}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-[12px] font-medium text-white focus:outline-none"
            disabled={persistingLang}
          >
            {LANG_OPTIONS.map((option) => (
              <option key={option.code} value={option.code} className="text-slate-900">
                {option.label}
              </option>
            ))}
          </select>
          <a
            href="/account"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-[11px] font-medium text-white hover:bg-white/10"
          >
            Account e preferenze
          </a>
        </div>
      </div>

      <button
        type="button"
        className="w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-sm font-semibold shadow-lg shadow-indigo-900/40 transition hover:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={!resolvedUserId || creating || loading}
        onClick={async () => {
          if (!resolvedUserId) return;
          setCreating(true);
          try {
            const conv = await createConversation(resolvedUserId, "Nuova conversazione");
            setConversations((prev) => [conv, ...prev]);
            router.push(`/chat?conversationId=${conv.id}`);
          } catch (err) {
            console.error("[sidebar] failed to create conversation", err);
          } finally {
            setCreating(false);
          }
        }}
      >
        {creating ? "Creazione in corso…" : "+ Nuova conversazione"}
      </button>

      <div className="mt-2 flex-1 space-y-1 overflow-y-auto text-sm px-1">
        {(loading || !authReady) && (
          <p className="text-xs text-slate-300">Caricamento…</p>
        )}
        {!loading && authReady && conversations.length === 0 && (
          <p className="text-xs text-slate-400">
            {resolvedUserId
              ? "Nessuna conversazione salvata."
              : "Nessuna conversazione: accedi per iniziare a salvarle."}
          </p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 text-xs transition-colors ${
              activeConversationId === c.id
                ? "border-white/50 bg-white/30 text-slate-900 shadow"
                : "border-white/10 bg-white/10 text-slate-100 hover:border-white/30 hover:bg-white/15"
            }`}
            onClick={() => {
              router.push(`/chat?conversationId=${c.id}`);
            }}
          >
            <span className="mr-2 line-clamp-2 flex-1 text-left">
              {c.title || "Conversazione"}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="text-[11px] text-slate-200 hover:text-white"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!resolvedUserId) return;
                  const nextTitle = window.prompt("Rinomina conversazione", c.title ?? "Conversazione");
                  if (nextTitle === null) return;
                  const trimmed = nextTitle.trim();
                  if (!trimmed) return;
                  setLoading(true);
                  try {
                    await updateConversationTitle(c.id, trimmed);
                    await load();
                  } catch (err) {
                    console.error("[sidebar] failed to rename conversation", err);
                  } finally {
                    setLoading(false);
                  }
                }}
                aria-label="Rinomina"
                title="Rinomina"
              >
                ✎
              </button>
              <button
                type="button"
                className="ml-1 text-[11px] text-red-300 hover:text-red-400"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!resolvedUserId) return;
                  setLoading(true);
                  await deleteConversation(c.id);
                  await load();
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {conversations.length > 0 && (
        <button
          type="button"
          className="mt-2 text-[11px] text-red-400 underline-offset-2 hover:underline"
          onClick={async () => {
            if (!resolvedUserId) return;
            setLoading(true);
            await deleteAllConversations(resolvedUserId);
            await load();
          }}
        >
          Cancella tutte le conversazioni
        </button>
      )}

      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("emma:open-data-sheet"))}
        className="mt-auto inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-[11px] font-medium text-white transition hover:bg-white/10"
      >
        Come usiamo i tuoi dati
      </button>
    </div>
  );
}
