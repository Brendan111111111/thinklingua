"use client";

import { useEffect, useRef, useState } from "react";
import { scorePronunciation, verdictCopy, SPEECH_PASS, type SpeechScore } from "@/lib/speechScore";
import { isEmbedded, requestMicrophone, startRecording, type MicCheck, type Recording } from "@/lib/mic";
import { canRecognise, listenOnce, stopSpeaking } from "@/lib/speech";
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

type Phase = "idle" | "checking" | "listening" | "recording" | "recorded" | "scored" | "blocked";

export function SpeakCard({ text, latin, gloss, glyph, tone, locale, rate, locked, onGraded }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [heard, setHeard] = useState("");
  const [score, setScore] = useState<SpeechScore | null>(null);
  const [problem, setProblem] = useState<MicCheck | null>(null);
  const [embedded, setEmbedded] = useState(false);
  const [href, setHref] = useState("/");
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [canListen, setCanListen] = useState(true);

  const stopRef = useRef<null | (() => void)>(null);
  const recorderRef = useRef<Recording | null>(null);
  const settledRef = useRef(false);

  useEffect(() => {
    setEmbedded(isEmbedded());
    setCanListen(canRecognise());
    setHref(window.location.href);
    return () => {
      stopRef.current?.();
      recorderRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  function finish(transcript: string) {
    if (settledRef.current) return;
    settledRef.current = true;
    const result = scorePronunciation(transcript, text);
    setHeard(transcript);
    setScore(result);
    setPhase("scored");
    onGraded(result.score >= SPEECH_PASS, result.score);
  }

  function fail(message: MicCheck) {
    settledRef.current = true;
    setProblem(message);
    setPhase("blocked");
  }

  async function begin() {
    if (locked || phase === "checking" || phase === "listening") return;
    stopSpeaking();
    settledRef.current = false;
    setProblem(null);
    setHeard("");
    setScore(null);
    setRecordingUrl(null);
    setPhase("checking");

    const mic = await requestMicrophone();
    if (!mic.ok) {
      fail(mic);
      return;
    }

    if (!canRecognise()) {
      setCanListen(false);
      const recorder = await startRecording();
      if (!recorder) {
        fail({
          ok: false,
          problem: "unsupported",
          message: "This browser cannot listen to the microphone. Record the sentence in another app and compare, then mark it done.",
          embedded: mic.embedded,
        });
        return;
      }
      recorderRef.current = recorder;
      setPhase("recording");
      return;
    }

    setPhase("listening");
    stopRef.current = listenOnce(
      locale,
      (transcript) => {
        stopRef.current = null;
        finish(transcript);
      },
      () => {
        if (!settledRef.current) setPhase("idle");
      },
      (code) => {
        if (settledRef.current) return;
        settledRef.current = true;
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
    if (!settledRef.current) setPhase("idle");
  }

  async function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    const url = await recorder.stop();
    recorderRef.current = null;
    setRecordingUrl(url);
    setPhase("recorded");
  }

  function acceptRecording() {
    if (settledRef.current) return;
    settledRef.current = true;
    setScore(null);
    setPhase("scored");
    onGraded(true, null);
  }

  const done = phase === "scored";

  return (
    <div className="anim-slide">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold leading-snug">Say it out loud.</h2>
          <p className="mt-1 text-xs text-muted">The app listens, compares it with the native line, and scores the attempt.</p>
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
        ) : phase === "recording" ? (
          <button type="button" onClick={stopRecording} className="btn btn-ghost-danger px-5 py-3">
            <Icon name="mic" className="h-4 w-4" />
            Recording… tap to stop
          </button>
        ) : phase === "recorded" ? (
          <div className="w-full rounded-2xl border border-line/70 bg-panel/60 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted">Your recording</p>
            {recordingUrl ? (
              <audio controls src={recordingUrl} className="mx-auto mt-2 w-full max-w-sm" />
            ) : (
              <p className="mt-2 text-xs text-muted">Nothing was captured. Try again, a little closer to the mic.</p>
            )}
            <p className="mt-2 text-xs text-muted">
              This browser has no speech recogniser, so compare your take with the native voice by ear. No score is invented for you.
            </p>
            <button type="button" onClick={acceptRecording} className="btn btn-primary mt-3 px-5 py-2.5 text-sm">
              I said it
            </button>
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
            score && score.score >= SPEECH_PASS ? "border-jade/35 bg-jade/[0.08]" : "border-gold/35 bg-gold/[0.08]",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">Pronunciation</p>
            <p className={cn("font-display text-2xl", score && score.score >= SPEECH_PASS ? "text-jade" : "text-gold")}>
              {score ? `${score.score}%` : "recorded"}
            </p>
          </div>
          {score ? (
            <>
              <p className="mt-1 text-sm text-cream/85">{verdictCopy(score.verdict)}</p>
              <p className="mt-2 text-xs text-muted">
                Recogniser heard: <span className="text-cream/80">{heard || "—"}</span>
              </p>
              {score.missed.length > 0 && (
                <p className="mt-1 text-xs text-muted">
                  Missed: <span className="text-sakura">{score.missed.join(" ")}</span>
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-sm text-cream/85">Listen back to back with the native line, then move on when it matches.</p>
          )}
        </div>
      )}
    </div>
  );
}
