# ThinkLingua

**Learn Thai and Japanese by thinking in them — not by translating through English.**

ThinkLingua is a language-learning app built on one rule: meaning never passes through your native language. Words arrive as a
picture plus a native voice; grammar arrives as sentence shapes you assemble; the English gloss sits behind a deliberate "peek"
that costs you your no-English multiplier.

Thai and Japanese are the flagship courses, with Spanish and French running on the same engine.

---

## The method

| Step | What happens | Why |
| --- | --- | --- |
| **Picture it** | Every new word is bound to an emoji/scene anchor and a native recording before any text appears. | A word attached to a concept is retrieved directly; a word attached to an English translation has to be routed twice. |
| **Hear it** | Audio-first exercises, plus minimal-pair drills for Thai tones and Japanese mora timing. | Accent is a listening skill first. You cannot produce a contrast you cannot hear. |
| **Build it** | Sentences are assembled from tiles in the target script — particles and classifiers included. | Grammar becomes shape and rhythm rather than a rule you recite. |
| **Think it** | Picture-only prompts ask for the sentence directly; audio-only prompts remove the written crutch. | This is the drill that removes the translation step entirely. |

Two mechanics keep the method honest:

- **Peek** — the English meaning is always one tap away, but using it marks the lesson and resets the monolingual streak.
- **No-English multiplier** — XP grows with every consecutive lesson finished without a peek (up to ×1.5).

## Features

- **Gamified progression** — XP, levels, target-language rank names, daily streak, focus hearts that regenerate over time, daily
  quests, 12 achievements, unit checkpoints, and a 28-day activity map.
- **Three lesson tracks per course** — **Words** (picture multiple choice), **Speaking** (you say the word or sentence and the
  app scores the attempt against the native line) and **Reading** (Thai letters and Japanese hiragana, taught as sounds with real
  example words). Pick the track on the course map; progress is tracked separately for each.
- **Tone contour scoring on Thai** — speaking drills record the attempt alongside speech recognition, extract the pitch of your
  voice, and compare its shape with the pitch of the native voice. Transcript and melody are weighted 60/40, and the two lines are
  drawn over each other so you can see the tone bend the wrong way. The line is split across the phrase's syllables, so the result
  names the syllable whose tone drifted instead of scoring the whole phrase as one lump.
- **AI conversation partner** — a persona per language that speaks only the target language, keeps turns to two sentences, asks
  one question, and **recasts** mistakes instead of grading them. Reply audio uses the same native voice.
- **Native voices, no setup** — every word is audible on a fresh clone through a keyless native-voice fallback; add an Azure key
  for the studio neural voices (`th-TH-PremwadeeNeural`, `ja-JP-NanamiNeural`), with Google Cloud TTS and ElevenLabs as
  alternatives and a locale-filtered device voice as the last resort.
- **Four courses** — Thai, Japanese, Spanish, French, all generated from the same exercise engine.
- **Local-first** — progress is stored in the browser. No account, no server database.

## Quickstart

```bash
bun install        # or npm install / pnpm install
bun run dev        # http://localhost:3000
```

The app is fully playable with **no keys at all**: lessons, drills, gamification and spaced repetition all work, and speech uses a
keyless native-voice service, so Thai is pronounced by a Thai voice and Japanese by a Japanese one from the first click. If that
service is unreachable it falls back to the best voice installed on the device. Set `DISABLE_FREE_TTS=1` to opt out.

To enable the good stuff, copy the example env file and fill in what you have:

```bash
cp .env.example .env.local
```

### 1. Native voices (the important one)

The accent requirement is met by routing each language to a **native neural voice**, not by making a general-purpose voice read
foreign text.

**Azure Speech — recommended**

1. Create an Azure AI Services / Speech resource.
2. Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` (for example `southeastasia`).
3. Defaults: `th-TH-PremwadeeNeural` (Thai) and `ja-JP-NanamiNeural` (Japanese). Override per language with
   `AZURE_VOICE_TH`, `AZURE_VOICE_JA`, `AZURE_VOICE_ES`, `AZURE_VOICE_FR`.

**Google Cloud TTS** — set `GOOGLE_TTS_API_KEY`. Defaults are `th-TH-Neural2-C` and `ja-JP-Neural2-B`.

**ElevenLabs** — set `ELEVENLABS_API_KEY` plus a voice id per language (`ELEVENLABS_VOICE_TH`, `ELEVENLABS_VOICE_JA`, …). Uses
`eleven_multilingual_v2`.

Providers are tried in the order Azure → Google → ElevenLabs. `GET /api/tts/status` reports which one is live, and the UI shows it
in the sidebar and on the settings page. With none configured, audio comes from `speechSynthesis` with a locale match and a
preference for Premium/Enhanced/Neural/Siri/Google voices — much better than the default, still not a native actor.

### 2. Microphone

Speaking drills use the microphone. Browsers refuse it to a page embedded inside another page, so if the app is running inside a
preview panel, open it in its own tab first — the drill detects this and gives you the link instead of an opaque "allow media
access" prompt. When permission is denied, unsupported or the device is missing, the drill names the exact problem. If the browser
has no speech recogniser, it records your attempt so you can compare it with the native voice by ear rather than inventing a score.

Thai speaking drills also grade tone. The app derives a 24-point pitch contour from your recording (`lib/pitch.ts`, YIN with
parabolic interpolation) and from the native TTS line, normalises both to semitones around their own median — so a low voice and a
high voice are compared by shape, not by absolute pitch — aligns them with DTW, and turns the distance into a 0–100 melody score.
The final Thai score is 60% words and 40% melody, and the result card draws the native contour (jade) over yours (gold). The line
is also divided between the phrase's syllables — by written vowel and spoken length — and each syllable gets its own chip and
score. When one syllable is clearly further off than the rest, the result names it ("Syllable 2 · คา is the one to fix") and says
whether the native line rises, falls or holds level there. If the recording is too quiet or too short to measure, the drill says so
and falls back to the transcript score instead of guessing.

### Checking tone feedback without a microphone

In development, open `/dev/tone` to run a WAV through the same browser pipeline as the speaking drill: decode, F0
extraction, DTW against `/api/tts`, per-syllable scoring and the named worst syllable. Upload a recording, or press
**Score native line against itself** for a zero-setup check (it should report 100% and every syllable holding). The route
returns 404 in production builds.

### 3. AI partner

`OPENAI_API_KEY` plus `AI_BASE_URL` (any OpenAI-compatible chat-completions endpoint; the Freebuff API default is
`https://freebuff.com/api/v1/paid`). `TUTOR_MODEL` defaults to `gpt-4o-mini`.

