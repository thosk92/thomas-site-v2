import { ReactNode } from "react";
import { createClientReadOnly } from "@/lib/supabaseServerClient";
import SidebarConversations from "@/components/SidebarConversations";

export const dynamic = "force-dynamic";

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const supabase = await createClientReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="emma-chat-bg min-h-screen w-full text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-4 px-4 py-4 md:px-6">
        <div className="hidden w-[280px] shrink-0 md:block">
          <SidebarConversations userId={user?.id} />
        </div>
        <main className="flex-1 min-w-0 rounded-3xl border border-white/5 bg-white/5/50 shadow-2xl shadow-black/30 backdrop-blur-md">
          {children}
        </main>
      </div>
    </div>
  );
}
