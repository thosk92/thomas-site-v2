export type Lang =
  | "en-US"
  | "en-GB"
  | "it"
  | "es"
  | "fr"
  | "de"
  | "pt-PT"
  | "pt-BR"
  | "nl"
  | "sv"
  | "no"
  | "da"
  | "fi"
  | "pl"
  | "cs"
  | "sk"
  | "sl"
  | "hu"
  | "ro"
  | "bg"
  | "hr"
  | "sr"
  | "ru"
  | "uk"
  | "tr"
  | "el"
  | "hi"
  | "ja"
  | "zh-CN"
  | "zh-TW";

export const LANG_OPTIONS: { code: Lang; label: string }[] = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt-PT", label: "Português (PT)" },
  { code: "pt-BR", label: "Português (BR)" },
  { code: "nl", label: "Nederlands" },
  { code: "sv", label: "Svenska" },
  { code: "no", label: "Norsk" },
  { code: "da", label: "Dansk" },
  { code: "fi", label: "Suomi" },
  { code: "pl", label: "Polski" },
  { code: "cs", label: "Čeština" },
  { code: "sk", label: "Slovenčina" },
  { code: "sl", label: "Slovenščina" },
  { code: "hu", label: "Magyar" },
  { code: "ro", label: "Română" },
  { code: "bg", label: "Български" },
  { code: "hr", label: "Hrvatski" },
  { code: "sr", label: "Српски" },
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Українська" },
  { code: "tr", label: "Türkçe" },
  { code: "el", label: "Ελληνικά" },
  { code: "hi", label: "हिन्दी" },
  { code: "ja", label: "日本語" },
  { code: "zh-CN", label: "中文 (简体)" },
  { code: "zh-TW", label: "中文 (繁體)" },
];

const LANG_SET = new Set<Lang>(LANG_OPTIONS.map((l) => l.code));

export function isSupportedLang(value: string | null | undefined): value is Lang {
  if (!value) return false;
  return LANG_SET.has(value as Lang);
}

export function mapLocaleToLang(locale: string | null | undefined): Lang {
  if (!locale) return "en-US";
  const norm = locale.toLowerCase();

  if (norm.startsWith("zh-hant") || norm.startsWith("zh-tw") || norm.includes("hant")) return "zh-TW";
  if (norm.startsWith("zh")) return "zh-CN";
  if (norm.startsWith("ja")) return "ja";
  if (norm.startsWith("hi")) return "hi";
  if (norm.startsWith("it")) return "it";
  if (norm.startsWith("es")) return "es";
  if (norm.startsWith("fr")) return "fr";
  if (norm.startsWith("de")) return "de";
  if (norm.startsWith("pt-br")) return "pt-BR";
  if (norm.startsWith("pt")) return "pt-PT";
  if (norm.startsWith("nl")) return "nl";
  if (norm.startsWith("sv")) return "sv";
  if (norm.startsWith("no") || norm.startsWith("nb") || norm.startsWith("nn")) return "no";
  if (norm.startsWith("da")) return "da";
  if (norm.startsWith("fi")) return "fi";
  if (norm.startsWith("pl")) return "pl";
  if (norm.startsWith("cs")) return "cs";
  if (norm.startsWith("sk")) return "sk";
  if (norm.startsWith("sl")) return "sl";
  if (norm.startsWith("hu")) return "hu";
  if (norm.startsWith("ro")) return "ro";
  if (norm.startsWith("bg")) return "bg";
  if (norm.startsWith("hr")) return "hr";
  if (norm.startsWith("sr")) return "sr";
  if (norm.startsWith("ru")) return "ru";
  if (norm.startsWith("uk")) return "uk";
  if (norm.startsWith("tr")) return "tr";
  if (norm.startsWith("el")) return "el";
  if (norm === "en-gb" || norm === "en-uk") return "en-GB";
  if (norm.startsWith("en")) return "en-US";

  return "en-US";
}

export function detectLanguage(text: string): Lang {
  const raw = text || "";
  const lower = raw.toLowerCase();

  if (/[\u3040-\u30ff\u31f0-\u31ff]/u.test(raw)) return "ja"; // Hiragana/Katakana
  if (/[\u3100-\u312f\u31a0-\u31bf]/u.test(raw)) return "zh-TW"; // Bopomofo
  if (/[\u4e00-\u9fff]/u.test(raw)) {
    if (/臺|灣|專|學|師|國/.test(raw)) return "zh-TW";
    return "zh-CN";
  }
  if (/[\u0900-\u097f]/u.test(raw)) return "hi"; // Devanagari (Hindi and related)
  if (/[\u0400-\u04FF]/u.test(raw)) {
    if (/[їієґ]/i.test(raw)) return "uk";
    if (/[ђћљњџѓ]/i.test(raw)) return "sr";
    if (/[ъэыё]/i.test(raw)) return "ru";
    return "bg";
  }
  if (/[\u0370-\u03FF]/u.test(raw)) return "el";

  if (/[ğüşçöıİ]/i.test(raw)) return "tr";
  if (/[ãõâêôç]/i.test(raw) || /\bvo[cç]e[s]?\b/.test(lower)) return "pt-BR";
  if (/[ãõâêô]/i.test(raw)) return "pt-PT";
  if (/[ñ¡¿]/i.test(raw) || /\bhola\b/.test(lower)) return "es";
  if (/[ßäöü]/i.test(raw)) return "de";
  if (/[éèêàçùâîôëïü]/i.test(raw)) return "fr";
  if (/[àèéìòù]/i.test(raw) || /(ciao|perch[eè]|grazie|sto|sono|vorrei|aiutami|buongiorno)/i.test(lower)) return "it";
  if (/[łśżźćńóąę]/i.test(raw)) return "pl";
  if (/[čřžěůýďťň]/i.test(raw)) return "cs";
  if (/[ľĺťôŕ]/i.test(raw)) return "sk";
  if (/[čšž]/i.test(raw) && /[ćđ]/i.test(raw)) return "hr";
  if (/[čšž]/i.test(raw) && !/[ćđ]/i.test(raw)) return "sl";
  if (/[őű]/i.test(raw)) return "hu";
  if (/[ăâîșşțţ]/i.test(raw)) return "ro";
  if (/[åäö]/i.test(raw) && !/[øæ]/i.test(raw)) return "sv";
  if (/[æøå]/i.test(raw) && /æ|ø/.test(raw)) return "da";
  if (/[æøå]/i.test(raw)) return "no";
  if (/[äö]/i.test(raw) && !/[å]/i.test(raw)) return "fi";

  // Simple US vs UK heuristic
  if (/(colour|favourite|organis(e|ation)|centre|travelling)/i.test(lower)) return "en-GB";

  return "en-US";
}
