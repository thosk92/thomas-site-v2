import EmmaHome from "@/components/EmmaHome";

export default async function EmmaPage({
  searchParams,
}: {
  searchParams?: Promise<{ conversationId?: string | string[] }>;
}) {
  const sp = await searchParams;
  const conversationId =
    typeof sp?.conversationId === "string" ? sp.conversationId : null;

  return <EmmaHome initialConversationId={conversationId} />;
}
