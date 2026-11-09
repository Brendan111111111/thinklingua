/**
 * Pronunciation scoring.
 *
 * The browser's speech recogniser gives us a transcript, not phonemes, so the
 * honest thing to do is score how much of the target the recogniser could
 * recover. Thai tone marks and Japanese small kana all count as characters:
 * dropping one changes the word, so it should cost accuracy.
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

/** Below this the attempt is marked incorrect and costs a focus heart. */
export const SPEECH_PASS = 55;

const NOISE = /[\s\p{P}\p{S}]/gu;

export function normaliseSpeech(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(NOISE, "").trim();
}

function editDistance(a: string, b: string): number {
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

export function scorePronunciation(heard: string, target: string): SpeechScore {
  const said = normaliseSpeech(heard);
  const wanted = normaliseSpeech(target);
  const missed = [...wanted].filter((character) => !said.includes(character));

  if (!said || !wanted) {
    return { score: 0, similarity: 0, verdict: "retry", missed };
  }

  const similarity = Math.max(0, 1 - editDistance(said, wanted) / Math.max(said.length, wanted.length));
  let score = Math.round(similarity * 100);

  // Recognisers often return the phrase plus a stray particle, or trim it.
  // Containment only counts when the shorter attempt covers most of the
  // longer one — saying half a sentence is not a clear pass.
  const coverage = Math.min(said.length, wanted.length) / Math.max(said.length, wanted.length);
  if (said === wanted) score = 100;
  else if ((said.includes(wanted) || wanted.includes(said)) && coverage >= 0.75) score = Math.max(score, 88);

  // A single wrong character in a two-character word is not a total miss.
  if (wanted.length <= 2 && said.length === wanted.length && similarity >= 0.5) {
    score = Math.max(score, 60);
  }

  const verdict: SpeechVerdict = score >= 80 ? "clear" : score >= SPEECH_PASS ? "close" : "retry";
  return { score, similarity, verdict, missed };
}

export function verdictCopy(verdict: SpeechVerdict): string {
  if (verdict === "clear") return "Clear — that is the shape of it.";
  if (verdict === "close") return "Close enough. One more pass will lock it in.";
  return "Not yet. Listen again, then copy the rhythm.";
}
