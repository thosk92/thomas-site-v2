"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EmmaHome from "../emma/page";

function ChatPageInner() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  return <EmmaHome initialConversationId={conversationId} />;
}

export default function ChatPage() {
  // Riusiamo la stessa UI di EMMA dentro il layout /chat, passando la conversazione selezionata
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}
