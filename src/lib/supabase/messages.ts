import { supabase } from "@/lib/supabaseClient";

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) {
  const res = await fetch("/api/messages/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, role, content }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to save message");
  }
  const { message } = await res.json();
  return message;
}

export async function getMessages(conversationId: string) {
  // keep direct client fetch for history (read-only)
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
