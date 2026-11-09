"use client";

import { useEffect, useState } from "react";
import { MelodyGraph } from "@/components/SpeakCard";
import { cn } from "@/components/ui";
import { analyseAttempt, type SpeakAnalysis } from "@/lib/pitchClient";
import { splitThaiSyllables, toneFeedback } from "@/lib/thaiTones";

const DEFAULT_TEXT = "ราคา";

/**
 * Two committed fixtures cover both feedback outcomes: the native line must
 * hold every syllable, and a deliberately flat take must name the second.
 */
const FIXTURES = [
  {
    name: "native line",
    file: "th-raakhaa-native.mp3",
    url: "/fixtures/th-raakhaa-native.mp3",
    type: "audio/mpeg",
    text: "ราคา",
    expected: "no syllable named",
    ordinal: null,
  },
  {
    name: "flat 220 Hz",
    file: "th-raakhaa-flat.wav",
    url: "/fixtures/th-raakhaa-flat.wav",
    type: "audio/wav",
    text: "ราคา",
    expected: "Syllable 2 · คา",
    ordinal: 2,
    label: "คา",
  },
] as const;

type FixtureCheck = { file: string; name: string; ok: boolean; message: string };

function chipTone(score: number): string {
  if (score >= 70) return "border-jade/35 bg-jade/10 text-jade";
  if (score >= 45) return "border-gold/35 bg-gold/10 text-gold";
  return "border-sakura/40 bg-sakura/10 text-sakura";
}

/**
 * Feeds a WAV through the same `analyseAttempt` the speaking drill uses, then
 * shows the full analysis: melody score, every syllable, and the syllable the
 * feedback would name. No microphone and no speech recognition are involved.
 */
