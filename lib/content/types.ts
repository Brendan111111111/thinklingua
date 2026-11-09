/** Four-letter-ish course ids. Thai and Japanese are the primary courses. */
export type LangId = "th" | "ja" | "es" | "fr";

/**
 * A single meaning-bearing unit. `glyph` is the concept anchor: the learner
 * meets the word through a picture and native audio, never through English.
 * `gloss` exists only for the deliberate "peek" escape hatch and for prompts
 * sent to the AI tutor.
 */
export type Lexeme = {
  id: string;
  glyph: string;
  /** Target-script form — what is displayed and spoken. */
  text: string;
  /** Reading aid (kana / phonetic) shown when romanisation is enabled. */
  reading?: string;
  /** Romanisation. */
  latin: string;
  /** English meaning. Hidden unless the learner deliberately peeks. */
  gloss: string;
  /** Optional pronunciation label (tone / pitch) shown in the target language. */
  tone?: string;
};

/** A whole sentence, pre-tokenised into the tiles used by sentence building. */
export type Phrase = {
  id: string;
  glyph: string;
  text: string;
  reading?: string;
  latin: string;
  gloss: string;
  tiles: string[];
  /** Plausible wrong tiles drawn from the same language, never random noise. */
  extraTiles: string[];
};

/** A minimal-pair listening drill: the ear-training half of the accent work. */
export type EarDrill = {
  id: string;
  hint: string;
  a: { text: string; latin: string; gloss: string };
  b: { text: string; latin: string; gloss: string };
  /** Which option is played. */
  target: "a" | "b";
};

export type LessonKind = "lesson" | "checkpoint";

export type Lesson = {
  id: string;
  title: string;
  latin: string;
  /** One line in the target language that sets the scene. */
  intro: string;
  kind: LessonKind;
  newLexemes: string[];
  phrases: string[];
  ear: EarDrill[];
};

export type Unit = {
  id: string;
  title: string;
  latin: string;
  glyph: string;
  /** Accent token used for the unit's gradient. */
  tint: "gold" | "sakura" | "jade" | "sky" | "violet";
  lessons: Lesson[];
};

export type Course = {
  id: LangId;
  /** Endonym, e.g. ไทย. */
  name: string;
  english: string;
  flag: string;
  locale: string;
  scriptLabel: string;
  tagline: string;
  accent: string;
  /** What makes this language's accent hard for English speakers. */
  accentTip: string;
  primary: boolean;
  ranks: string[];
  lexemes: Record<string, Lexeme>;
  phrases: Record<string, Phrase>;
  units: Unit[];
};
