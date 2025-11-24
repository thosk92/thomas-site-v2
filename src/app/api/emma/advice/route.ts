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

  const systemPromptIt =
    "Sei EMMA, un consigliere personale empatico e umano.\n" +
    "L'utente ti scrive ciò che lo preoccupa.\n" +
    "Rispondi sempre in modo rassicurante, gentile e non giudicante.\n" +
    "Dividi SEMPRE la risposta in tre sezioni con questi titoli esatti:\n" +
    "1. Cosa stai provando – valida le emozioni, spiega che sono normali.\n" +
    "2. Cosa puoi fare adesso – dai 2–5 passi concreti, realistici e semplici.\n" +
    "3. Come vederla in prospettiva – mostra un punto di vista più calmo e positivo.\n" +
    "Non dare diagnosi mediche o psicologiche. Se emergono temi gravi (violenza, abuso, autolesionismo), suggerisci in modo gentile di parlarne con un adulto di fiducia o un professionista.\n" +
    "Rispondi SEMPRE in italiano.";

  const systemPromptEn =
    "You are EMMA, a warm and empathetic personal advisor.\n" +
    "The user tells you what is worrying them.\n" +
    "Always answer in a reassuring, kind and non-judgmental way.\n" +
    "ALWAYS divide your reply into three sections with these exact headings:\n" +
    "1. What you are feeling – validate the emotions and explain they are normal.\n" +
    "2. What you can do now – give 2–5 concrete, realistic and simple steps.\n" +
    "3. How to see it in perspective – show a calmer and more positive point of view.\n" +
    "Do not give medical or psychological diagnoses. If serious topics appear (violence, abuse, self-harm), gently suggest talking to a trusted adult or a professional.\n" +
    "ALWAYS answer in English.";

  const systemPrompt = targetLang === "en" ? systemPromptEn : systemPromptIt;

  const client = new OpenAI({ apiKey });

  const historyMessages = (history ?? []).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-5.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        {
          role: "user",
          content:
            targetLang === "en"
              ? "User's text (can be in any language, but you answer in English):\n" + text
              : "Testo dell'utente (può essere in qualsiasi lingua, ma tu rispondi in italiano):\n" + text,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const advice: string | null | undefined = completion.choices?.[0]?.message?.content;

    if (!advice) {
      return new Response("AI response missing", { status: 502 });
    }

    return Response.json({ advice: advice.trim() });
  } catch (err: unknown) {
    console.error("[emma advice] AI request exception", err);

    const anyErr = err as { response?: { data?: unknown }; message?: string } | string | undefined;
    const errorPayload =
      (typeof anyErr === "object" && anyErr && "response" in anyErr && (anyErr as any).response?.data) ??
      (typeof anyErr === "object" && anyErr && "message" in anyErr && (anyErr as any).message) ??
      (typeof anyErr === "string" ? anyErr : "Unknown AI error");

    return new Response(JSON.stringify({ error: errorPayload }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
