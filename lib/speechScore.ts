/**
 * Pronunciation scoring.
 *
 * The browser's speech recogniser gives us a transcript, not phonemes, so the
 * honest thing to do is score how much of the target the recogniser could
 * recover. The scorer has to account for recogniser conventions without
 * erasing meaningful contrasts:
 *
 * - Japanese readings are accepted alongside the written kanji form.
 * - Katakana and hiragana are compared as the same kana.
 * - Russian stress marks are ignored because recognisers do not emit them.
 * - Spanish/French accent marks are ignored, but ñ and other meaningful
 *   consonants stay distinct.
 * - Thai tone marks, Japanese dakuten and every consonant/vowel stay intact.
 *
 * A one-character difference in a short word is still a different word, so the
 * old "short word participation" boost and the loose containment pass are
 * deliberately gone.
 */

export type SpeechVerdict = "clear" | "close" | "retry";

export type SpeechScore = {
  /** 0–100, the number shown to the learner. */
  score: number;
  similarity: number;
  verdict: SpeechVerdict;
  /** Target characters the recogniser did not hear. */
  missed: string[];
};

export type SpeechMatch = {
  /** The recognition alternative that matched the target best. */
  transcript: string;
  result: SpeechScore;
};

/** Below this the attempt is marked incorrect and costs a focus heart. */
export const SPEECH_PASS = 68;

/** At or above this, the attempt is described as clear rather than close. */
const SPEECH_CLEAR = 90;

const NOISE = /[\s\p{P}\p{S}]/gu;
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;
const THAI_TONES = "่้๊๋";
const JAPANESE_TIMING = "っゃゅょぁぃぅぇぉゎー";

function toHiragana(value: string): string {
  return value.replace(/[\u30A1-\u30F6]/g, (character) =>
    String.fromCharCode(character.charCodeAt(0) - 0x60),
  );
}

/**
 * Normalise the parts of spelling that a recogniser is allowed to differ on,
 * while preserving the sounds that distinguish words.
 */
export function normaliseSpeech(value: string, locale = ""): string {
  const language = locale.toLowerCase().split(/[-_]/)[0];
  let text = value.normalize("NFKC").toLowerCase();

  if (language === "ja") text = toHiragana(text);

  if (language === "ru") {
    // Stress marks are teaching aids, not ordinary Russian orthography.
    text = text
      .normalize("NFD")
      .replace(/\u0301/g, "")
      .normalize("NFC")
      // ё is routinely typed and recognised as е; that is a spelling
      // convention, not a reason to fail an otherwise correct attempt.
      .replace(/ё/g, "е");
  }

  if (language === "es" || language === "fr") {
    // Recognisers frequently omit written accents. Fold the accent marks but
    // keep the tilde so Spanish ñ remains a different consonant from n.
    text = text
      .normalize("NFD")
      .replace(/[\u0300-\u0302\u0308]/g, "")
      .normalize("NFC");
  }

  return text.replace(ZERO_WIDTH, "").replace(NOISE, "").trim();
}

function editDistance(a: string[], b: string[]): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  let previous = new Array<number>(cols);
  let current = new Array<number>(cols);
  for (let j = 0; j < cols; j += 1) previous[j] = j;

  for (let i = 1; i < rows; i += 1) {
    current[0] = i;
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    [previous, current] = [current, previous];
  }
  return previous[cols - 1];
}

function missingCharacters(said: string[], wanted: string[]): string[] {
  const remaining = [...said];
  const missed: string[] = [];
  for (const character of wanted) {
    const at = remaining.indexOf(character);
    if (at >= 0) remaining.splice(at, 1);
    else missed.push(character);
  }
  return missed;
}

function repeatedRuns(value: string): Map<string, number> {
  const characters = [...value];
  const runs = new Map<string, number>();
  for (let start = 0; start < characters.length; ) {
    let end = start + 1;
    while (end < characters.length && characters[end] === characters[start]) end += 1;
    if (end - start >= 2) runs.set(characters[start], Math.max(runs.get(characters[start]) ?? 0, end - start));
    start = end;
  }
  return runs;
}

