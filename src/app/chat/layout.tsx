import { ReactNode } from "react";
import { createClientReadOnly } from "@/lib/supabaseServerClient";
import ChatShell from "@/components/ChatShell";

export const dynamic = "force-dynamic";

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const supabase = await createClientReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ChatShell userId={user?.id}>{children}</ChatShell>;
}