Create a Freebuff key at **Desktop → Account → Developer API**. The key is read server-side only, in `app/api/tutor/route.ts`.
Never put it in the browser.

Without a key, the tutor screen shows a setup card; the rest of the app keeps working.

## Project layout

```
app/
  page.tsx                  landing page + live voice demo
  dev/tone                  development-only WAV harness for tone feedback
  (app)/learn               course picker, unit map, lesson player
  (app)/review              spaced-repetition session
  (app)/tutor               streaming AI conversation partner
  (app)/progress            XP, streak, quests, achievements
  (app)/settings            voice engine, speech rate, romanisation, reset
  api/tts                   native-voice synthesis
  api/tutor                 streaming tutor with the monolingual system prompt
components/                 shell, lesson engine, chat, dashboards
lib/
  content/                  the four courses (lexemes, phrases, ear drills)
  content/reading.ts        Thai letters, hiragana and phonics lessons
  exercises.ts              deterministic exercise generation, all three tracks
  progress.ts               store, SRS, streaks, hearts, quests, achievements
  speech.ts                 playback, browser fallback, speech recognition
  speechScore.ts            pronunciation scoring and verdict copy
  thaiTones.ts              Thai syllable split, per-syllable tone scoring and feedback copy
  mic.ts                    microphone permission, problems, recording fallback
  tts.ts                    server voice providers
  tutor.ts                  system prompt and starters
```

## Adding or editing content

Everything lives in `lib/content/<language>.ts`.

```ts
L("th.plaa", "🐟", "ปลา", "plaa", "fish");       // glyph, script, romanisation, hidden gloss
```

- `L(...)` defines a **lexeme**: the concept anchor (`glyph`), target form (`text`), romanisation, and the hidden English gloss.
- `P(...)` defines a **phrase**, pre-tokenised into `tiles` (the correct order) with `extraTiles` as plausible wrong tiles. Tiles
  must be in the target script.
- Units list lessons; each lesson names the `newLexemes` it introduces, the `phrases` it practises, and two to four `ear` drills
  (minimal pairs).
- Checkpoint lessons use `kind: "checkpoint"` with `newLexemes: []` and review the whole unit.

The exercise engine (`lib/exercises.ts`) derives a 12–18 drill lesson from that content deterministically — option order is hashed
from the exercise key, so a lesson looks the same on every device.

## Deploy

The app is plain Next.js App Router with two route handlers, so any Node host works (Vercel, Fly, a container). Set the same
environment variables in the host's secret store — never in the repo. `OPENAI_API_KEY`, `AZURE_SPEECH_KEY` and the other voice
keys are read only on the server.

If you deploy to an edge/Workers runtime, confirm that `app/api/tts/route.ts` and `app/api/tutor/route.ts` work under that
runtime's `fetch` semantics; the handlers use `fetch`, `Blob` and `ReadableStream` only.

## Design notes

- **No translation button.** The only English is the opt-in peek, and it is instrumented — `progress.stats.peeks` is shown on the
  progress page.
- **Rank names are target-language.** Level titles cycle through `มือใหม่`, `ผู้เรียน`, … / `見習い`, `学習者`, … so even the
  reward system keeps you inside the language.
- **Hearts never block.** Running out of focus is a nudge toward review, not a paywall.
- **Every drill is answerable with the keyboard.** `Enter` checks and continues.

## Roadmap

- Recorded human audio per phrase, layered over the neural default.
- The five Thai tone names (mid, low, falling, high, rising) on each syllable chip; the chips report contour shape today because
  the lexemes carry no tone metadata.
- Account sync (the store is already isolated behind `lib/progress.ts`).
- Kana stroke order and Thai handwriting practice inside the reading track.

## Licence

MIT.
