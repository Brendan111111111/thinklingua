/**
 * Thai tone feedback, one syllable at a time.
 *
 * The contour DSP lives in `pitch.ts`; this module splits a Thai line into
 * syllables, divides the aligned contours across them, and reports which
 * syllable's shape drifted furthest from the native voice.
 *
 * The split is orthographic rather than acoustic: each written vowel starts a
 * syllable, and the contour is divided in proportion to spoken length (long
 * vowels and repeated ๆ get more time). The browser gives us no phone-level
 * alignment, so this is the honest approximation available client-side.
 */

import { alignContours } from "./pitch";

export type ToneShape = "rise" | "fall" | "level";

export type ThaiSyllable = {
  /** Written chunk, exactly as it appears in the line. */
  text: string;
  /** What the learner sees: open syllables with an unwritten vowel gain a ะ. */
  label: string;
  /** Relative spoken length, used to divide the contour. */
  weight: number;
};

export type SyllableTone = {
  text: string;
  label: string;
  /** 1-based position in the line. */
  ordinal: number;
  /** Mean semitone gap from the native line over this syllable. */
  deviation: number;
  /** 0–100 match for this syllable. */
  score: number;
  nativeShape: ToneShape;
  userShape: ToneShape;
};

export type ToneFeedback = {
  headline: string | null;
  detail: string | null;
  worst: SyllableTone | null;
};

const LEADING_VOWELS = new Set(Array.from("เแโใไ"));
const SHORT_VOWELS = new Set(Array.from("ะัิุึ"));
const NUCLEUS_VOWELS = new Set(Array.from("ะัาำิีึืุู"));
const VOWEL_MARKS = new Set(Array.from("็่้๊๋์ํ๎"));
const CONSONANTS = new Set(Array.from("กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮฤฦ"));
/** Consonants that can close a Thai syllable. */
const FINAL_CONSONANTS = new Set(Array.from("กงดนมยวบปลฟศสษญณตถทธรคชซพภฬ"));
/** Consonants that turn a following ห into a silent leading consonant. */
const H_LEADING = new Set(Array.from("งญนมยรลว"));
/** Two-consonant onsets that belong to one syllable. */
const CLUSTERS = new Set([
  "กร",
  "กล",
  "กว",
  "ขร",
  "ขล",
  "ขว",
  "คร",
  "คล",
  "คว",
  "จร",
  "ตร",
  "ทร",
  "ปร",
  "ปล",
  "ผล",
  "พล",
  "พร",
  "ฟร",
  "สร",
  "ศร",
  "หร",
  "อย",
]);
const REPEAT = "ๆ";

/** Last character of the syllable that is not a tone or silence mark. */
function lastSound(chars: string): string | undefined {
  for (let index = chars.length - 1; index >= 0; index -= 1) {
    const ch = chars[index]!;
    if (!VOWEL_MARKS.has(ch)) return ch;
  }
  return undefined;
}

/** Would this character begin a new syllable's vowel after a final consonant? */
function opensSyllable(ch: string | undefined): boolean {
  return !!ch && (NUCLEUS_VOWELS.has(ch) || ch === "อ" || VOWEL_MARKS.has(ch));
}

type WordPart = { segment: string; isWordLike?: boolean };
type WordSegmenter = { segment(input: string): Iterable<WordPart> };
type SegmenterConstructor = new (locales: string, options: { granularity: "word" }) => WordSegmenter;

/**
 * Thai does not put spaces between words, so splitting the whole line would
 * glue a final consonant onto the next word (ใกล้ + สถานี became ใกล้ส). Ask the
 * platform word segmenter for the boundaries first.
 */
function wordChunks(text: string): string[] {
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterConstructor }).Segmenter;
  if (Segmenter) {
    const segmenter = new Segmenter("th", { granularity: "word" });
    return [...segmenter.segment(text)]
      .filter((part) => part.isWordLike !== false)
      .map((part) => part.segment);
  }
  return text.split(/[\s\p{P}\p{S}]+/u).filter(Boolean);
}

