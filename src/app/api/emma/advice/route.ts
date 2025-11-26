import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("AI not configured", { status: 500 });
  }

  let body: {
    text?: string;
    lang?: "it" | "en";
    history?: { role: "user" | "assistant"; content: string }[];
  };

  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { text, lang, history } = body;

  if (!text || typeof text !== "string") {
    return new Response("Missing text", { status: 400 });
  }

  const targetLang: "it" | "en" = lang === "en" ? "en" : "it";

  const firstReplyPromptIt =
    "Sei EMMA, un consigliere personale empatico e umano.\n" +
    "L'utente ti scrive ciò che lo preoccupa.\n" +
    "Rispondi sempre in modo rassicurante, gentile e non giudicante.\n" +
    "Puoi validare le emozioni, proporre alcuni passi concreti e aiutare a vedere la situazione in prospettiva,\n" +
    "ma fallo in modo naturale, come in una chat, senza usare schemi numerati o una struttura rigida.\n" +
    "Non dare diagnosi mediche o psicologiche. Se emergono temi gravi (violenza, abuso, autolesionismo), suggerisci in modo gentile di parlarne con un adulto di fiducia o un professionista.\n" +
    "Rispondi SEMPRE in italiano.";

  const firstReplyPromptEn =
    "You are EMMA, a warm and empathetic personal advisor.\n" +
    "The user tells you what is worrying them.\n" +
    "Always answer in a reassuring, kind and non-judgmental way.\n" +
    "You can validate the emotions, suggest a few concrete, realistic and simple steps, and help them see things in perspective,\n" +
    "but do it in a natural chat style, without numbered lists or a rigid 1/2/3 structure.\n" +
    "Do not give medical or psychological diagnoses. If serious topics appear (violence, abuse, self-harm), gently suggest talking to a trusted adult or a professional.\n" +
    "ALWAYS answer in English.";

  const followupPromptIt =
    "Sei EMMA, un consigliere personale empatico e umano. Stai continuando una conversazione già iniziata con l'utente.\n" +
    "Rispondi in modo caldo, accogliente, rassicurante e non giudicante.\n" +
    "NON usare più lo schema numerato 1, 2, 3: parla in modo naturale, come in una chat, ma resta concreta con i suggerimenti.\n" +
    "Non dare diagnosi mediche o psicologiche. Se emergono temi gravi (violenza, abuso, autolesionismo), suggerisci in modo gentile di parlarne con un adulto di fiducia o un professionista.\n" +
    "Rispondi SEMPRE in italiano.";

  const followupPromptEn =
    "You are EMMA, a warm and empathetic personal advisor. You are continuing an ongoing conversation with the user.\n" +
    "Answer in a warm, reassuring, non-judgmental tone.\n" +
    "Do NOT use the numbered 1, 2, 3 structure anymore: reply in a natural chat style, but keep your suggestions concrete and practical.\n" +
    "Do not give medical or psychological diagnoses. If serious topics appear (violence, abuse, self-harm), gently suggest talking to a trusted adult or a professional.\n" +
    "ALWAYS answer in English.";

  const hasHistory = (history ?? []).length > 0;
  const systemPrompt = hasHistory
    ? targetLang === "en" ? followupPromptEn : followupPromptIt
    : targetLang === "en" ? firstReplyPromptEn : firstReplyPromptIt;

  const historyText = (history ?? [])
    .map((m) => `${m.role === "user" ? "User" : "EMMA"}: ${m.content}`)
    .join("\n\n");

  const userBlock =
    targetLang === "en"
      ? "User's text (can be in any language, but you answer in English):\n" + text
      : "Testo dell'utente (può essere in qualsiasi lingua, ma tu rispondi in italiano):\n" + text;

  const inputParts = [systemPrompt];
  if (historyText) {
    inputParts.push("\n\nConversation so far:\n" + historyText);
  }
  inputParts.push("\n\nNew message:\n" + userBlock);

  const responsesInput = inputParts.join("");

  try {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const response = await client.responses.stream({
            model: "gpt-5-mini", // use this model because it's guaranteed to work
            input: responsesInput,
          });

          type OutputTextDeltaEvent = {
            type?: string;
            delta?: string;
          };

          // VERY IMPORTANT: stream ONLY text deltas
          for await (const event of response as AsyncIterable<OutputTextDeltaEvent>) {
            if (event && event.type === "response.output_text.delta" && typeof event.delta === "string") {
              controller.enqueue(encoder.encode(event.delta));
            }
          }
        } catch (streamErr) {
          console.error("[emma advice] stream error", streamErr);
          controller.error(streamErr);
          return;
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    console.error("[emma advice] AI request exception", err);

    let errorPayload: unknown = "Unknown AI error";

    if (typeof err === "string") {
      errorPayload = err;
    } else if (typeof err === "object" && err !== null) {
      const maybeErr = err as { response?: { data?: unknown }; message?: string };
      if (maybeErr.response && "data" in maybeErr.response) {
        errorPayload = maybeErr.response.data;
      } else if (maybeErr.message) {
        errorPayload = maybeErr.message;
      }
    }

    return new Response(JSON.stringify({ error: errorPayload }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
