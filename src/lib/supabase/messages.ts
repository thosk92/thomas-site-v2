export type ConversationMessage = {
  role: "user" | "assistant";
  content: string | null;
};

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

export async function getMessages(conversationId: string): Promise<ConversationMessage[]> {
  const res = await fetch(`/api/messages/list?conversationId=${encodeURIComponent(conversationId)}`);
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Failed to fetch messages");
  }

  const { messages } = await res.json();
  return (messages ?? []) as ConversationMessage[];
}
