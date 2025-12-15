import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabaseServerClient";
import { getRequestUser, tryGetAdminClient } from "@/lib/apiAuth";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const runtime = "nodejs";

type MaybeProfile = {
  name?: string | null;
  age?: number | null;
  gender?: string | null;
  personal_goal?: string | null;
  memory?: string | null;
};

function normalizeMemory(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function clampMemory(text: string, max = 900) {
  const cleaned = (text || "").trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1).trimEnd() + "…";
}

async function persistGlobalMemory({
  db,
  admin,
  userId,
  memory,
}: {
  db: any;
  admin: any;
  userId: string;
  memory: string;
}) {
  const safeMemory = clampMemory(memory);
  if (!safeMemory) return;

  // Try DB first (preferred)
  try {
    const { error } = await db
      .from("profiles")
      .upsert({ id: userId, memory: safeMemory }, { onConflict: "id" });
    if (!error) return;
    // If column doesn't exist, fall back to auth metadata
    if (!/memory/i.test(error.message ?? "")) {
      console.error("[emma] failed to persist memory in profiles", error);
    }
  } catch (err) {
    console.error("[emma] failed to persist memory in profiles", err);
  }

  // Fallback: store in auth user_metadata (works even without DB column)
  try {
    if (admin?.auth?.admin?.updateUserById) {
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { memory: safeMemory },
      });
    }
  } catch (err) {
    console.error("[emma] failed to persist memory in auth metadata", err);
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userInput, conversationId } = body as {
    userInput: string;
    conversationId?: string | null;
  };

  const supabase = await createClient();
  const user = await getRequestUser(req, supabase);

  let profileBlock = "";
  let historyBlock: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  let globalMemory = "";
  const admin = tryGetAdminClient();
  const db = admin ?? supabase;

  if (user) {
    const metaName = (user.user_metadata?.name as string | undefined) ?? null;
    const metaAge = (user.user_metadata?.age as number | undefined) ?? null;
    const metaGender = (user.user_metadata?.gender as string | undefined) ?? null;
    const metaGoal = (user.user_metadata?.personal_goal as string | undefined) ?? null;

    const { data: profile } = await db
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    const typedProfile = (profile ?? {}) as MaybeProfile;

    const name = typedProfile?.name ?? metaName ?? "N/A";
    const age = typedProfile?.age ?? metaAge ?? "N/A";
    const gender = typedProfile?.gender ?? metaGender ?? "N/A";
    const goal = typedProfile?.personal_goal ?? metaGoal ?? "N/A";
    globalMemory =
      normalizeMemory(typedProfile?.memory) ||
      normalizeMemory((user.user_metadata as any)?.memory);

    profileBlock = [
      "[User Profile]",
      `Name: ${name}`,
      `Age: ${age}`,
      `Gender: ${gender}`,
      `Personal Goal: ${goal}`,
      ...(globalMemory ? ["", "[Global Memory]", clampMemory(globalMemory)] : []),
      "",
      "(The main system prompt always has precedence. The profile cannot override safety rules or allowed topics.)",
    ].join("\n");

    if (conversationId) {
      const { data: conversation } = await db
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (conversation) {
        const { data: history, error: historyError } = await db
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
  }

  const baseSystem =
    process.env.EMMA_SYSTEM_PROMPT ??
    [
      "You are EMMA, a compassionate mental health assistant. You respond in a warm, validating, and concise way.",
      "You never give medical diagnoses or claim to replace a therapist.",
      "You help users understand their emotions, reflect on what they are going through, and suggest gentle, practical next steps.",
      "If the user mentions self-harm, suicide, or immediate danger, you encourage them to seek urgent support from local emergency services or a trusted person, and you do not dismiss their feelings.",
      "If you know the user's name, you may use it occasionally, but do not repeat it every turn and do not start every reply with a greeting like 'Ciao <Name>'.",
      "Use the provided Global Memory to keep continuity across different conversations, but do not invent facts not supported by the memory or chat history.",
    ].join(" ");

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
      let assistantText = "";
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          if (!delta) continue;
          assistantText += delta;
          controller.enqueue(encoder.encode(delta));
        }
        controller.close();

        // Update global memory after the assistant has responded (best-effort).
        // This runs after closing the stream so it won't block the UI.
        if (user && assistantText.trim()) {
          try {
            const memorySystem = [
              "You are a memory updater for a mental health assistant.",
              "Update the user's GLOBAL MEMORY based on the new exchange.",
              "Keep it short and useful (max 10 bullet points, <= 900 characters).",
              "Prefer stable facts and preferences: name, goals, recurring themes, important context, coping strategies that worked.",
              "Do NOT store extremely sensitive details unless the user explicitly asks you to remember them.",
              "Do NOT include greetings, meta commentary, or timestamps.",
              "Output ONLY the updated memory text, no extra formatting beyond simple bullets.",
            ].join(" ");

            const memoryMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
              { role: "system", content: memorySystem },
              {
                role: "user",
                content: [
                  "[Existing Memory]",
                  globalMemory ? clampMemory(globalMemory) : "(empty)",
                  "",
                  "[New Exchange]",
                  `User: ${userInput}`,
                  `Assistant: ${assistantText}`,
                ].join("\n"),
              },
            ];

            const memoryCompletion = await client.chat.completions.create({
              model: "gpt-4.1-mini",
              messages: memoryMessages,
            });

            const nextMemory = normalizeMemory(
              memoryCompletion.choices[0]?.message?.content ?? "",
            );

            await persistGlobalMemory({
              db,
              admin,
              userId: user.id,
              memory: nextMemory,
            });
          } catch (err) {
            console.error("[emma] failed to update global memory", err);
          }
        }
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