function clusterAt(previous: string, next: string): boolean {
  return CLUSTERS.has(previous + next) || (previous === "ห" && H_LEADING.has(next));
}

/** Does a consonant start the next syllable's onset, or close this one? */
function startsOnset(consonant: string, after: string | undefined, afterNext: string | undefined): boolean {
  if (!after) return false;
  if (LEADING_VOWELS.has(after)) return false;
  if (NUCLEUS_VOWELS.has(after) || VOWEL_MARKS.has(after)) return true;
  if (CONSONANTS.has(after) && clusterAt(consonant, after)) {
    return !!afterNext && NUCLEUS_VOWELS.has(afterNext);
  }
  return false;
}

/**
 * Split Thai text into syllables. Whitespace and non-Thai characters separate
 * syllables but are not themselves returned.
 */
function splitWord(text: string): ThaiSyllable[] {
  const syllables: ThaiSyllable[] = [];
  let current = "";
  let nucleus = false;
  let leading = false;
  let onsetCount = 0;
  let repeated = false;

  const flush = () => {
    if (!current) return;
    const chars = Array.from(current);
    const short = chars.some((ch) => SHORT_VOWELS.has(ch) || ch === "็");
    const long =
      chars.some((ch) => NUCLEUS_VOWELS.has(ch) && !SHORT_VOWELS.has(ch)) || chars.some((ch) => LEADING_VOWELS.has(ch));
    let weight = short ? 2 : long ? 3 : 2;
    if (repeated) weight *= 2;
    const writtenConsonants = chars.filter((ch) => CONSONANTS.has(ch)).length;
    const label = !short && !long && writtenConsonants === 1 ? `${current}ะ` : current;
    syllables.push({ text: current, label, weight });
    current = "";
    nucleus = false;
    leading = false;
    onsetCount = 0;
    repeated = false;
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    const next = text[i + 1];
    const afterNext = text[i + 2];

    if (ch === REPEAT) {
      if (current) {
        current += ch;
        repeated = true;
      }
      continue;
    }

    if (LEADING_VOWELS.has(ch)) {
      flush();
      current = ch;
      leading = true;
      continue;
    }

    if (VOWEL_MARKS.has(ch)) {
      if (current) current += ch;
      continue;
    }

    if (NUCLEUS_VOWELS.has(ch)) {
      current += ch;
      nucleus = true;
      continue;
    }

    if (!CONSONANTS.has(ch)) {
      flush();
      continue;
    }

    if (!current) {
      current = ch;
      onsetCount = 1;
      continue;
    }

    // Written อ carries the vowel /ɔː/ after an onset consonant: ขอ, ขอบ, รอ.
    if (ch === "อ" && !nucleus) {
      current += ch;
      nucleus = true;
      continue;
    }

    if (!nucleus) {
      if (leading && onsetCount === 0) {
        current += ch;
        onsetCount = 1;
        nucleus = true;
        continue;
      }
      const before = current[current.length - 1]!;
      if (onsetCount < 2 && clusterAt(before, ch)) {
        current += ch;
        onsetCount += 1;
        continue;
      }
      // ส + ว in สวัสดี and ต + ล in ตลาด are separate syllables with an
      // unwritten vowel, so a following vowel sound starts the next one.
      if (opensSyllable(next)) {
        flush();
        current = ch;
        onsetCount = 1;
        continue;
      }
      current += ch;
      onsetCount += 1;
      continue;
    }

    const previous = current[current.length - 1]!;
    if (clusterAt(previous, ch)) {
      current += ch;
      continue;
    }
    // The trailing อ in ื...อ belongs to the same vowel: ชื่อ, เมื่อ, เพื่อน.
    if (ch === "อ" && lastSound(current) === "ื") {
      current += ch;
      continue;
    }
    if (!FINAL_CONSONANTS.has(ch) || startsOnset(ch, next, afterNext)) {
      flush();
      current = ch;
      onsetCount = 1;
      continue;
    }
    current += ch;
  }

  flush();
  return syllables;
}

