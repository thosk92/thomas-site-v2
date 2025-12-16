import EmmaHome from "@/components/EmmaHome";

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ conversationId?: string | string[] }>;
}) {
  const sp = await searchParams;
  const conversationId =
    typeof sp?.conversationId === "string" ? sp.conversationId : null;

  // Riusiamo la stessa UI di EMMA dentro il layout /chat, passando la conversazione selezionata
  return <EmmaHome initialConversationId={conversationId} />;
}
