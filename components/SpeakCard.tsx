"use client";

import { useEffect, useRef, useState } from "react";
import { scorePronunciation, verdictCopy, SPEECH_PASS, type SpeechScore, type SpeechVerdict } from "@/lib/speechScore";
import { isEmbedded, requestMicrophone, startRecording, type MicCheck, type RecordedClip, type Recording } from "@/lib/mic";
import { canRecognise, listenOnce, stopSpeaking } from "@/lib/speech";
import { analyseAttempt, pitchSupported, referenceContour } from "@/lib/pitchClient";
import { toneFeedback, type SyllableTone } from "@/lib/thaiTones";
import { Icon, cn } from "./ui";
import { SpeakButton } from "./SpeakButton";

type Props = {
  text: string;
  latin: string;
  gloss: string;
  glyph: string;
  tone?: string;
  locale: string;
  rate: number;
  /** Set by the runner once the attempt has been recorded. */
  locked: boolean;
  onGraded: (pass: boolean, accuracy: number | null) => void;
};

type Phase = "idle" | "checking" | "listening" | "analysing" | "recording" | "recorded" | "scored" | "blocked";
type Contours = { user: number[] | null; reference: number[] | null };

function verdictFor(score: number): SpeechVerdict {
  return score >= 80 ? "clear" : score >= SPEECH_PASS ? "close" : "retry";
}