/**
 * Split Thai text into syllables. Word boundaries come first, so a final
 * consonant is never borrowed by the next word.
 */
export function splitThaiSyllables(text: string): ThaiSyllable[] {
  return wordChunks(text).flatMap((chunk) => splitWord(chunk));
}

/** Divide 24 contour points across syllables in proportion to their weight. */
function spans(weights: number[], points: number): Array<[number, number]> {
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  let cumulative = 0;
  return weights.map((weight) => {
    const start = Math.min(points - 1, Math.round((cumulative / total) * points));
    cumulative += weight;
    const end = Math.min(points, Math.round((cumulative / total) * points));
    return [start, Math.max(start + 1, end)];
  });
}

function shapeOf(semitones: number): ToneShape {
  if (semitones > 0.8) return "rise";
  if (semitones < -0.8) return "fall";
  return "level";
}

/**
 * Score each syllable against the native contour. Uses the same DTW path as
 * the overall melody score, so a learner who speaks slower is not penalised:
 * each native point is compared with the learner points it aligned to.
 */
export function syllableTones(reference: number[], user: number[], syllables: ThaiSyllable[]): SyllableTone[] {
  if (!syllables.length || reference.length < 2 || user.length !== reference.length) return [];
  const alignment = alignContours(reference, user);
  if (!alignment) return [];

  const buckets: number[][] = reference.map(() => []);
  for (const [referenceIndex, userIndex] of alignment.pairs) {
    buckets[referenceIndex]?.push(user[userIndex]!);
  }
  const userAt = buckets.map((values, index) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : user[index]!,
  );

  const ranges = spans(
    syllables.map((syllable) => syllable.weight),
    reference.length,
  );

  return syllables.map((syllable, index) => {
    const [start, end] = ranges[index]!;
    const nativeSpan = reference.slice(start, end);
    const userSpan = userAt.slice(start, end);
    let total = 0;
    for (let point = 0; point < nativeSpan.length; point += 1) {
      total += Math.abs(nativeSpan[point]! - userSpan[point]!);
    }
    const deviation = nativeSpan.length ? total / nativeSpan.length : 0;
    return {
      text: syllable.text,
      label: syllable.label,
      ordinal: index + 1,
      deviation,
      score: Math.round(Math.max(0, Math.min(100, 100 - deviation * 20))),
      nativeShape: shapeOf(nativeSpan[nativeSpan.length - 1]! - nativeSpan[0]!),
      userShape: shapeOf(userSpan[userSpan.length - 1]! - userSpan[0]!),
    };
  });
}

/** Below this mean gap the syllable counts as on tone. */
export const TONE_OFF_SEMITONES = 0.75;

const SHAPE_VERB: Record<ToneShape, string> = {
  rise: "rises",
  fall: "falls",
  level: "stays level",
};

function directionCopy(tone: SyllableTone): string {
  if (tone.nativeShape === tone.userShape) {
    if (tone.nativeShape === "level") return `Your pitch sits away from the native line on ${tone.label}.`;
    return `The native line ${SHAPE_VERB[tone.nativeShape]} further than yours on ${tone.label}.`;
  }
  return `The native line ${SHAPE_VERB[tone.nativeShape]} through ${tone.label}; yours ${SHAPE_VERB[tone.userShape]}.`;
}

/**
 * Name the syllable to work on. Keeps quiet when the whole line is close enough
 * and on one-syllable words, where there is nothing to single out.
 */
export function toneFeedback(tones: SyllableTone[]): ToneFeedback {
  if (tones.length < 2) return { headline: null, detail: null, worst: null };

  let worst = tones[0]!;
  for (const tone of tones) {
    if (tone.deviation > worst.deviation) worst = tone;
  }

  if (worst.deviation < TONE_OFF_SEMITONES) {
    return {
      headline: `All ${tones.length} syllables held the native tone.`,
      detail: null,
      worst: null,
    };
  }

  return {
    headline: `Syllable ${worst.ordinal} · ${worst.label} is the one to fix.`,
    detail: directionCopy(worst),
    worst,
  };
}
