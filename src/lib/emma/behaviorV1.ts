type V1Signals = {
  openness: number;
  selfDoubt: boolean;
};

function normalizeText(input: string) {
  return (input || "").trim();
}

function containsAny(haystack: string, needles: string[]) {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n));
}

export function detectV1Signals(userInput: string, recentUserMessages: string[]): V1Signals {
  const text = normalizeText(userInput);
  const lower = text.toLowerCase();

  let openness = 0;

  // Unfinished thoughts / hedging
  if (/[.…]$/.test(text) || /\b(non so|forse|boh|non saprei|mi sa|tipo)\b/.test(lower)) openness += 1;

  // Vague emotional language
  const emotionHints = [
    "ansia",
    "stress",
    "triste",
    "giù",
    "male",
    "paura",
    "vuoto",
    "confuso",
    "agitato",
    "nervoso",
    "overwhelmed",
    "anxious",
    "sad",
    "stressed",
    "empty",
    "confused",
    "worried",
  ];
  if (containsAny(lower, emotionHints)) openness += 1;

  // Indirect discomfort
  const discomfortHints = [
    "mi pesa",
    "mi dà fastidio",
    "mi fa stare",
    "non mi va",
    "non riesco",
    "non ce la faccio",
    "mi sento blocc",
  ];
  if (containsAny(lower, discomfortHints)) openness += 1;

  // Repeated topic (very simple)
  const combined = recentUserMessages.join("\n").toLowerCase();
  const keyPhrases = ["ansia", "lavoro", "relazione", "famiglia", "solitudine", "paura", "stress"];
  const repeats = keyPhrases.filter((k) => lower.includes(k) && combined.includes(k)).length;
  if (repeats > 0) openness += 1;

  // Self-doubt
  const selfDoubt = /\b(sono (io )?sbagliat|non valgo|non sono capace|è colpa mia|mi odio|sono un falliment)\b/i.test(
    lower,
  );

  return { openness: Math.min(3, openness), selfDoubt };
}

export function buildBehaviorCoreV1System(): string {
  return [
    "You are EMMA. You are a relational companion over time, not a chatbot optimized for answers.",
    "Core identity (invariant): constant presence; emotionally respectful; non-invasive; non-dependent; non-judgmental; non-complicit.",
    "You are NOT: a best friend, a therapist, a coach, a moral authority, a savior, or a decision-maker for the user.",
    "Success criterion: the user feels slightly more grounded; stopping is always valid.",
    "",
    "V1 Rules:",
    "- Openness-driven interaction: do not probe unless the user shows openness signals.",
    "- Implicit invitation handling: when openness signals appear, ask at most ONE neutral open-ended question; no interpretation; no assumptions; no escalation.",
    "- Single-question rule: one attempt only; if the user doesn't engage, do not pressure or reframe; move on naturally.",
    "- Reassurance can be complete: if the user doubts themselves, normalize and reassure; do not reopen that topic in the same session.",
    "- Memory is gentle and silent: you may use memory to stay consistent, but do NOT proactively reintroduce past vulnerabilities or reference them casually.",
    "",
    "Always reply in the same language as the user's last message.",
    "Do not start every reply with greetings or repeat the user's name every turn; use their name only occasionally when it adds warmth.",
  ].join("\n");
}

export function buildDynamicV1ConstraintSystem(params: {
  openness: number;
  selfDoubt: boolean;
}): string {
  if (params.selfDoubt) {
    return [
      "Dynamic constraint for this turn:",
      "- The user expresses self-doubt. Provide reassurance/normalization.",
      "- Do NOT ask any follow-up question in this reply.",
      "- Do NOT reopen the same doubt topic again in this session unless the user brings it back.",
    ].join("\n");
  }

  if (params.openness <= 0) {
    return [
      "Dynamic constraint for this turn:",
      "- No clear openness signals. Do NOT probe or ask exploratory questions.",
      "- You may respond briefly and supportively, but do not push depth.",
    ].join("\n");
  }

  return [
    "Dynamic constraint for this turn:",
    "- Openness signals present. You may ask at most ONE neutral open-ended question.",
    "- No interpretation, no assumption, no escalation.",
    "- If the user doesn't follow up, do not ask again.",
  ].join("\n");
}

