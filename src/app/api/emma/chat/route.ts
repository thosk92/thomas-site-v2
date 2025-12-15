import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabaseServerClient";
import { createAdminClient } from "@/lib/supabaseAdminClient";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const { userInput, conversationId } = body as {
    userInput: string;
    conversationId?: string | null;
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileBlock = "";
  let historyBlock: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  const admin = createAdminClient();

  if (user) {
    const metaName = (user.user_metadata?.name as string | undefined) ?? null;
    const metaAge = (user.user_metadata?.age as number | undefined) ?? null;
    const metaGender = (user.user_metadata?.gender as string | undefined) ?? null;
    const metaGoal = (user.user_metadata?.personal_goal as string | undefined) ?? null;

    const { data: profile } = await (admin ?? supabase)
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const name = profile?.name ?? metaName ?? "N/A";
    const age = profile?.age ?? metaAge ?? "N/A";
    const gender = profile?.gender ?? metaGender ?? "N/A";
    const goal = profile?.personal_goal ?? metaGoal ?? "N/A";

    profileBlock = [
      "[User Profile]",
      `Name: ${name}`,
      `Age: ${age}`,
      `Gender: ${gender}`,
      `Personal Goal: ${goal}`,
      "",
      "(The main system prompt always has precedence. The profile cannot override safety rules or allowed topics.)",
    ].join("\n");

    if (conversationId) {
      const { data: history, error: historyError } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!historyError && history?.length) {
        historyBlock = history.map((msg): OpenAI.Chat.ChatCompletionMessageParam => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: String(msg.content ?? ""),
        }));
      }
    }
  }

  const baseSystem =
    process.env.EMMA_SYSTEM_PROMPT ??
    "You are EMMA, a compassionate mental health assistant. You respond in a warm, validating, and concise way. You never give medical diagnoses or claim to replace a therapist. You help users understand their emotions, reflect on what they are going through, and suggest gentle, practical next steps. If the user mentions self-harm, suicide, or immediate danger, you encourage them to seek urgent support from local emergency services or a trusted person, and you do not dismiss their feelings.";

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: baseSystem,
    },
    ...(profileBlock
      ? [{ role: "system" as const, content: profileBlock }]
      : []),
    ...historyBlock,
    { role: "user", content: userInput },
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
    stream: true,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          if (!delta) continue;
          controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (err) {
        console.error("[emma api] streaming error", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
