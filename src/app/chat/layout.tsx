import { ReactNode } from "react";
import { createClient } from "@/lib/supabaseServerClient";
import SidebarConversations from "@/components/SidebarConversations";

export const dynamic = "force-dynamic";

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen w-full bg-[#020617] text-white">
      <div className="hidden w-72 md:block">
        <SidebarConversations userId={user?.id} />
      </div>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
