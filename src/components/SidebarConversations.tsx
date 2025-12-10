"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getConversations,
  deleteConversation,
  deleteAllConversations,
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
        className="w-full rounded-lg bg-white text-slate-900 px-3 py-2 text-sm font-semibold hover:bg-slate-100"
        onClick={() => {
          router.push("/chat");
        }}
      >
        + Nuova conversazione
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
            <button
              type="button"
              className="ml-1 text-[11px] text-red-300 hover:text-red-400"
              onClick={async (e) => {
                e.stopPropagation();
                await deleteConversation(c.id);
                await load();
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {conversations.length > 0 && (
        <button
          type="button"
          className="mt-2 text-[11px] text-red-400 underline-offset-2 hover:underline"
          onClick={async () => {
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
