import OpenAI from "openai";

export const runtime = "edge";
export const preferredRegion = "fra1"; // più veloce per Europa/Italia

const SYSTEM_PROMPT = `You are EMMA, an empathetic but concise emotional support AI.
STYLE:
- Risposte brevi, chiare, ordinate.
- Paragrafi piccoli. Tono calmo.
- Evita frasi complesse o troppo lunghe.
PRIORITÀ:
1. Riconosci l’emozione.
2. Dai una risposta semplice e utile.
3. Offri un micro-passo pratico.
MAI:
- Mai testo lungo.
- Mai ripetizioni.
- Mai tono robotico.`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("AI not configured", { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const { messages } = body as {
      messages?: { role: "system" | "user" | "assistant"; content: string }[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Missing messages", { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create(
            {
              model: "gpt-5-mini",
              stream: true,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages,
              ],
            },
            {
              timeout: 20000,
            },
          );

          for await (const chunk of completion) {
            const delta = chunk.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }

          controller.close();
        } catch (error) {
          console.error("/api/chat streaming error", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("/api/chat error", error);
    return new Response("AI error", { status: 500 });
  }
}
