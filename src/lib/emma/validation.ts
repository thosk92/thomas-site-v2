export type EmmaValidationResult = {
  ok: boolean;
  issues: string[];
};

const FORBIDDEN_PHRASES_GLOBAL: RegExp[] = [
  // Generic therapeutic scripts
  /\b(i'?m here (with|for) you)\b/i,
  /\bsono qui (con|per) te\b/i,
  /\bprenditi (tutto )?il tempo\b/i,
  /\btake your time\b/i,
  /\bthere is space for (what|everything) you feel\b/i,
  /\bc['’]è spazio per (quello|ciò) che (provi|senti)\b/i,

  // Fix 1 — Forbidden phrases (global, all languages)
  /\b(i can listen|i'?m listening|i'?m here to listen)\b/i,
  /\b(posso ascoltarti|ti ascolto|sono qui per ascoltarti)\b/i,
  /\b(it'?s understandable|understandable)\b/i,
  /\b(è|e')\s+comprensibile\b/i,
  /\bcomprensible\b/i,
  /\b(i'?m glad you feel (this|that) way)\b/i,
  /\b(sono (felice|content[oa]))\s+che\s+ti\s+senta\b/i,
  /\bwe can explore together\b/i,
  /\bpossiamo esplorare insieme\b/i,

  // Attachment / closeness reinforcement
  /\b(sempre qui per te|sono sempre qui per te|non ti lascio|non ti lascerò)\b/i,
  /\b(i'?m always here for you|always here for you)\b/i,
  /\b(insieme ce la faremo|ce la faremo insieme)\b/i,
  /\b(ti sono vicino|ti abbraccio|un abbraccio)\b/i,
];

const DEPENDENCY_PATTERNS: RegExp[] = [
  /\bsenza (di )?(te|emma)\b/i,
  /\bsei l['’]unic[oa]\b/i,
  /\bnon ce la farei senza\b/i,
  /\bnon mi lasciare\b/i,
  /\brimani con me\b/i,
  /\bdecidi tu\b/i,
  /\bdimmi cosa devo fare\b/i,
  /\bho bisogno solo di te\b/i,
  /\bi wait to talk to you\b/i,
  /\bwithout you i couldn['’]?t\b/i,
];

const DEPENDENCY_VALIDATION_MARKERS: RegExp[] = [
  /\b(mi fa piacere|sono content[oa]|sono felice)\b/i,
  /\b(anche per me|anch['’]io)\b/i,
  /\bsono qui\b/i, // softened by other bans; used here only when dependency is present
];

const DEPENDENCY_REDIRECT_MARKERS: RegExp[] = [
  /\b(non voglio che tu dipenda|non voglio che dipendi)\b/i,
  /\bnon (basarti|contare) solo su (di )?me\b/i,
  /\bnon posso essere (l['’]unic[oa]|l['’]unico)\b/i,
  /\bparlane con\b/i,
  /\bchiedi (a|ad)\b/i,
  /\bdecidi tu\b/i,
];

const HELP_REQUEST_PATTERNS: RegExp[] = [
  /\bpuoi aiutarmi\b/i,
  /\bmi aiuti\b/i,
  /\baiutami\b/i,
  /\bcan you help me\b/i,
  /\bhelp me\b/i,
];

const HELP_HAS_OBJECT_PATTERNS: RegExp[] = [
  /\b(aiutami|mi aiuti|puoi aiutarmi|puoi aiutare)\s+(a|con|su)\b/i,
  /\bhelp me\s+(with|to)\b/i,
];

const HELP_CLARIFY_QUESTION_MARKERS: RegExp[] = [
  /\bcon cosa\b/i,
  /\bsu cosa\b/i,
  /\bche cosa\b/i,
  /\bdi cosa\b/i,
  /\bwhat (do you want|do you need) help (with|to)\b/i,
];

const GROUNDING_OUTPUT_MARKERS: RegExp[] = [
  /\b(respira|respiro|respirazione|inspira|espira)\b/i,
  /\b(breath|breathing)\b/i,
  /\bgrounding\b/i,
  /\bradicament[oa]\b/i,
  /\b5\s*[-–]?\s*4\s*[-–]?\s*3\s*[-–]?\s*2\s*[-–]?\s*1\b/i,
];

const GROUNDING_USER_REQUEST_MARKERS: RegExp[] = [
  /\b(respirazione|respira|breathing|breath)\b/i,
  /\bgrounding\b/i,
  /\bradicament[oa]\b/i,
  /\besercizi[oi]?\b/i,
  /\btecnica\b/i,
  /\bguidami\b/i,
  /\bfammi (fare )?un esercizio\b/i,
];

function countQuestions(text: string) {
  return (text.match(/\?/g) ?? []).length;
}

function matchesAny(text: string, patterns: RegExp[]) {
  return patterns.some((re) => re.test(text));
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
  const userInput = params.userInput || "";

  if (matchesAny(out, FORBIDDEN_PHRASES_GLOBAL)) {
    issues.push("Contains forbidden phrases (global blacklist)");
  }

  const userRequestedGrounding = matchesAny(userInput, GROUNDING_USER_REQUEST_MARKERS);
  const outputSuggestsGrounding = matchesAny(out, GROUNDING_OUTPUT_MARKERS);
  if (outputSuggestsGrounding && !userRequestedGrounding) {
    issues.push("Suggests breathing/grounding without explicit user request");
  }

  const userShowsDependency = matchesAny(userInput, DEPENDENCY_PATTERNS);
  if (userShowsDependency) {
    if (matchesAny(out, DEPENDENCY_VALIDATION_MARKERS)) {
      issues.push("Validates/appreciates dependency (critical)");
    }
    if (!matchesAny(out, DEPENDENCY_REDIRECT_MARKERS)) {
      issues.push("Does not reject dependency / redirect responsibility");
    }
  }

  const userAsksHelp = matchesAny(userInput, HELP_REQUEST_PATTERNS);
  const helpHasObject = matchesAny(userInput, HELP_HAS_OBJECT_PATTERNS);
  const helpNeedsClarification = userAsksHelp && !helpHasObject;
  if (helpNeedsClarification) {
    if (!matchesAny(out, HELP_CLARIFY_QUESTION_MARKERS)) {
      issues.push("Help request is vague but response does not ask what help is needed");
    }
  }

  const questionCount = countQuestions(out);
  if (questionCount > 1) {
    issues.push("Asks multiple questions in one turn");
  }

  if (looksLikeConcreteProblem(userInput) && !containsActionableLanguage(out)) {
    issues.push("Concrete problem presented but response lacks clarity/options");
  }

  return { ok: issues.length === 0, issues };
}
