export type EmmaValidationResult = {
  ok: boolean;
  issues: string[];
};

const BANNED_PHRASES: RegExp[] = [
  /\b(i'?m here (with|for) you)\b/i,
  /\bsono qui (con|per) te\b/i,
  /\bprenditi (tutto )?il tempo\b/i,
  /\btake your time\b/i,
  /\bthere is space for (what|everything) you feel\b/i,
  /\bc['’]è spazio per (quello|ciò) che (provi|senti)\b/i,
];

function countQuestions(text: string) {
  return (text.match(/\?/g) ?? []).length;
}

function looksLikeConcreteProblem(userInput: string) {
  const t = (userInput || "").toLowerCase();
  const markers = [
    "non funziona",
    "errore",
    "bug",
    "si blocca",
    "crasha",
    "come faccio",
    "non riesco",
    "non mi salva",
    "non si apre",
    "non va",
    "login",
    "logout",
    "cookie",
    "deploy",
    "vercel",
    "build",
    "typescript",
  ];
  return markers.some((m) => t.includes(m));
}

function containsActionableLanguage(output: string) {
  const t = (output || "").toLowerCase();
  const markers = [
    "prova",
    "fai",
    "controlla",
    "verifica",
    "passo",
    "prima",
    "poi",
    "opzione",
    "puoi",
    "ti consiglio",
    "imposta",
    "clicca",
    "apri",
    "chiudi",
  ];
  return markers.some((m) => t.includes(m));
}

export function validateEmmaOutput(params: {
  userInput: string;
  assistantOutput: string;
}): EmmaValidationResult {
  const issues: string[] = [];
  const out = params.assistantOutput || "";

  for (const re of BANNED_PHRASES) {
    if (re.test(out)) {
      issues.push("Uses banned therapeutic phrasing");
      break;
    }
  }

  const questionCount = countQuestions(out);
  if (questionCount > 1) {
    issues.push("Asks multiple questions in one turn");
  }

  if (looksLikeConcreteProblem(params.userInput) && !containsActionableLanguage(out)) {
    issues.push("Concrete problem presented but response lacks clarity/options");
  }

  return { ok: issues.length === 0, issues };
}

