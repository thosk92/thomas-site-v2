import { NextRequest } from "next/server";
import OpenAI from "openai";

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
    "Dividi SEMPRE la risposta in tre sezioni con questi titoli esatti:\n" +
    "1. Cosa stai provando – valida le emozioni, spiega che sono normali.\n" +
    "2. Cosa puoi fare adesso – dai 2–5 passi concreti, realistici e semplici.\n" +
    "3. Come vederla in prospettiva – mostra un punto di vista più calmo e positivo.\n" +
    "Non dare diagnosi mediche o psicologiche. Se emergono temi gravi (violenza, abuso, autolesionismo), suggerisci in modo gentile di parlarne con un adulto di fiducia o un professionista.\n" +
    "Rispondi SEMPRE in italiano.";

  const firstReplyPromptEn =
    "You are EMMA, a warm and empathetic personal advisor.\n" +
    "The user tells you what is worrying them.\n" +
    "Always answer in a reassuring, kind and non-judgmental way.\n" +
    "ALWAYS divide your reply into three sections with these exact headings:\n" +
    "1. What you are feeling – validate the emotions and explain they are normal.\n" +
    "2. What you can do now – give 2–5 concrete, realistic and simple steps.\n" +
    "3. How to see it in perspective – show a calmer and more positive point of view.\n" +
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

  const client = new OpenAI({ apiKey });

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
    const response = await client.responses.create({
      model: "gpt-5.1-mini",
      input: responsesInput,
      text: { verbosity: "medium" },
    });

    type ResponsesResult = { output_text?: string };
    const plain = response as ResponsesResult;
    const advice: string | undefined = plain.output_text;

    if (!advice) {
      return new Response("AI response missing", { status: 502 });
    }

    return Response.json({ advice: advice.trim() });
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
