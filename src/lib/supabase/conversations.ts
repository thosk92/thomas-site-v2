import { supabase } from "@/lib/supabaseClient";

export async function createConversation(userId: string, title?: string | null) {
  const res = await fetch("/api/conversations/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  const res = await fetch("/api/conversations/list");
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to fetch conversations");
  }
  const { conversations } = await res.json();
  return conversations ?? [];
}

export async function deleteConversation(conversationId: string) {
  const res = await fetch("/api/conversations/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: conversationId }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to delete conversation");
  }
}

export async function deleteAllConversations(userId: string) {
  const res = await fetch("/api/conversations/delete-all", { method: "POST" });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to delete conversations");
  }
}

export async function updateConversationTitle(conversationId: string, title: string) {
  const res = await fetch("/api/conversations/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: conversationId, title }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to update conversation");
  }
  const { conversation } = await res.json();
  return conversation;
}
