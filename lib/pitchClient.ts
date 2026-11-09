"use client";

/**
 * Browser plumbing for pitch feedback: decode the learner's recording and the
 * native voice, then compare their contours. The DSP lives in `pitch.ts`.
 */

import { contourFromTrack, extractPitch, melodyScore, type MelodyAnalysis } from "./pitch";
import { splitThaiSyllables, syllableTones, type SyllableTone } from "./thaiTones";

const referenceCache = new Map<string, number[] | null>();

type AudioContextCtor = typeof AudioContext;

function audioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const candidate = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  return candidate ?? null;
}

async function decode(blob: Blob): Promise<AudioBuffer | null> {
  const Ctor = audioContextCtor();
  if (!Ctor) return null;
  const context = new Ctor();
  try {
    const data = await blob.arrayBuffer();
    return await context.decodeAudioData(data);
  } catch {
    return null;
  } finally {
    void context.close();
  }
}

function mono(buffer: AudioBuffer): Float32Array {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const output = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < output.length; i += 1) output[i] += data[i] / buffer.numberOfChannels;
  }
  return output;
}

function contourFromBuffer(buffer: AudioBuffer): number[] | null {
  return contourFromTrack(extractPitch(mono(buffer), buffer.sampleRate));
}

export function pitchSupported(locale: string): boolean {
  return locale.toLowerCase().startsWith("th");
}

/** The native line's own pitch contour — the reference the learner imitates. */
export async function referenceContour(text: string, locale: string): Promise<number[] | null> {
  const key = `${locale}|${text}`;
  const cached = referenceCache.get(key);
  if (cached !== undefined) return cached;

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, lang: locale, rate: 1 }),
    });
    if (!response.ok) throw new Error(`tts ${response.status}`);
    const buffer = await decode(await response.blob());
    const contour = buffer ? contourFromBuffer(buffer) : null;
    referenceCache.set(key, contour);
    return contour;
  } catch {
    referenceCache.set(key, null);
    return null;
  }
}

export type SpeakAnalysis = MelodyAnalysis & {
  /** One entry per spoken syllable; empty when the contour could not be measured. */
  syllables: SyllableTone[];
};

export async function analyseAttempt(blob: Blob, text: string, locale: string): Promise<SpeakAnalysis> {
  const [buffer, reference] = await Promise.all([decode(blob), referenceContour(text, locale)]);
  const user = buffer ? contourFromBuffer(buffer) : null;
  const syllables = user && reference ? syllableTones(reference, user, splitThaiSyllables(text)) : [];
  return { melody: melodyScore(user, reference), user, reference, syllables };
}
