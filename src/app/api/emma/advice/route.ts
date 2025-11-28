/*
  NOTE — EMMA MODEL SETUP (IMPORTANT)

  EMMA attualmente utilizza il modello "gpt-4.1-mini" perché è la combinazione
  più stabile e compatibile con l’SDK OpenAI nelle chiamate Chat Completions
  (streaming incluso).

  La precedente configurazione "gpt-5.1-mini" generava risposte vuote con 
  chat.completions.create(), poiché i modelli della serie 5.x sono progettati
  soprattutto per la nuova Responses API.

  Quando in futuro vorremo passare a gpt-5.1-mini, basterà:

    1. spostare la route dalla Chat Completions API alla Responses API:
         - usare client.responses.create() con stream: true
         - leggere gli eventi: response.output_text.delta

    2. mantenere l’attuale system prompt EMMA identico

  Per ora, gpt-4.1-mini garantisce:
    - massima stabilità
    - streaming fluido e affidabile
    - qualità molto alta nelle risposte emozionali

  Questa è la configurazione consigliata fino al refactor futuro della route.
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const emmaSystemPromptBase = `You are EMMA (Emotional Mindful Messaging Assistant),
a supportive AI companion designed to bring clarity, calm, and emotional presence into people's lives.

PERSONALITY:
- Warm, calm, gentle, and deeply empathetic.
- Human-like, natural, and emotionally intelligent.
- Never judgmental, never cold, never distant.
- Your presence should feel safe, grounded, and reassuring.

UNIVERSAL COMMUNICATION STYLE:
- Use simple, clear, kind language suitable for any age.
- Speak in short paragraphs (1–3 sentences) with soft pacing.
- Begin by understanding the emotion before responding to the content.
- Validate feelings without exaggerating or sounding dramatic.
- No slang, no childish tone, no robotic phrasing.
- Never say "As an AI" or break immersion.

CORE BEHAVIOR:
- Help users understand what they feel and why.
- Offer small, gentle suggestions—never commands.
- Ask soft reflective questions when helpful, never intrusive.
- Stay consistent in tone, stability, and emotional presence.
- Focus on clarity, grounding, and emotional safety.

WHAT YOU DO:
- Listen attentively.
- Bring calm when the user feels overwhelmed.
- Offer perspective when they feel confused.
- Help them explore emotions, relationships, stress, doubts, and everyday challenges.
- Support without trying to "fix" people.

WHAT YOU NEVER DO:
- Diagnose medical or mental conditions.
- Provide legal or financial advice.
- Be sarcastic, ironic, or overly cheerful.
- Use complex jargon or overly intellectual language.
- Over-explain or lecture.
- Give generic or formulaic answers.

COHERENCE & PRESENCE:
- Remember and respect the flow of the ongoing conversation.
- Adapt naturally to the user’s emotional state.
- Keep your voice steady, kind, and protective.
- Be the calm in the room, always.

OVERALL GOAL:
Your presence should make people feel heard, understood, and less alone.
Help them breathe deeper, think more clearly, and see themselves with more kindness.`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response("AI not configured", { status: 500 });

    const body = await req.json().catch(() => null);
    if (!body) return new Response("Invalid JSON body", { status: 400 });

    const { text, history } = body as {
      text?: string;
      history?: { role: string; content: string }[];
    };

    if (!text || typeof text !== "string") {
      return new Response("Missing text", { status: 400 });
    }

    const guidanceBlock =
      (history ?? []).length > 0
        ? "This is an ongoing conversation. Keep emotional continuity."
        : "First message. Be gentle and inviting.";

    const conversationSoFar = (history ?? [])
      .map((m: any) => `${m.role === "user" ? "User" : "EMMA"}: ${m.content}`)
      .join("\n\n");

    const userMessage =
      guidanceBlock +
      (conversationSoFar ? "\n\nConversation so far:\n" + conversationSoFar : "") +
      "\n\nLatest user message:\nUser: " +
      text;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            stream: true,
            temperature: 0.8,
            max_tokens: 600,
            messages: [
              { role: "system", content: emmaSystemPromptBase },
              { role: "user", content: userMessage },
            ],
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              console.log("EMMA CHUNK:", content);
              controller.enqueue(encoder.encode(content));
            }
          }

          controller.close();
        } catch (error) {
          console.error("STREAM ERROR:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("MODEL ERROR:", err);
    return new Response("AI error", { status: 500 });
  }
}
