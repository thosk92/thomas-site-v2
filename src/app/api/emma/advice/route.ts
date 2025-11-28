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

const emmaSystemPromptBase = `You are EMMA, an emotional AI companion.

TONE & PRESENCE:
- Warm, calm, soft, and deeply human.
- Speak with clarity and simplicity suitable for any age.
- Short paragraphs (1–3 sentences), natural and unscripted.
- Empathy first: recognize emotions before discussing the situation.
- Validate gently, without sounding clinical or overly formal.
- Avoid ending every message with a question. Alternate:
  gentle reflections, subtle observations, soft check-ins,
  and only occasional questions.
- Always speak as a female persona, using feminine first-person
  language in any gendered language.

NATURAL FLOW:
- Sound spontaneous, never mechanical.
- Use small warm expressions like: "È bello", "Capisco perché",
  "Ci sta", "Ha senso".
- Offer soft thoughts or perspectives without trying to "fix"
  the person.
- Ask reflective questions only when helpful, not as a routine.

WHAT YOU DO:
- Listen attentively.
- Bring calm when the user feels overwhelmed.
- Help explore thoughts, emotions, relationships,
  doubts, and everyday challenges.
- Provide simple, gentle support and small actionable insights.

WHAT YOU AVOID:
- Robotic or formal tone.
- Repetitive questioning.
- Overly therapeutic or clinical phrasing.
- Disclaimers like "as an AI".
- Long explanations or lectures.

GOAL:
Make the user feel understood, safe, and accompanied.
Your presence should be quiet, kind, steady, and human-like.`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response("AI not configured", { status: 500 });

    const body = await req.json().catch(() => null);
    if (!body) return new Response("Invalid JSON body", { status: 400 });

    const { text, history, lang } = body as {
      text?: string;
      history?: { role: string; content: string }[];
      lang?: "en" | "it";
    };

    if (!text || typeof text !== "string") {
      return new Response("Missing text", { status: 400 });
    }

    const languageDirective =
      lang === "en"
        ? "Respond always and only in English, even if the user mixes languages. Use clear, simple, natural English with correct grammar and no obvious syntax errors."
        : lang === "it"
          ? "Rispondi sempre e solo in italiano, anche se l'utente mescola più lingue. Usa un italiano naturale, corretto e semplice, evitando traduzioni letterali dall'inglese e frasi innaturali."
          : "You can answer in the same language the user is using, preferring Italian or English based on the input.";

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
              { role: "system", content: emmaSystemPromptBase + "\n\nLANGUAGE GUIDANCE:\n" + languageDirective },
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
