"use client";

/**
 * Voice playback.
 *
 * Server voices (Azure / Google / ElevenLabs) are native-accent neural voices.
 * If no key is configured the app falls back to the best voice installed in the
 * learner's OS, filtered by locale so Thai is read by a Thai voice rather than
 * an English one guessing at the script.
 */

let current: HTMLAudioElement | null = null;
let currentCancel: (() => void) | null = null;
const cache = new Map<string, string>();
const CACHE_LIMIT = 48;

export type SpeakOptions = { locale: string; rate?: number };

function cacheGet(key: string): string | undefined {
  return cache.get(key);
}

function cacheSet(key: string, url: string) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) {
      const url = cache.get(oldest);
      if (url) URL.revokeObjectURL(url);
      cache.delete(oldest);
    }
  }
  cache.set(key, url);
}

export function stopSpeaking() {
  if (current) {
    current.pause();
    current.src = "";
    current = null;
  }
  if (currentCancel) {
    currentCancel();
    currentCancel = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    current = audio;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (current === audio) current = null;
      resolve();
    };
    audio.onended = finish;
    audio.onerror = finish;
    audio.onpause = finish;
    const playback = audio.play();
    if (playback && typeof playback.catch === "function") playback.catch(finish);
    currentCancel = finish;
    window.setTimeout(finish, 20000);
  });
}

/* ── browser fallback ──────────────────────────────────────────────────── */
type SpeechVoice = SpeechSynthesisVoice;

const PREFERRED_NAMES = [
  "premium",
  "enhanced",
  "natural",
  "neural",
  "siri",
  "google",
  "kyoko",
  "otoya",
  "nanami",
  "haruka",
  "ichiro",
  "premwadee",
  "niwat",
  "achara",
  "kanya",
  "elvira",
  "denise",
];

export function pickVoice(locale: string): SpeechVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const language = locale.toLowerCase();
  const base = language.split("-")[0];

  const scored = voices.map((voice) => {
    const lang = voice.lang.toLowerCase().replace("_", "-");
    const name = voice.name.toLowerCase();
    let score = 0;
    if (lang === language) score += 100;
    else if (lang.startsWith(base)) score += 45;
    else return { voice, score: -1 };
    for (const [index, token] of PREFERRED_NAMES.entries()) {
      if (name.includes(token)) {
        score += 30 - index;
        break;
      }
    }
    if (!voice.localService) score += 4;
    if (name.includes("compact") || name.includes("default")) score -= 12;
    return { voice, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0].voice : null;
}

export function primeVoices(): Promise<SpeechVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const existing = synth.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", finish, { once: true });
    window.setTimeout(finish, 1400);
  });
}

async function speakBrowser(text: string, locale: string, rate: number): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  // On a cold page the voice list is still empty, so wait for it before
  // choosing — otherwise Thai gets read by whatever the default happens to be.
  await primeVoices();
  const voice = pickVoice(locale);

  await new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.lang = locale;
    utterance.rate = rate;
    utterance.pitch = 1;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (currentCancel === finish) currentCancel = null;
      resolve();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    currentCancel = finish;
    // Cancelling an idle engine in Chrome can swallow the utterance that
    // follows, so only interrupt when something is actually being spoken.
    if (synth.speaking || synth.pending) synth.cancel();
    if (synth.paused) synth.resume();
    synth.speak(utterance);
    window.setTimeout(finish, 1200 + text.length * 170);
  });
}

/* ── public API ────────────────────────────────────────────────────────── */
export async function speak(text: string, { locale, rate = 1 }: SpeakOptions): Promise<void> {
  stopSpeaking();
  const key = `${locale}|${rate.toFixed(2)}|${text}`;
  const cached = cacheGet(key);
  if (cached) {
    await playUrl(cached);
    return;
  }

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, lang: locale, rate }),
    });
    if (!response.ok) throw new Error(`tts ${response.status}`);
    const blob = await response.blob();
    if (blob.size < 500) throw new Error("empty audio");
    const url = URL.createObjectURL(blob);
    cacheSet(key, url);
    await playUrl(url);
  } catch {
    await speakBrowser(text, locale, rate);
  }
}

export type EngineInfo = {
  engine: "azure" | "google" | "elevenlabs" | "free" | "browser";
  native: boolean;
  label: string;
};

export async function loadEngine(): Promise<EngineInfo> {
  try {
    const response = await fetch("/api/tts/status", { cache: "no-store" });
    if (!response.ok) throw new Error("status");
    return (await response.json()) as EngineInfo;
  } catch {
    return { engine: "browser", native: false, label: "Browser voice" };
  }
}

/* ── speech recognition (optional, used by shadowing) ──────────────────── */
type Recognizer = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export function canRecognise(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function listenOnce(
  locale: string,
  onResult: (transcript: string) => void,
  onDone: () => void,
): (() => void) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognizer; webkitSpeechRecognition?: new () => Recognizer };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;

  const recognizer = new Ctor();
  recognizer.lang = locale;
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;
  recognizer.continuous = false;

  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    onDone();
  };

  recognizer.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript ?? "";
    onResult(transcript);
  };
  recognizer.onerror = done;
  recognizer.onend = done;

  try {
    recognizer.start();
  } catch {
    done();
    return null;
  }

  return () => {
    try {
      recognizer.stop();
    } catch {
      /* already stopped */
    }
    done();
  };
}

/** Loose comparison so a good attempt with a stray particle still counts. */
export function soundsClose(heard: string, target: string): boolean {
  const normalise = (value: string) =>
    value
      .toLowerCase()
      .replace(/[\s\p{P}\p{S}]/gu, "")
      .trim();
  const a = normalise(heard);
  const b = normalise(target);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const grams = (value: string) => {
    const set = new Set<string>();
    for (let i = 0; i < value.length - 1; i += 1) set.add(value.slice(i, i + 2));
    return set;
  };
  const ga = grams(a);
  const gb = grams(b);
  let overlap = 0;
  ga.forEach((gram) => {
    if (gb.has(gram)) overlap += 1;
  });
  return overlap / Math.max(1, Math.min(ga.size, gb.size)) >= 0.4;
}
