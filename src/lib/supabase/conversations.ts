import { supabase } from "@/lib/supabaseClient";

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

export async function createConversation(userId: string, title?: string | null) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/conversations/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to create conversation");
  }
  const { conversation } = await res.json();
  return conversation;
}

export async function getConversations(userId: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/conversations/list", { headers: authHeaders });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to fetch conversations");
  }
  const { conversations } = await res.json();
  return conversations ?? [];
}

export async function deleteConversation(conversationId: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/conversations/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ id: conversationId }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to delete conversation");
  }
}

export async function deleteAllConversations(userId: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/conversations/delete-all", { method: "POST", headers: authHeaders });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to delete conversations");
  }
}

export async function updateConversationTitle(conversationId: string, title: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/conversations/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ id: conversationId, title }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to update conversation");
  }
  const { conversation } = await res.json();
  return conversation;
}