export function ToneHarness() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<"file" | "native" | "fixture" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpeakAnalysis | null>(null);
  const [source, setSource] = useState("");
  const [checks, setChecks] = useState<FixtureCheck[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // The Playwright check waits for this before clicking: the button is server
  // rendered, so a click can otherwise land before React attaches its handler.
  useEffect(() => setHydrated(true), []);

  const phrase = text.trim();
  const pieces = phrase ? splitThaiSyllables(phrase) : [];
  const feedback = result ? toneFeedback(result.syllables) : null;

  async function analyse(blob: Blob, line: string): Promise<SpeakAnalysis | null> {
    const analysis = await analyseAttempt(blob, line, "th-TH");
    if (analysis.melody === null || !analysis.user || !analysis.reference) {
      setError(
        "The clip decoded, but no usable contour came out. Use at least half a second of clear voice, and make sure /api/tts can synthesize the line.",
      );
      return null;
    }
    setResult(analysis);
    return analysis;
  }

  async function scoreFile() {
    if (!file) {
      setError("Choose a WAV file first.");
      return;
    }
    if (!phrase) {
      setError("Type the Thai line to compare the WAV against.");
      return;
    }
    setBusy("file");
    setError(null);
    setResult(null);
    setChecks([]);
    setSource(file.name);
    try {
      await analyse(file, phrase);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not analyse that file.");
    } finally {
      setBusy(null);
    }
  }

  async function scoreNative() {
    if (!phrase) {
      setError("Type the Thai line to synthesize.");
      return;
    }
    setBusy("native");
    setError(null);
    setResult(null);
    setChecks([]);
    setSource("native TTS line");
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: phrase, lang: "th-TH", rate: 1 }),
      });
      if (!response.ok) throw new Error(`The voice API answered ${response.status}.`);
      await analyse(await response.blob(), phrase);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not fetch the native line.");
    } finally {
      setBusy(null);
    }
  }

  async function runFixtures() {
    setBusy("fixture");
    setError(null);
    setResult(null);
    setChecks([]);
    setText(FIXTURES[0].text);
    const outcomes: FixtureCheck[] = [];
    try {
      for (const fixture of FIXTURES) {
        setError(null);
        setSource(fixture.file);
        try {
          const response = await fetch(fixture.url, { cache: "no-store" });
          if (!response.ok) throw new Error(`Fixture answered ${response.status}.`);
          const blob = await response.blob();
          setFile(new File([blob], fixture.file, { type: fixture.type }));
          const analysis = await analyse(blob, fixture.text);
          if (!analysis) {
            outcomes.push({
              file: fixture.file,
              name: fixture.name,
              ok: false,
              message: "No usable contour came out.",
            });
            setChecks([...outcomes]);
            continue;
          }
          const worst = toneFeedback(analysis.syllables).worst;
          const structureOk = analysis.syllables.length === 2;
          const pass =
            structureOk &&
            (fixture.ordinal === null
              ? worst === null
              : worst !== null && worst.ordinal === fixture.ordinal && worst.label === fixture.label);
          const actual = !structureOk
            ? `${analysis.syllables.length} syllables parsed`
            : worst
              ? `Syllable ${worst.ordinal} · ${worst.label}`
              : "no syllable named";
          outcomes.push({
            file: fixture.file,
            name: fixture.name,
            ok: pass,
            message: `Expected ${fixture.expected}; got ${actual} (${analysis.melody}% melody).`,
          });
          setChecks([...outcomes]);
        } catch (issue) {
          outcomes.push({
            file: fixture.file,
            name: fixture.name,
            ok: false,
            message: issue instanceof Error ? issue.message : "Could not run this fixture.",
          });
          setChecks([...outcomes]);
        }
      }
    } finally {
      setBusy(null);
    }
  }

  const disabled = busy !== null;
  const checksComplete = checks.length === FIXTURES.length;
  const allChecksPassed = checksComplete && checks.every((entry) => entry.ok);

  return (
    <div className="mx-auto w-full max-w-3xl" data-tone-hydrated={hydrated ? "true" : "false"}>
      <a href="/learn" className="text-xs text-muted underline">
        Back to learn
      </a>
      <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-gold">Development only</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">Tone harness</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Runs a WAV through the same browser pipeline as the Thai speaking drill: decode, F0 extraction, DTW against the
        native line, then per-syllable scoring. No microphone or speech recognition is involved. This route is 404 in
        production.
      </p>

      <div className="mt-6 rounded-2xl border border-line/70 bg-panel/60 p-4">
        <label className="block text-[11px] uppercase tracking-wide text-muted" htmlFor="tone-text">
          Thai line
        </label>
        <input
          id="tone-text"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setResult(null);
            setError(null);
            setChecks([]);
          }}
          className="script-th mt-1 w-full rounded-xl border border-line/70 bg-ink/40 px-3 py-2 text-xl text-cream outline-none focus:border-jade/60"
          placeholder="ราคา"
        />
        <p className="mt-1 text-[11px] text-muted">
          {pieces.length > 0
            ? `Syllables: ${pieces.map((syllable) => syllable.label).join(" · ")}`
            : "Only Thai script can be split into syllables."}
        </p>

        <label className="mt-4 block text-[11px] uppercase tracking-wide text-muted" htmlFor="tone-file">
          WAV recording
        </label>
        <input
          id="tone-file"
          type="file"
          accept=".wav,audio/wav,audio/x-wav,audio/*"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setResult(null);
            setError(null);
            setChecks([]);
          }}
          className="mt-1 block w-full cursor-pointer rounded-xl border border-line/70 bg-ink/40 px-3 py-2 text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-panel file:px-3 file:py-1.5 file:text-xs file:text-cream"
        />
        <p className="mt-1 text-[11px] text-muted">
          {file ? `${file.name} · ${Math.round(file.size / 1024)} KB` : "Any audio the browser can decode; WAV is expected."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={runFixtures} disabled={disabled} className="btn btn-primary px-4 py-2 text-sm">
            {busy === "fixture" ? "Running checks…" : "Run both fixture checks"}
          </button>
          <button type="button" onClick={scoreFile} disabled={!file || disabled} className="btn btn-ghost px-4 py-2 text-sm">
            {busy === "file" ? "Analysing…" : "Analyse WAV"}
          </button>
          <button type="button" onClick={scoreNative} disabled={!phrase || disabled} className="btn btn-ghost px-4 py-2 text-sm">
            {busy === "native" ? "Synthesizing…" : "Score native line against itself"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Fixtures: the native line for <span className="script-th">ราคา</span> (expects no syllable named) and a flat
          220 Hz take (expects syllable 2, <span className="script-th">คา</span>).
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-sakura/35 bg-sakura/10 p-4 text-sm text-cream/90">
          <p className="font-semibold text-sakura">Could not score that clip</p>
          <p className="mt-1 text-xs leading-relaxed text-cream/80">{error}</p>
        </div>
      )}

      {checks.length > 0 && (
        <div
          role="status"
          className={cn(
            "mt-4 rounded-2xl border p-4",
            !checksComplete
              ? "border-line/70 bg-panel/60"
              : allChecksPassed
                ? "border-jade/35 bg-jade/10"
                : "border-sakura/35 bg-sakura/10",
          )}
        >
          <p
            className={cn(
              "text-sm font-semibold",
              !checksComplete ? "text-cream/80" : allChecksPassed ? "text-jade" : "text-sakura",
            )}
          >
            {!checksComplete ? "Running fixture checks…" : allChecksPassed ? "Fixture checks passed" : "Fixture check failed"}
          </p>
          <ul className="mt-2 space-y-1.5">
            {checks.map((entry) => (
              <li key={entry.file} className="flex gap-2 text-xs leading-relaxed">
                <span className={cn("shrink-0 font-semibold", entry.ok ? "text-jade" : "text-sakura")}>
                  {entry.ok ? "PASS" : "FAIL"}
                </span>
                <span className="text-cream/80">
                  <span className="text-cream">{entry.name}</span> — {entry.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <section className="mt-6 rounded-2xl border border-line/70 bg-panel/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">Melody vs native</p>
              <p className="font-display text-3xl text-jade">{result.melody}%</p>
            </div>
            <p className="max-w-[16rem] text-right text-[11px] text-muted">Source: {source}</p>
          </div>

          {result.syllables.length === 0 ? (
            <p className="mt-4 text-xs text-muted">No syllables parsed from that line. Use Thai script.</p>
          ) : feedback?.worst ? (
            <div className="mt-4 rounded-xl border border-gold/30 bg-gold/[0.07] p-3">
              <p className="text-sm font-semibold text-gold">{feedback.headline}</p>
              {feedback.detail && <p className="mt-1 text-xs leading-relaxed text-cream/80">{feedback.detail}</p>}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-jade/30 bg-jade/[0.07] p-3">
              <p className="text-sm font-semibold text-jade">
                {feedback?.headline ?? "One syllable — there is no other syllable to single out."}
              </p>
            </div>
          )}

          {result.syllables.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.syllables.map((syllable) => (
                <span
                  key={syllable.ordinal}
                  title={`${syllable.score}% · ${syllable.deviation.toFixed(2)} st`}
                  className={cn("rounded-full border px-2 py-0.5 text-[11px]", chipTone(syllable.score))}
                >
                  {syllable.label}
                </span>
              ))}
            </div>
          )}

          {result.user && result.reference && <MelodyGraph user={result.user} reference={result.reference} />}

          {result.syllables.length > 0 && (
            <table className="mt-4 w-full text-left text-xs">
              <thead>
                <tr className="text-muted">
                  <th className="pb-1 font-normal">Syllable</th>
                  <th className="pb-1 font-normal">Score</th>
                  <th className="pb-1 font-normal">Gap</th>
                  <th className="pb-1 font-normal">Native</th>
                  <th className="pb-1 font-normal">You</th>
                </tr>
              </thead>
              <tbody>
                {result.syllables.map((syllable) => (
                  <tr key={syllable.ordinal} className="border-t border-line/40">
                    <td className="py-1.5 pr-2 text-cream">
                      {syllable.ordinal}. {syllable.label}
                    </td>
                    <td
                      className={cn(
                        "py-1.5 pr-2",
                        syllable.score >= 70 ? "text-jade" : syllable.score >= 45 ? "text-gold" : "text-sakura",
                      )}
                    >
                      {syllable.score}%
                    </td>
                    <td className="py-1.5 pr-2 text-muted">{syllable.deviation.toFixed(2)} st</td>
                    <td className="py-1.5 pr-2 text-muted">{syllable.nativeShape}</td>
                    <td className="py-1.5 text-muted">{syllable.userShape}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-muted">Raw analysis</summary>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-ink/60 p-3 text-[10px] text-cream/70">
              {JSON.stringify(result.syllables, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}