export function SpeakCard({ text, latin, gloss, glyph, tone, locale, rate, locked, onGraded }: Props) {
  const pitched = pitchSupported(locale);
  const [phase, setPhase] = useState<Phase>("idle");
  const [heard, setHeard] = useState("");
  const [words, setWords] = useState<SpeechScore | null>(null);
  const [melody, setMelody] = useState<number | null>(null);
  const [overall, setOverall] = useState<number | null>(null);
  const [contours, setContours] = useState<Contours | null>(null);
  const [tones, setTones] = useState<SyllableTone[]>([]);
  const [problem, setProblem] = useState<MicCheck | null>(null);
  const [embedded, setEmbedded] = useState(false);
  const [href, setHref] = useState("/");
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [canListen, setCanListen] = useState(true);

  const stopRef = useRef<null | (() => void)>(null);
  const recorderRef = useRef<Recording | null>(null);
  const clipUrlRef = useRef<string | null>(null);
  const settledRef = useRef(false);

  useEffect(() => {
    setEmbedded(isEmbedded());
    setCanListen(canRecognise());
    setHref(window.location.href);
    return () => {
      stopRef.current?.();
      recorderRef.current?.cancel();
      if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current);
    };
  }, []);

  // Warm the native contour so scoring is quick once the learner has spoken.
  useEffect(() => {
    if (!pitched) return;
    void referenceContour(text, locale);
  }, [text, locale, pitched]);

  function keepClip(url: string) {
    if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current);
    clipUrlRef.current = url;
    setClipUrl(url);
  }

  function clearClip() {
    if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current);
    clipUrlRef.current = null;
    setClipUrl(null);
  }

  async function takeClip(): Promise<RecordedClip | null> {
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (!recorder) return null;
    try {
      return await recorder.stop();
    } catch {
      return null;
    }
  }

  function fail(message: MicCheck) {
    settledRef.current = true;
    setProblem(message);
    setPhase("blocked");
  }

  async function finish(transcript: string) {
    if (settledRef.current) return;
    settledRef.current = true;

    const wordResult = scorePronunciation(transcript, text);
    setHeard(transcript);
    setWords(wordResult);
    setPhase("analysing");

    const clip = await takeClip();
    let melodyValue: number | null = null;
    let pair: Contours | null = null;
    let syllableResult: SyllableTone[] = [];

    if (clip && pitched) {
      keepClip(clip.url);
      const analysis = await analyseAttempt(clip.blob, text, locale);
      melodyValue = analysis.melody;
      pair = { user: analysis.user, reference: analysis.reference };
      syllableResult = analysis.syllables;
    }

    const combined =
      melodyValue === null ? wordResult.score : Math.round(wordResult.score * 0.6 + melodyValue * 0.4);

    setMelody(melodyValue);
    setContours(pair);
    setTones(syllableResult);
    setOverall(combined);
    setPhase("scored");
    onGraded(combined >= SPEECH_PASS, combined);
  }

  async function begin() {
    if (locked || phase === "checking" || phase === "listening" || phase === "analysing" || phase === "recording") return;
    stopSpeaking();
    settledRef.current = false;
    setProblem(null);
    setHeard("");
    setWords(null);
    setMelody(null);
    setOverall(null);
    setContours(null);
    setTones([]);
    clearClip();
    setPhase("checking");

    const mic = await requestMicrophone();
    if (!mic.ok) {
      fail(mic);
      return;
    }

    let recorder: Recording | null = null;
    if (pitched) {
      try {
        recorder = await startRecording();
      } catch {
        recorder = null;
      }
    }
    recorderRef.current = recorder;

    if (!canRecognise()) {
      setCanListen(false);
      if (!recorder) {
        fail({
          ok: false,
          problem: "unsupported",
          message: "This browser cannot listen to the microphone. Record the sentence in another app and compare, then mark it done.",
          embedded: mic.embedded,
        });
        return;
      }
      setPhase("recording");
      return;
    }

    setPhase("listening");
    stopRef.current = listenOnce(
      locale,
      (transcript) => {
        stopRef.current = null;
        void finish(transcript);
      },
      () => {
        if (!settledRef.current) setPhase("idle");
      },
      (code) => {
        if (settledRef.current) return;
        settledRef.current = true;
        recorderRef.current?.cancel();
        recorderRef.current = null;
        const denied = code === "not-allowed" || code === "service-not-allowed";
        setProblem({
          ok: false,
          problem: denied ? "denied" : code === "audio-capture" ? "no-device" : "unknown",
          message: denied
            ? "The browser blocked speech recognition. Allow the microphone for this site, then try again."
            : code === "network"
              ? "Speech recognition needs a network connection. Check your connection, or open the app in Chrome or Edge."
              : "The microphone opened but the recogniser stopped. Try again, a little closer to the mic.",
          embedded: mic.embedded,
        });
        setPhase("blocked");
      },
    );
  }

  async function stopListening() {
    stopRef.current?.();
    stopRef.current = null;
    if (!settledRef.current) {
      recorderRef.current?.cancel();
      recorderRef.current = null;
      setPhase("idle");
    }
  }

  async function stopRecording() {
    const clip = await takeClip();
    if (!clip) {
      setPhase("recorded");
      return;
    }
    keepClip(clip.url);
    setPhase("analysing");

    let value: number | null = null;
    let pair: Contours | null = null;
    let syllableResult: SyllableTone[] = [];
    if (pitched) {
      const analysis = await analyseAttempt(clip.blob, text, locale);
      value = analysis.melody;
      pair = { user: analysis.user, reference: analysis.reference };
      syllableResult = analysis.syllables;
    }

    setMelody(value);
    setOverall(value);
    setContours(pair);
    setTones(syllableResult);
    setPhase("recorded");
  }

  function acceptRecording() {
    if (settledRef.current) return;
    settledRef.current = true;
    setPhase("scored");
    onGraded(overall === null ? true : overall >= SPEECH_PASS, overall);
  }

  const done = phase === "scored";
  const shownScore = overall ?? words?.score ?? null;
  const passed = shownScore !== null && shownScore >= SPEECH_PASS;
  const feedback = toneFeedback(tones);

  return (
    <div className="anim-slide">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold leading-snug">Say it out loud.</h2>
          <p className="mt-1 text-xs text-muted">
            The app listens, compares it with the native line, and scores the attempt.
            {pitched ? " Thai attempts are also scored on their pitch contour." : ""}
          </p>
        </div>
        <span className="pill shrink-0">speaking</span>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <span className="text-5xl">{glyph}</span>
        <p className={cn("text-3xl font-semibold", locale.startsWith("th") ? "script-th" : locale.startsWith("ja") ? "script-ja" : "")}>
          {text}
        </p>
        <p className="text-[11px] uppercase tracking-wide text-muted">
          {latin}
          {tone ? ` · ${tone}` : ""}
        </p>
        <SpeakButton text={text} locale={locale} rate={rate} size="lg" />
        <p className="text-xs text-muted">{gloss}</p>
      </div>

      {embedded && (
        <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/10 p-3 text-xs text-gold">
          This page is inside a preview panel, and panels are usually not allowed to use the microphone.{" "}
          <a href={href} target="_blank" rel="noreferrer" className="font-semibold underline">
            Open it in its own tab
          </a>{" "}
          and the drill will work.
        </div>
      )}

      {problem && (
        <div className="mt-5 rounded-2xl border border-sakura/35 bg-sakura/10 p-4 text-sm text-cream/90">
          <p className="font-semibold text-sakura">Microphone problem</p>
          <p className="mt-1 text-xs leading-relaxed text-cream/80">{problem.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {problem.embedded && (
              <a href={href} target="_blank" rel="noreferrer" className="btn btn-ghost px-4 py-2 text-xs">
                Open in a new tab
                <Icon name="arrow" className="h-3.5 w-3.5" />
              </a>
            )}
            <button type="button" onClick={acceptRecording} className="btn btn-ghost px-4 py-2 text-xs">
              Can&apos;t use the mic? Mark it practised
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        {phase === "listening" ? (
          <button type="button" onClick={stopListening} className="btn btn-ghost-danger px-5 py-3">
            <span className="soundbar" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </span>
            Listening… tap to stop
          </button>
        ) : phase === "analysing" ? (
          <button type="button" disabled className="btn btn-ghost px-5 py-3">
            <span className="soundbar" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </span>
            {pitched ? "Measuring the tone contour…" : "Scoring…"}
          </button>
        ) : phase === "recording" ? (
          <button type="button" onClick={stopRecording} className="btn btn-ghost-danger px-5 py-3">
            <Icon name="mic" className="h-4 w-4" />
            Recording… tap to stop
          </button>
        ) : phase === "recorded" ? (
          <div className="w-full rounded-2xl border border-line/70 bg-panel/60 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted">Your recording</p>
            {clipUrl ? (
              <audio controls src={clipUrl} className="mx-auto mt-2 w-full max-w-sm" />
            ) : (
              <p className="mt-2 text-xs text-muted">Nothing was captured. Try again, a little closer to the mic.</p>
            )}
            {melody !== null ? (
              <p className="mt-2 text-sm text-jade">
                Tone contour {melody}%
                <span className="block text-[11px] text-muted">Pitch only — this browser has no speech recogniser, so no words were scored.</span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted">
                This browser has no speech recogniser, so compare your take with the native voice by ear. No score is invented for you.
              </p>
            )}
            {tones.length > 1 && feedback.headline && (
              <p className="mt-1 text-[11px] leading-relaxed text-cream/80">
                {feedback.headline}
                {feedback.detail ? ` ${feedback.detail}` : ""}
              </p>
            )}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={begin} className="btn btn-ghost px-5 py-2.5 text-sm">
                Try again
              </button>
              <button type="button" onClick={acceptRecording} className="btn btn-primary px-5 py-2.5 text-sm">
                {melody !== null ? "Continue" : "I said it"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={begin}
            disabled={locked || phase === "checking"}
            className={cn("btn px-5 py-3", done ? "btn-ghost" : "btn-primary")}
          >
            <Icon name="mic" className="h-4 w-4" />
            {phase === "checking" ? "Checking microphone…" : done ? "Try again" : "Speak"}
          </button>
        )}

        {phase === "checking" && (
          <p className="text-center text-[11px] text-muted">
            Your browser may be asking for permission — choose Allow. If no prompt appears, check the microphone icon next to the
            address.
          </p>
        )}

        {!canListen && phase === "idle" && (
          <p className="text-center text-[11px] text-muted">
            No speech recogniser in this browser — you can still record and compare by ear.
          </p>
        )}
      </div>

      {done && (
        <div
          className={cn(
            "mt-5 rounded-2xl border p-4",
            passed ? "border-jade/35 bg-jade/[0.08]" : "border-gold/35 bg-gold/[0.08]",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">{words ? "Overall" : melody !== null ? "Tone contour" : "Attempt"}</p>
            <p className={cn("font-display text-2xl", passed ? "text-jade" : "text-gold")}>
              {shownScore !== null ? `${shownScore}%` : "recorded"}
            </p>
          </div>

          {shownScore !== null && <p className="mt-1 text-sm text-cream/85">{verdictCopy(verdictFor(shownScore))}</p>}

          {words && (
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted">Words recognised</span>
              <span className="text-cream/85">{words.score}%</span>
            </div>
          )}

          {pitched && (
            <div className="mt-3 rounded-xl border border-line/60 bg-ink/30 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted">
                  <Icon name="chart" className="h-3.5 w-3.5" />
                  Tone contour
                </span>
                <span className={melody !== null && melody >= SPEECH_PASS ? "text-jade" : "text-gold"}>
                  {melody !== null ? `${melody}%` : "not measured"}
                </span>
              </div>
              {contours?.user && contours?.reference && <MelodyGraph user={contours.user} reference={contours.reference} />}
              {tones.length > 1 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {tones.map((tone) => (
                    <span
                      key={`${tone.ordinal}:${tone.text}`}
                      title={`Syllable ${tone.ordinal} · ${tone.score}% tone match`}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px]",
                        tone.score >= 70
                          ? "border-jade/35 bg-jade/10 text-jade"
                          : tone.score >= 45
                            ? "border-gold/35 bg-gold/10 text-gold"
                            : "border-sakura/40 bg-sakura/10 text-sakura",
                      )}
                    >
                      {tone.label}
                    </span>
                  ))}
                </div>
              )}
              {feedback.headline && (
                <p className="mt-2 text-[11px] leading-relaxed text-cream/85">
                  {feedback.headline}
                  {feedback.detail ? ` ${feedback.detail}` : ""}
                </p>
              )}
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {melody !== null
                  ? tones.length > 1
                    ? "Gold is your line, green is the native voice. The chips follow the syllables in order."
                    : "Your pitch line (gold) against the native line (green). Shape matters, not how high or low your voice sits."
                  : "Not enough voice to measure a contour. Hold the vowel a little longer, a touch louder, and try again."}
              </p>
            </div>
          )}

          {heard && (
            <p className="mt-2 text-xs text-muted">
              Recogniser heard: <span className="text-cream/80">{heard}</span>
            </p>
          )}
          {words && words.missed.length > 0 && (
            <p className="mt-1 text-xs text-muted">
              Missed: <span className="text-sakura">{words.missed.join(" ")}</span>
            </p>
          )}

          {clipUrl && <audio controls src={clipUrl} className="mt-3 w-full" />}
        </div>
      )}
    </div>
  );
}

export function MelodyGraph({ user, reference }: { user: number[]; reference: number[] }) {
  const width = 260;
  const height = 64;
  const pad = 6;
  const values = [...user, ...reference];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1.5, max - min);

  const line = (points: number[]) =>
    points
      .map((value, index) => {
        const x = pad + (index / Math.max(1, points.length - 1)) * (width - pad * 2);
        const y = height - pad - ((value - min) / range) * (height - pad * 2);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 w-full" role="img" aria-label="Pitch contour: native voice and your attempt">
        <path d={line(reference)} fill="none" stroke="rgba(61,224,174,0.65)" strokeWidth="2.4" strokeLinecap="round" />
        <path d={line(user)} fill="none" stroke="rgba(255,198,92,0.95)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <div className="mt-1 flex items-center gap-3 text-[10px] text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-4 rounded-full bg-jade/60" /> native
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-4 rounded-full bg-gold" /> you
        </span>
      </div>
    </div>
  );
}