/**
 * Catch contrasts that edit distance alone can wave through: Thai tone marks,
 * Japanese small kana / long vowels, and doubled letters such as Spanish rr.
 * A recogniser-only accent omission is deliberately not a contrast loss.
 */
function losesMeaningfulContrast(said: string, wanted: string, locale: string): boolean {
  const language = locale.toLowerCase().split(/[-_]/)[0];

  if (language === "th") {
    const heardTones = [...said].filter((character) => THAI_TONES.includes(character)).sort().join("");
    const targetTones = [...wanted].filter((character) => THAI_TONES.includes(character)).sort().join("");
    return heardTones !== targetTones;
  }

  if (language === "ja") {
    const timing = (value: string) => [...value].filter((character) => JAPANESE_TIMING.includes(character)).length;
    if (timing(said) !== timing(wanted)) return true;
  }

  const heardRuns = repeatedRuns(said);
  for (const [character, length] of repeatedRuns(wanted)) {
    if ((heardRuns.get(character) ?? 0) < length) return true;
  }
  return false;
}

function scoreAgainst(heard: string, target: string, locale: string): SpeechScore {
  const saidText = normaliseSpeech(heard, locale);
  const wantedText = normaliseSpeech(target, locale);
  const said = [...saidText];
  const wanted = [...wantedText];
  const missed = missingCharacters(said, wanted);

  if (!said.length || !wanted.length) {
    return { score: 0, similarity: 0, verdict: "retry", missed };
  }

  const similarity = Math.max(
    0,
    1 - editDistance(said, wanted) / Math.max(said.length, wanted.length),
  );
  const rawScore = Math.round(similarity * 100);
  // A single flipped tone or dropped geminate is a different word, even when
  // most characters match. Do not let it pass on character count alone.
  const score = losesMeaningfulContrast(saidText, wantedText, locale)
    ? Math.min(rawScore, SPEECH_PASS - 1)
    : rawScore;
  const verdict: SpeechVerdict =
    score >= SPEECH_CLEAR ? "clear" : score >= SPEECH_PASS ? "close" : "retry";
  return { score, similarity, verdict, missed };
}

/**
 * Score an attempt against one or more accepted targets. Japanese speaking
 * cards pass both the written form and its kana reading; the best match wins.
 * The locale controls which spelling differences are treated as recogniser
 * conventions rather than pronunciation mistakes.
 */
export function scorePronunciation(
  heard: string,
  target: string | string[],
  locale = "",
): SpeechScore {
  const targets = [...new Set((Array.isArray(target) ? target : [target]).filter(Boolean))];
  if (!heard.trim() || targets.length === 0) {
    return { score: 0, similarity: 0, verdict: "retry", missed: [] };
  }

  let best: SpeechScore | null = null;
  for (const candidate of targets) {
    const score = scoreAgainst(heard, candidate, locale);
    if (!best || score.score > best.score) best = score;
  }
  return best ?? { score: 0, similarity: 0, verdict: "retry", missed: [] };
}

/**
 * Pick the best transcript from the recogniser's alternatives. Browsers often
 * put the correct reading second or third; using only the first candidate was
 * turning good attempts into failures.
 */
export function bestSpeechMatch(
  heard: string | string[],
  target: string | string[],
  locale = "",
): SpeechMatch | null {
  const candidates = (Array.isArray(heard) ? heard : [heard])
    .map((candidate) => candidate.trim())
    .filter(Boolean);

  let best: SpeechMatch | null = null;
  for (const candidate of candidates) {
    const result = scorePronunciation(candidate, target, locale);
    if (!best || result.score > best.result.score) best = { transcript: candidate, result };
  }
  return best;
}

export function verdictCopy(verdict: SpeechVerdict): string {
  if (verdict === "clear") return "Clear — that is the shape of it.";
  if (verdict === "close") return "Close enough. One more pass will lock it in.";
  return "Not yet. Listen again, then copy the rhythm.";
}
