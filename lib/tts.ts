/**
 * Server-side speech synthesis.
 *
 * Provider order: Azure (native Thai + Japanese voice actors) → Google Cloud
 * TTS → ElevenLabs multilingual v2. With no key configured the route reports
 * `browser` and the client speaks with the best locale-matched local voice.
 */

export type VoiceProvider = "azure" | "google" | "elevenlabs" | "free";

type LanguageVoice = { azure: string; google: string };

const VOICES: Record<string, LanguageVoice> = {
  "th-TH": { azure: "th-TH-PremwadeeNeural", google: "th-TH-Neural2-C" },
  "ja-JP": { azure: "ja-JP-NanamiNeural", google: "ja-JP-Neural2-B" },
  "es-ES": { azure: "es-ES-ElviraNeural", google: "es-ES-Neural2-A" },
  "fr-FR": { azure: "fr-FR-DeniseNeural", google: "fr-FR-Neural2-A" },
};

function env(key: string): string {
  return (process.env[key] ?? "").trim();
}

export function activeProvider(): VoiceProvider | null {
  if (env("AZURE_SPEECH_KEY") && env("AZURE_SPEECH_REGION")) return "azure";
  if (env("GOOGLE_TTS_API_KEY")) return "google";
  if (env("ELEVENLABS_API_KEY")) return "elevenlabs";
  // Keyless native voices: real Thai / Japanese pronunciation from the first
  // click, so a fresh clone is never silent while keys are being set up.
  if (env("DISABLE_FREE_TTS") !== "1") return "free";
  return null;
}

export function providerLabel(provider: VoiceProvider | null): string {
  switch (provider) {
    case "azure":
      return "Azure neural (native speakers)";
    case "google":
      return "Google Cloud neural";
    case "elevenlabs":
      return "ElevenLabs multilingual";
    case "free":
      return "Native voice · no key";
    default:
      return "Browser voice";
  }
}

function voiceFor(locale: string): LanguageVoice {
  return VOICES[locale] ?? VOICES["th-TH"];
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Small in-isolate cache: lesson audio repeats constantly. */
const audioCache = new Map<string, Uint8Array>();
const CACHE_LIMIT = 40;

function remember(key: string, bytes: Uint8Array): Uint8Array {
  if (audioCache.size >= CACHE_LIMIT) {
    const oldest = audioCache.keys().next().value;
    if (oldest) audioCache.delete(oldest);
  }
  audioCache.set(key, bytes);
  return bytes;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function azure(text: string, locale: string, rate: number): Promise<Uint8Array> {
  const key = env("AZURE_SPEECH_KEY");
  const region = env("AZURE_SPEECH_REGION");
  const shortLang = locale.slice(0, 2).toUpperCase();
  const voice = env(`AZURE_VOICE_${shortLang}`) || voiceFor(locale).azure;
  const percent = Math.round((rate - 1) * 100);

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}"><voice name="${voice}"><prosody rate="${percent >= 0 ? "+" : ""}${percent}%">${escapeXml(text)}</prosody></voice></speak>`;

  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
      "User-Agent": "thinklingua",
    },
    body: ssml,
  });

  if (!response.ok) throw new Error(`azure ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function google(text: string, locale: string, rate: number): Promise<Uint8Array> {
  const key = env("GOOGLE_TTS_API_KEY");
  const shortLang = locale.slice(0, 2).toUpperCase();
  const voice = env(`GOOGLE_VOICE_${shortLang}`) || voiceFor(locale).google;

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: locale, name: voice },
      audioConfig: { audioEncoding: "MP3", speakingRate: Math.min(2, Math.max(0.5, rate)), pitch: 0 },
    }),
  });

  if (!response.ok) throw new Error(`google ${response.status}`);
  const payload = (await response.json()) as { audioContent?: string };
  if (!payload.audioContent) throw new Error("google empty");
  return base64ToBytes(payload.audioContent);
}

async function elevenlabs(text: string, locale: string): Promise<Uint8Array> {
  const key = env("ELEVENLABS_API_KEY");
  const shortLang = locale.slice(0, 2).toUpperCase();
  const voiceId = env(`ELEVENLABS_VOICE_${shortLang}`);
  if (!voiceId) throw new Error("elevenlabs voice id missing");

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true },
    }),
  });

  if (!response.ok) throw new Error(`elevenlabs ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Keyless native voices.
 *
 * Google's public speech endpoint returns genuine Thai and Japanese
 * pronunciation with no account, which is what makes a fresh clone audible on
 * the very first click. The endpoint caps query length, so long lines are
 * chunked and the MP3 frames concatenated. This is the last server option
 * before the device voice.
 */
async function free(text: string, locale: string, rate: number): Promise<Uint8Array> {
  const lang = locale.slice(0, 2);
  const speed = Math.min(1, Math.max(0.24, rate));
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += 180) chunks.push(text.slice(i, i + 180));

  const parts: Uint8Array[] = [];
  for (const chunk of chunks) {
    const url = new URL("https://translate.google.com/translate_tts");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("client", "tw-ob");
    url.searchParams.set("tl", lang);
    url.searchParams.set("ttsspeed", String(speed));
    url.searchParams.set("q", chunk);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`free tts ${response.status}`);
    parts.push(new Uint8Array(await response.arrayBuffer()));
  }

  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  if (total === 0) throw new Error("free tts empty");
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.byteLength;
  }
  return merged;
}

export async function synthesize(
  text: string,
  locale: string,
  rate: number,
): Promise<{ bytes: Uint8Array; provider: VoiceProvider }> {
  const provider = activeProvider();
  if (!provider) throw new Error("no provider");

  const key = `${provider}|${locale}|${rate.toFixed(2)}|${text}`;
  const cached = audioCache.get(key);
  if (cached) return { bytes: cached, provider };

  const bytes =
    provider === "azure"
      ? await azure(text, locale, rate)
      : provider === "google"
        ? await google(text, locale, rate)
        : provider === "elevenlabs"
          ? await elevenlabs(text, locale)
          : await free(text, locale, rate);

  if (bytes.byteLength === 0) throw new Error("empty audio");
  return { bytes: remember(key, bytes), provider };
}
