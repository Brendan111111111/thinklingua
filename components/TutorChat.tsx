"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { courses, getCourse, scriptClass } from "@/lib/content";
import type { LangId } from "@/lib/content/types";
import { levelFor, noteChat, saveSettings, useProgress } from "@/lib/progress";
import { personaFor } from "@/lib/tutor";
import { canRecognise, listenOnce, speak, stopSpeaking } from "@/lib/speech";
import { SpeakButton } from "./SpeakButton";
import { Badge, Icon, cn } from "./ui";

type Message = { role: "user" | "assistant"; content: string };

const OPENERS: Record<LangId, string> = {
  th: "สวัสดีค่ะ ฉันชื่อนก วันนี้เป็นอย่างไรบ้าง",
  ja: "こんにちは、あおいです。今日はどうでしたか。",
  es: "¡Hola! Soy Lucía. ¿Cómo estás hoy?",
  fr: "Salut ! Moi c'est Camille. Comment ça va aujourd'hui ?",
  ru: "Привет! Меня зовут Даша. Как ты сегодня?",
};

export function TutorChat() {
  const { progress, ready } = useProgress();
  const [lang, setLang] = useState<LangId>("th");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"no_key" | "failed" | null>(null);
  const [engineNative, setEngineNative] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [canListen, setCanListen] = useState(true);
  const [pendingListen, setPendingListen] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stopListeningRef = useRef<null | (() => void)>(null);
  const discardListeningRef = useRef(false);
  const handsFree = progress.settings.handsFree;

  useEffect(() => {
    if (ready) setLang(progress.active);
  }, [ready, progress.active]);

  useEffect(() => {
    fetch("/api/tts/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((info: { native?: boolean } | null) => setEngineNative(Boolean(info?.native)))
      .catch(() => setEngineNative(false));
  }, []);

  useEffect(() => {
    setCanListen(canRecognise());
    return () => {
      discardListeningRef.current = true;
      stopListeningRef.current?.();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, draft]);

  useEffect(() => {
    if (!pendingListen || busy) return;
    setPendingListen(false);
    if (handsFree && canListen) startListening();
    // startListening is a fresh closure on every render; the guards above decide when a turn reopens the mic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingListen, busy, handsFree, canListen]);

  const course = getCourse(lang) ?? courses[0];
  const persona = personaFor(lang);
  const level = levelFor(progress.xp);
  const known = useMemo(() => Object.values(course.lexemes).map((lexeme) => lexeme.text).slice(0, 40), [course]);

  function stopListening() {
    stopListeningRef.current?.();
    stopListeningRef.current = null;
    setListening(false);
    setLiveTranscript("");
  }

  function cancelListening() {
    discardListeningRef.current = true;
    stopListening();
    setVoiceError(null);
  }

  function startListening() {
    if (busy || listening) return;
    if (!canListen) {
      setVoiceError("This browser cannot listen to the microphone. Try Chrome or Edge, or type your reply below.");
      return;
    }
    stopSpeaking();
    discardListeningRef.current = false;
    setVoiceError(null);
    setLiveTranscript("");
    setListening(true);

    const stop = listenOnce(
      course.locale,
      (transcript) => {
        stopListeningRef.current = null;
        setListening(false);
        setLiveTranscript("");
        if (discardListeningRef.current) {
          discardListeningRef.current = false;
          return;
        }
        if (transcript.trim()) void send(transcript);
        else setVoiceError("I didn't catch that. Try again, a little closer to the microphone.");
      },
      () => {
        stopListeningRef.current = null;
        setListening(false);
        setLiveTranscript("");
      },
      (code) => {
        stopListeningRef.current = null;
        setListening(false);
        setLiveTranscript("");
        if (discardListeningRef.current) {
          discardListeningRef.current = false;
          return;
        }
        const denied = code === "not-allowed" || code === "service-not-allowed";
        setVoiceError(
          denied
            ? "Microphone permission was blocked. Allow it in the address bar, then try again."
            : code === "network"
              ? "Speech recognition needs a network connection. Check your connection and try again."
              : code === "no-speech"
                ? "I didn't hear anything. Tap the mic and try again."
                : "The microphone stopped. Try again, a little closer to the mic.",
        );
      },
      (transcript) => {
        if (!discardListeningRef.current) setLiveTranscript(transcript);
      },
    );

    if (!stop) {
      setListening(false);
      setLiveTranscript("");
      setVoiceError("This browser cannot listen to the microphone. Try Chrome or Edge, or type your reply below.");
      return;
    }
    stopListeningRef.current = stop;
  }

  async function send(text: string, mode: "chat" | "explain" = "chat") {
    const trimmed = text.trim();
    if (busy) return;
    if (mode === "chat" && !trimmed) return;
    if (stopListeningRef.current) discardListeningRef.current = true;
    stopListening();

    const history: Message[] = mode === "chat" ? [...messages, { role: "user", content: trimmed }] : messages;
    if (mode === "chat") {
      setMessages(history);
      setInput("");
    }
    setBusy(true);
    setDraft("");
    setError(null);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lang, level, mode, messages: history, known }),
      });

      if (response.status === 503) {
        setError("no_key");
        return;
      }
      if (!response.ok || !response.body) {
        setError("failed");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setDraft(accumulated);
      }
      if (accumulated.trim()) {
        setMessages([...history, { role: "assistant", content: accumulated }]);
        noteChat();
        setPendingListen(true);
        if (progress.settings.autoPlay) {
          try {
            await speak(accumulated, { locale: course.locale, rate: progress.settings.rate });
          } catch {
            // The reply is already on screen; audio trouble should not block the next turn.
          }
        }
      } else {
        setError("failed");
      }
      setDraft("");
    } catch {
      setError("failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <header className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-jade">Conversation</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">A native speaker who never translates</h1>
        <p className="mt-1 text-sm text-muted">
          {persona.name} replies only in {persona.label}, keeps it short, and models the right form instead of explaining it.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {courses.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setLang(option.id);
              cancelListening();
              setPendingListen(false);
              setMessages([]);
              setDraft("");
              setError(null);
              setVoiceError(null);
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              option.id === lang ? "border-jade/50 bg-jade/10 text-cream" : "border-line/70 bg-panel/40 text-muted hover:text-cream",
            )}
          >
            <span>{option.flag}</span>
            <span className={scriptClass[option.id]}>{option.name}</span>
          </button>
        ))}
        <span className="ml-auto">
          <Badge tone={engineNative ? "jade" : "gold"}>{engineNative ? "native voice" : "browser voice"}</Badge>
        </span>
      </div>

      <div ref={scroller} className="card scroll-hide max-h-[52vh] min-h-[280px] overflow-y-auto p-4 sm:p-5">
        {messages.length === 0 && !draft && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line/60 bg-panel2/60 p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-jade/30 to-gold/30 text-sm font-semibold">
                  {persona.name.slice(0, 1)}
                </span>
                <span className="text-sm font-medium">{persona.name}</span>
                <Badge tone="muted">level {level}</Badge>
              </div>
              <p className={cn("mt-3 text-xl leading-relaxed", scriptClass[lang])}>{OPENERS[lang]}</p>
              <div className="mt-3">
                <SpeakButton text={OPENERS[lang]} locale={course.locale} rate={progress.settings.rate} variant="ghost" size="sm" />
              </div>
            </div>
            <div className="rounded-2xl border border-jade/25 bg-jade/[0.06] p-4 text-center">
              <p className="text-[11px] uppercase tracking-wide text-jade">Speak back to {persona.name}</p>
              <p className={cn("mt-2 text-lg", scriptClass[lang])}>Answer out loud — {persona.name} is listening.</p>
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                disabled={busy}
                className={cn("btn mt-4 px-5 py-3", listening ? "btn-ghost-danger" : "btn-primary")}
              >
                <Icon name={listening ? "x" : "mic"} className="h-4 w-4" />
                {listening ? "Listening… tap to stop" : "Speak"}
              </button>
              {!canListen && (
                <p className="mt-2 text-[11px] text-muted">
                  This browser has no speech recogniser. You can still type your reply below.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.role === "user" ? "bg-jade/15 text-cream" : "border border-line/60 bg-panel2/70",
                )}
              >
                <p className={cn("whitespace-pre-wrap text-[15px] leading-relaxed", scriptClass[lang])}>{message.content}</p>
                {message.role === "assistant" && (
                  <div className="mt-2 flex items-center gap-1">
                    <SpeakButton text={message.content} locale={course.locale} rate={progress.settings.rate} variant="plain" size="sm" />
                    <button
                      type="button"
                      onClick={() => send("", "explain")}
                      disabled={busy}
                      className="rounded-full px-2 py-1 text-[11px] text-muted transition hover:text-cream"
                    >
                      simpler +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {draft && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl border border-line/60 bg-panel2/70 px-4 py-3">
                <p className={cn("whitespace-pre-wrap text-[15px] leading-relaxed", scriptClass[lang])}>{draft}</p>
              </div>
            </div>
          )}

          {busy && !draft && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-line/60 bg-panel2/70 px-4 py-3 text-sm text-muted">…</div>
            </div>
          )}
        </div>
      </div>

      {error === "no_key" && (
        <div className="mt-3 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
          <p className="font-semibold">The AI partner needs a key.</p>
          <p className="mt-1 text-gold/80">
            Add <code className="rounded bg-ink/60 px-1.5 py-0.5">GEMINI_API_KEY</code> (Google AI Studio) or <code className="rounded bg-ink/60 px-1.5 py-0.5">OPENAI_API_KEY</code> (Freebuff → Account → Developer API) to <code className="rounded bg-ink/60 px-1.5 py-0.5">.env.local</code> or your Worker secrets, then restart or redeploy. Gemini uses its OpenAI-compatible endpoint automatically.
            {engineNative === false ? " Voice keys are separate — see Settings." : ""}
          </p>
        </div>
      )}

      {error === "failed" && (
        <div className="mt-3 rounded-2xl border border-sakura/30 bg-sakura/10 p-3 text-sm text-sakura">
          The connection dropped. Send it again.
        </div>
      )}

      {listening && (
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-jade/30 bg-jade/[0.07] px-3 py-2.5">
          <span className="relative mt-1.5 flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade/50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-jade" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.16em] text-jade">Listening</p>
            <p className={cn("mt-1 text-sm leading-relaxed", liveTranscript ? scriptClass[lang] : "text-muted")}>
              {liveTranscript || "Speak now…"}
            </p>
          </div>
          <button
            type="button"
            onClick={cancelListening}
            className="shrink-0 rounded-full border border-line/60 px-2.5 py-1 text-[11px] text-muted transition hover:border-sakura/40 hover:text-sakura"
          >
            Cancel
          </button>
        </div>
      )}

      <form
        className="sticky bottom-20 mt-3 flex items-center gap-2 rounded-2xl border border-line/70 bg-panel/80 p-2 backdrop-blur lg:bottom-4"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={listening ? "Listening…" : `Speak or write in ${course.english}…`}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-3 py-2 text-[15px] outline-none placeholder:text-muted/60",
            scriptClass[lang],
          )}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          disabled={busy}
          className={cn("btn h-10 w-10 shrink-0", listening ? "btn-ghost-danger" : "btn-ghost")}
          aria-label={listening ? "Stop listening" : "Speak your reply"}
          title={listening ? "Stop listening" : "Speak your reply"}
        >
          <Icon name={listening ? "x" : "mic"} className="h-4 w-4" />
        </button>
        <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary h-10 w-10 shrink-0" aria-label="Send">
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </form>
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          role="switch"
          aria-checked={handsFree}
          onClick={() => {
            const next = !handsFree;
            saveSettings({ handsFree: next });
            if (!next) {
              cancelListening();
              setPendingListen(false);
            }
          }}
          title="Reopen the microphone automatically after each reply"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] transition",
            handsFree ? "border-jade/40 bg-jade/10 text-jade" : "border-line/60 text-muted hover:text-cream",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", handsFree ? "bg-jade" : "bg-muted/50")} />
          Hands-free {handsFree ? "on" : "off"}
        </button>
      </div>
      {voiceError && (
        <p className="mt-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-center text-[11px] text-gold">
          {voiceError}
        </p>
      )}
      <p className="mt-2 text-center text-[11px] text-muted">
        Mistakes are welcome. {persona.name} answers by using the correct form, not by grading you.
      </p>
    </div>
  );
}
