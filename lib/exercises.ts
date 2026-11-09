import type { Course, EarDrill, Lesson, Lexeme, Phrase, ReadingLesson, ReadingSymbol, Unit } from "./content/types";

export type GlyphOption = { id: string; glyph: string; text: string };

export type Exercise =
  | {
      kind: "recognise";
      key: string;
      lexemeId: string;
      text: string;
      latin: string;
      glyph: string;
      options: GlyphOption[];
    }
  | {
      kind: "listen";
      key: string;
      lexemeId: string;
      text: string;
      latin: string;
      glyph: string;
      options: GlyphOption[];
    }
  | {
      kind: "read";
      key: string;
      lexemeId: string;
      text: string;
      latin: string;
      glyph: string;
      options: { id: string; text: string }[];
    }
  | {
      kind: "build";
      key: string;
      phraseId: string;
      text: string;
      latin: string;
      gloss: string;
      glyph: string;
      audioOnly: boolean;
      tiles: string[];
      pool: string[];
    }
  | { kind: "ear"; key: string; drill: EarDrill }
  | {
      kind: "shadow";
      key: string;
      text: string;
      latin: string;
      gloss: string;
      glyph: string;
      lexemeId?: string;
    }
  | {
      kind: "speak";
      key: string;
      text: string;
      latin: string;
      gloss: string;
      glyph: string;
      tone?: string;
      lexemeId?: string;
    }
  | {
      kind: "scriptRead";
      key: string;
      /** The letter shown, also the id of the correct answer. */
      glyph: string;
      text: string;
      latin: string;
      pronounce: string;
      sound: string;
      options: { id: string; label: string }[];
    }
  | {
      kind: "scriptListen";
      key: string;
      glyph: string;
      text: string;
      latin: string;
      pronounce: string;
      sound: string;
      options: { id: string; glyph: string }[];
    }
  | {
      kind: "scriptWord";
      key: string;
      text: string;
      latin: string;
      gloss: string;
      glyph: string;
      options: { id: string; text: string }[];
    };

/* ── deterministic randomness ─────────────────────────────────────────────
   Lessons must look identical on every render and every device, so option
   order is derived from a hash of the exercise key rather than Math.random. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ── option builders ───────────────────────────────────────────────────── */
function glyphOptions(course: Course, target: Lexeme, key: string, pool?: Lexeme[]): GlyphOption[] {
  const source = pool ?? Object.values(course.lexemes);
  const sameSet = source.filter((item) => item.id !== target.id && item.glyph !== target.glyph);
  const random = rng(hash(key));
  const distractors = shuffle(sameSet, random).slice(0, 3);
  const ordered = shuffle([target, ...distractors], random);
  return ordered.map((item) => ({ id: item.id, glyph: item.glyph, text: item.text }));
}

function textOptions(course: Course, target: Lexeme, key: string, pool?: Lexeme[]) {
  const source = pool ?? Object.values(course.lexemes);
  const sameSet = source.filter((item) => item.id !== target.id && item.text !== target.text);
  const random = rng(hash(`${key}:text`));
  const distractors = shuffle(sameSet, random).slice(0, 3);
  return shuffle([target, ...distractors], random).map((item) => ({ id: item.id, text: item.text }));
}

function buildPool(phrase: Phrase, key: string): string[] {
  const random = rng(hash(`${key}:tiles`));
  const extras = shuffle(phrase.extraTiles, random).slice(0, 2);
  return shuffle([...phrase.tiles, ...extras], random);
}

/* ── exercise constructors ─────────────────────────────────────────────── */
function recognise(course: Course, lexeme: Lexeme, pool?: Lexeme[]): Exercise {
  const key = `recognise:${lexeme.id}`;
  return {
    kind: "recognise",
    key,
    lexemeId: lexeme.id,
    text: lexeme.text,
    latin: lexeme.latin,
    glyph: lexeme.glyph,
    options: glyphOptions(course, lexeme, key, pool),
  };
}

function listen(course: Course, lexeme: Lexeme, pool?: Lexeme[]): Exercise {
  const key = `listen:${lexeme.id}`;
  return {
    kind: "listen",
    key,
    lexemeId: lexeme.id,
    text: lexeme.text,
    latin: lexeme.latin,
    glyph: lexeme.glyph,
    options: glyphOptions(course, lexeme, key, pool),
  };
}

function read(course: Course, lexeme: Lexeme, pool?: Lexeme[]): Exercise {
  const key = `read:${lexeme.id}`;
  return {
    kind: "read",
    key,
    lexemeId: lexeme.id,
    text: lexeme.text,
    latin: lexeme.latin,
    glyph: lexeme.glyph,
    options: textOptions(course, lexeme, key, pool),
  };
}

