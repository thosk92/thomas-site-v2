import { supabase } from "@/lib/supabaseClient";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string | null;
};

async function getAuthHeaders() {
  const headers: Record<string, string> = {};
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  } catch {
    return headers;
  }
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/messages/save", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ conversationId, role, content }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to save message");
  }
  const { message } = await res.json();
  return message;
}

export async function getMessages(conversationId: string): Promise<ConversationMessage[]> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`/api/messages/list?conversationId=${encodeURIComponent(conversationId)}`, {
    headers: authHeaders,
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to fetch messages");
  }

  const { messages } = await res.json();
  return (messages ?? []) as ConversationMessage[];
}
