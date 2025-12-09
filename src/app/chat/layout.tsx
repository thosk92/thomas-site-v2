import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServerClient";
import SidebarConversations from "@/components/SidebarConversations";

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Per ora la sidebar non ha bisogno di conoscere la conversazione attiva a livello di layout.
  // La gestione dettagliata avverrà nel contenuto della pagina /chat.

  return (
    <div className="flex min-h-screen w-full bg-[#020617] text-white">
      <div className="hidden w-72 md:block">
        <SidebarConversations
          userId={user.id}
          activeConversationId={null}
          onSelectConversation={() => {}}
          onNewConversation={() => {}}
        />
      </div>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