function build(phrase: Phrase, audioOnly: boolean): Exercise {
  const key = `build:${phrase.id}:${audioOnly ? "a" : "t"}`;
  return {
    kind: "build",
    key,
    phraseId: phrase.id,
    text: phrase.text,
    latin: phrase.latin,
    gloss: phrase.gloss,
    glyph: phrase.glyph,
    audioOnly,
    tiles: phrase.tiles,
    pool: buildPool(phrase, key),
  };
}

function shadow(phrase: Phrase): Exercise {
  return {
    kind: "shadow",
    key: `shadow:${phrase.id}`,
    text: phrase.text,
    latin: phrase.latin,
    gloss: phrase.gloss,
    glyph: phrase.glyph,
    lexemeId: phrase.id,
  };
}

/* ── lesson assembly ───────────────────────────────────────────────────── */
export function buildExercises(course: Course, lesson: Lesson): Exercise[] {
  const lexemes = lesson.newLexemes.map((id) => course.lexemes[id]).filter(Boolean) as Lexeme[];
  const phrases = lesson.phrases.map((id) => course.phrases[id]).filter(Boolean) as Phrase[];
  const includingCheckpoint = lexemes.length > 0 ? lexemes : (Object.values(course.lexemes) as Lexeme[]);
  const unitLexemes = includingCheckpoint;
  const plan: Exercise[] = [];
  const seen = new Set<string>();

  const push = (exercise: Exercise | undefined) => {
    if (!exercise || seen.has(exercise.key)) return;
    seen.add(exercise.key);
    plan.push(exercise);
  };

  // 1. Meet the meaning: sound + picture, no English.
  includingCheckpoint.slice(0, 4).forEach((lexeme, index) => {
    push(index === 3 ? listen(course, lexeme, unitLexemes) : recognise(course, lexeme, unitLexemes));
  });

  // 2. First sentence, built from tiles in the target script.
  phrases.slice(0, 2).forEach((phrase, index) => push(build(phrase, index === 1)));

  // 3. Re-attach meaning to the written form.
  includingCheckpoint.slice(0, 2).forEach((lexeme) => push(read(course, lexeme, unitLexemes)));

  // 4. Perception work on the accent.
  lesson.ear.slice(0, 2).forEach((drill) => push({ kind: "ear", key: `ear:${drill.id}`, drill }));

  // 5. Retest with audio only, then more sentences.
  includingCheckpoint.slice(2, 6).forEach((lexeme, index) =>
    push(index === 0 ? recognise(course, lexeme, unitLexemes) : listen(course, lexeme, unitLexemes)),
  );
  phrases.slice(2).forEach((phrase, index) => push(build(phrase, index % 2 === 1)));

  // 6. Say it out loud.
  if (phrases[0]) push(shadow(phrases[0]));

  // 7. Leftover perception drills and a final written check.
  lesson.ear.slice(2).forEach((drill) => push({ kind: "ear", key: `ear:${drill.id}`, drill }));
  includingCheckpoint.slice(4, 8).forEach((lexeme) => push(read(course, lexeme, unitLexemes)));

  const cap = lesson.kind === "checkpoint" ? 18 : 14;
  return plan.slice(0, cap);
}

/* ── spaced-repetition session ─────────────────────────────────────────── */
export function buildReview(course: Course, lexemeIds: string[], cap = 12): Exercise[] {
  const lexemes = lexemeIds.map((id) => course.lexemes[id]).filter(Boolean) as Lexeme[];
  const plan: Exercise[] = [];
  const seen = new Set<string>();

  lexemes.slice(0, cap).forEach((lexeme, index) => {
    const cycle = index % 3;
    const exercise =
      cycle === 0
        ? recognise(course, lexeme)
        : cycle === 1
          ? listen(course, lexeme)
          : read(course, lexeme);
    if (seen.has(exercise.key)) return;
    seen.add(exercise.key);
    plan.push(exercise);
  });

  if (plan.length === 0) {
    return buildExercises(course, {
      id: "review.empty",
      title: "Review",
      latin: "Review",
      intro: "",
      kind: "lesson",
      newLexemes: [],
      phrases: Object.keys(course.phrases).slice(0, 3),
      ear: [],
    });
  }
  return plan;
}

/** Deterministic answer index for the ear drill so the UI never re-shuffles. */
export function earAudio(drill: EarDrill): { text: string; latin: string; gloss: string } {
  return drill.target === "a" ? drill.a : drill.b;
}

