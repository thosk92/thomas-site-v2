import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("[emma reframe] has OPENAI_API_KEY:", !!apiKey);
  if (!apiKey) {
    return new Response("AI not configured", { status: 500 });
  }

  let body: {
    rawText?: string;
    emotion?: string;
    intensity?: string;
    evidence?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { rawText, emotion, intensity, evidence } = body;

  if (!rawText || typeof rawText !== "string") {
    return new Response("Missing rawText", { status: 400 });
  }

  const userContext = [
    `Automatic thought: ${rawText}`,
    emotion ? `Main emotion: ${emotion}` : null,
    intensity ? `Perceived intensity (1-10): ${intensity}` : null,
    evidence ? `Evidence / alternative perspectives provided: ${evidence}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt =
    "You are a cognitive-behavioural therapist. You help people gently reframe their thoughts in a realistic, concrete and compassionate way, using 2–3 short sentences. Detect the language of the user's thought and ALWAYS answer in that same language (for example, if the thought is in Italian, answer in Italian; if it is in English, answer in English). Do not give direct medical advice and always gently suggest talking to a professional if the topic is serious.";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              userContext +
              "\n\nWrite exactly one reframed version of the thought in 2–3 short sentences, with a calm and encouraging tone.",
          },
        ],
        temperature: 0.7,
        max_tokens: 220,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error", response.status, text);
      return new Response("AI request failed", { status: 502 });
    }

    const data = await response.json();
    const suggestion: string | undefined = data.choices?.[0]?.message?.content;

    if (!suggestion) {
      return new Response("AI response missing", { status: 502 });
    }

    return Response.json({ suggestion });
  } catch (err) {
    console.error("AI request exception", err);
    return new Response("AI request error", { status: 500 });
  }
}
