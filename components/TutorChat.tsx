"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { courses, getCourse, scriptClass } from "@/lib/content";
import type { LangId } from "@/lib/content/types";
import { levelFor, noteChat, useProgress } from "@/lib/progress";
import { personaFor, STARTERS } from "@/lib/tutor";
import { SpeakButton } from "./SpeakButton";
import { Badge, Icon, cn } from "./ui";

type Message = { role: "user" | "assistant"; content: string };

const OPENERS: Record<LangId, string> = {
  th: "สวัสดีค่ะ ฉันชื่อนก วันนี้เป็นอย่างไรบ้าง",
  ja: "こんにちは、あおいです。今日はどうでしたか。",
  es: "¡Hola! Soy Lucía. ¿Cómo estás hoy?",
  fr: "Salut ! Moi c'est Camille. Comment ça va aujourd'hui ?",
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
  const scroller = useRef<HTMLDivElement>(null);

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
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, draft]);

  const course = getCourse(lang) ?? courses[0];
  const persona = personaFor(lang);
  const level = levelFor(progress.xp);
  const known = useMemo(() => Object.values(course.lexemes).map((lexeme) => lexeme.text).slice(0, 40), [course]);

  async function send(text: string, mode: "chat" | "explain" = "chat") {
    const trimmed = text.trim();
    if (busy) return;
    if (mode === "chat" && !trimmed) return;

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
              setMessages([]);
              setDraft("");
              setError(null);
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
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wide text-muted">Say something back</p>
              <div className="flex flex-wrap gap-2">
                {STARTERS[lang].map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => send(starter)}
                    className={cn("rounded-full border border-line/70 bg-panel/50 px-3 py-1.5 text-sm hover:border-jade/40", scriptClass[lang])}
                  >
                    {starter}
                  </button>
                ))}
              </div>
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
            Add <code className="rounded bg-ink/60 px-1.5 py-0.5">OPENAI_API_KEY</code> to <code className="rounded bg-ink/60 px-1.5 py-0.5">.env.local</code> (Freebuff → Account →
            Developer API), set <code className="rounded bg-ink/60 px-1.5 py-0.5">AI_BASE_URL</code> to your OpenAI-compatible endpoint, then restart the server.
            {engineNative === false ? " Voice keys are separate — see Settings." : ""}
          </p>
        </div>
      )}

      {error === "failed" && (
        <div className="mt-3 rounded-2xl border border-sakura/30 bg-sakura/10 p-3 text-sm text-sakura">
          The connection dropped. Send it again.
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
          placeholder={`Write in ${course.english}…`}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-3 py-2 text-[15px] outline-none placeholder:text-muted/60",
            scriptClass[lang],
          )}
          autoComplete="off"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary h-10 w-10 shrink-0" aria-label="Send">
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted">
        Mistakes are welcome. {persona.name} answers by using the correct form, not by grading you.
      </p>
    </div>
  );
}