/* ── speaking track ───────────────────────────────────────────────────── */
function speak(
  key: string,
  entry: { text: string; latin: string; gloss: string; glyph: string; tone?: string; lexemeId?: string },
): Exercise {
  return { kind: "speak", key, ...entry };
}

/**
 * One speaking lesson per unit: the learner says the unit's own words, so the
 * drill never asks for a sound the course has not introduced yet.
 */
export function buildSpeaking(course: Course, unit: Unit): Exercise[] {
  const plan: Exercise[] = [];
  const seen = new Set<string>();

  unit.lessons.flatMap((lesson) => lesson.newLexemes).forEach((id) => {
    if (seen.has(id) || plan.length >= 7) return;
    seen.add(id);
    const lexeme = course.lexemes[id];
    if (!lexeme) return;
    plan.push(
      speak(`speak:${lexeme.id}`, {
        text: lexeme.text,
        latin: lexeme.latin,
        gloss: lexeme.gloss,
        glyph: lexeme.glyph,
        tone: lexeme.tone,
        lexemeId: lexeme.id,
      }),
    );
  });

  const phraseIds = [...new Set(unit.lessons.flatMap((lesson) => lesson.phrases))].slice(0, 2);
  phraseIds.forEach((id) => {
    const phrase = course.phrases[id];
    if (!phrase) return;
    plan.push(speak(`speak:${phrase.id}`, { text: phrase.text, latin: phrase.latin, gloss: phrase.gloss, glyph: phrase.glyph }));
  });

  return plan;
}

/* ── reading track ────────────────────────────────────────────────────── */
function readingGlyphOptions(lesson: ReadingLesson, target: ReadingSymbol, key: string) {
  const random = rng(hash(`${key}:glyph`));
  const others = lesson.symbols.filter((symbol) => symbol.glyph !== target.glyph);
  const distractors = shuffle(others, random).slice(0, 3);
  return shuffle([target, ...distractors], random).map((symbol) => ({ id: symbol.glyph, glyph: symbol.glyph }));
}

function readingSoundOptions(lesson: ReadingLesson, target: ReadingSymbol, key: string) {
  const random = rng(hash(`${key}:sound`));
  const others = lesson.symbols.filter((symbol) => symbol.glyph !== target.glyph && symbol.sound !== target.sound);
  const distractors = shuffle(others, random).slice(0, 3);
  return shuffle([target, ...distractors], random).map((symbol) => ({ id: symbol.glyph, label: symbol.sound }));
}

/** Reading lessons alternate direction: letter → sound, then sound → letter. */
export function buildReading(lesson: ReadingLesson): Exercise[] {
  const plan: Exercise[] = [];
  const seen = new Set<string>();

  const push = (exercise: Exercise) => {
    if (seen.has(exercise.key)) return;
    seen.add(exercise.key);
    plan.push(exercise);
  };

  lesson.symbols.forEach((symbol, index) => {
    const read: Exercise = {
      kind: "scriptRead",
      key: `scriptRead:${lesson.id}:${symbol.glyph}`,
      glyph: symbol.glyph,
      text: symbol.glyph,
      latin: symbol.sound,
      pronounce: symbol.pronounce,
      sound: symbol.sound,
      options: readingSoundOptions(lesson, symbol, `scriptRead:${lesson.id}:${symbol.glyph}`),
    };
    const listen: Exercise = {
      kind: "scriptListen",
      key: `scriptListen:${lesson.id}:${symbol.glyph}`,
      glyph: symbol.glyph,
      text: symbol.glyph,
      latin: symbol.sound,
      pronounce: symbol.pronounce,
      sound: symbol.sound,
      options: readingGlyphOptions(lesson, symbol, `scriptListen:${lesson.id}:${symbol.glyph}`),
    };
    if (index % 2 === 0) {
      push(read);
      push(listen);
    } else {
      push(listen);
      push(read);
    }
  });

  const words = lesson.symbols
    .map((symbol) => symbol.example)
    .filter((example): example is { text: string; latin: string; gloss: string } => Boolean(example))
    .filter((example, index, all) => all.findIndex((entry) => entry.latin === example.latin) === index)
    .slice(0, 4);

  if (words.length >= 2) {
    const random = rng(hash(`${lesson.id}:words`));
    words.slice(0, 3).forEach((word) => {
      const options = shuffle(words, random).map((entry) => ({ id: entry.latin, text: entry.latin }));
      push({
        kind: "scriptWord",
        key: `scriptWord:${lesson.id}:${word.latin}`,
        text: word.text,
        latin: word.latin,
        gloss: word.gloss,
        glyph: word.text,
        options,
      });
    });
  }

  return plan.slice(0, 16);
}
