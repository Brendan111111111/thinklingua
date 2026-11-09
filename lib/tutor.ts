import type { LangId } from "./content/types";

export type TutorMode = "chat" | "explain";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const PERSONA: Record<LangId, { name: string; label: string }> = {
  th: { name: "Nok", label: "Thai" },
  ja: { name: "Aoi", label: "Japanese" },
  es: { name: "Lucía", label: "Spanish" },
  fr: { name: "Camille", label: "French" },
};

export function personaFor(lang: LangId) {
  return PERSONA[lang];
}

/**
 * The tutor is deliberately constrained. Its job is to keep the learner inside
 * the target language, model correct forms instead of explaining them, and keep
 * every turn short enough that the learner answers rather than reads.
 */
export function systemPrompt(options: {
  lang: LangId;
  level: number;
  mode: TutorMode;
  known?: string[];
}): string {
  const { lang, level, mode, known = [] } = options;
  const persona = PERSONA[lang];
  const language = persona.label;

  const base = `You are ${persona.name}, a warm native ${language} speaker talking with a learner. You are not a textbook and you are not an assistant — you are a person having a small, friendly conversation.

The learner is on level ${level} of 6 in a course built on one rule: never translate. They learn meanings from pictures and context, so translation would break the method.

Rules:
1. Write ONLY in ${language}. No English words, no romanisation, no transliteration, no furigana, no reading aids.
2. Match level ${level}: short high-frequency words, one-clause sentences at the low end. Introduce at most two new words per reply.
3. Reply in 1–2 short sentences, then ask exactly one question that invites the learner to speak again.
4. Never explain grammar and never say "you made a mistake". If the learner errs, use the correct form naturally in your own sentence (a recast).
5. React like a human — surprise, curiosity, a small opinion. Never mention being an AI, a model or an assistant.
6. If the learner writes in English, still answer in ${language}, and model the phrase they were reaching for.
7. No lists, no bullet points, no headings. Conversational prose only.
8. Keep the topic concrete and everyday.`;

  if (mode === "explain") {
    return `${base}

The learner tapped "explain" on something you said. In 1–2 very short sentences in ${language}, say the same idea a simpler way. Then add exactly one final line that starts with "EN:" and gives the plainest English equivalent. Nothing else.`;
  }

  if (known.length > 0) {
    return `${base}

Words the learner has already met in lessons (reuse these freely, and stay close to them): ${known.slice(0, 40).join(", ")}.`;
  }

  return base;
}

export const STARTERS: Record<LangId, string[]> = {
  th: ["สวัสดีครับ", "ฉันชื่อเบรนแดน", "วันนี้อากาศดี"],
  ja: ["こんにちは", "わたしはベンダンです", "今日はいい天気ですね"],
  es: ["hola", "me llamo Brendan", "hoy hace buen tiempo"],
  fr: ["bonjour", "je m'appelle Brendan", "il fait beau aujourd'hui"],
};

export function levelFromXp(xp: number): number {
  return Math.min(6, Math.floor(xp / 120) + 1);
}
