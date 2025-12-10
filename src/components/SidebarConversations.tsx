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

type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
};

type Props = {
  userId: string;
};

export default function SidebarConversations({ userId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeConversationId = searchParams.get("conversationId");

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await getConversations(userId);
      setConversations(list);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex h-full flex-col gap-3 border-r border-white/10 bg-black/70 p-4 text-white">
      <button
        type="button"
        className="w-full rounded-lg bg-white text-slate-900 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={creating || loading}
        onClick={async () => {
          if (!userId) return;
          setCreating(true);
          try {
            const conv = await createConversation(userId, "Nuova conversazione");
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
      <button
        type="button"
        className="w-full rounded-lg border border-white/15 bg-transparent text-white px-3 py-2 text-sm font-medium hover:bg-white/10"
        onClick={() => router.push("/account")}
      >
        Profilo e preferenze
      </button>

      <div className="mt-2 flex-1 space-y-1 overflow-y-auto text-sm">
        {loading && <p className="text-xs text-slate-300">Caricamento…</p>}
        {!loading && conversations.length === 0 && (
          <p className="text-xs text-slate-400">Nessuna conversazione salvata.</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-xs transition-colors ${
              activeConversationId === c.id
                ? "bg-white text-slate-900"
                : "bg-white/5 text-slate-100 hover:bg-white/10"
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
            setLoading(true);
            await deleteAllConversations(userId);
            await load();
          }}
        >
          Cancella tutte le conversazioni
        </button>
      )}
    </div>
  );
}
