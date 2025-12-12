"use client";

import { useState } from "react";
import SidebarConversations from "./SidebarConversations";

type Props = {
  userId?: string | null;
  children: React.ReactNode;
};

export default function ChatShell({ userId, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="emma-chat-bg min-h-screen w-full text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-4 px-4 py-4 md:px-6">
        <div className="hidden w-[280px] shrink-0 md:block">
          <SidebarConversations userId={userId} />
        </div>
        <main className="relative flex-1 min-w-0 rounded-3xl border border-white/5 bg-white/5/50 shadow-2xl shadow-black/30 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg shadow-black/30 transition hover:bg-white/20 md:hidden"
            aria-label="Apri menu"
          >
            <span className="sr-only">Apri menu</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
            </div>
          </button>
          <div className="h-full w-full">{children}</div>
        </main>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col border-r border-white/10 bg-black/90 p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between text-sm text-white/80">
              <span className="text-xs uppercase tracking-[0.2em] text-indigo-100/80">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/20 px-3 py-1 text-[12px] text-white hover:bg-white/10"
              >
                Chiudi
              </button>
            </div>
            <SidebarConversations userId={userId} />
          </div>
        </div>
      )}
    </div>
  );
}
