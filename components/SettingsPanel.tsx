"use client";

import { useEffect, useState } from "react";
import { courses, scriptClass } from "@/lib/content";
import { loadEngine, type EngineInfo } from "@/lib/speech";
import { resetProgress, saveSettings, useProgress } from "@/lib/progress";
import { SpeakButton } from "./SpeakButton";
import { Badge, Icon, cn } from "./ui";

const SAMPLES: Record<string, { text: string; latin: string }> = {
  th: { text: "สวัสดีค่ะ ยินดีที่ได้รู้จัก", latin: "sawatdi kha, yindii thii dai ruuchak" },
  ja: { text: "はじめまして。よろしくおねがいします", latin: "hajimemashite, yoroshiku onegaishimasu" },
  es: { text: "hola, mucho gusto", latin: "ola, mucho gusto" },
  fr: { text: "bonjour, enchanté", latin: "bonzhur, antchanté" },
};

function Toggle({ checked, onChange, label, detail }: { checked: boolean; onChange: (value: boolean) => void; label: string; detail: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-line/60 bg-panel/40 p-4 text-left transition hover:border-jade/30"
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted">{detail}</span>
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-jade" : "bg-line")}>
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-ink transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function SettingsPanel() {
  const { progress, ready } = useProgress();
  const [engine, setEngine] = useState<EngineInfo | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadEngine().then(setEngine).catch(() => setEngine(null));
  }, []);

  if (!ready) return <div className="card h-72 animate-pulse bg-panel/40" />;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-jade">Settings</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Voice and method</h1>
        <p className="mt-1 text-sm text-muted">Small room, no clutter. Everything here changes how the language sounds.</p>
      </header>

      <section className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Voice engine</h2>
            <p className="mt-1 text-sm text-muted">
              {engine?.engine === "free"
                ? "Native Thai and Japanese voices are active out of the box. Add an Azure key whenever you want the studio neural voices."
                : engine?.native
                  ? "Native neural voices are active. Thai is voiced by a Thai speaker, Japanese by a Japanese speaker."
                  : "Running on the best voice installed in this device. Native-accent voices unlock with a voice key."}
            </p>
          </div>
          <Badge tone={engine?.native ? "jade" : "gold"}>{engine ? engine.label : "checking…"}</Badge>
        </div>

        {!engine?.native && (
          <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/[0.07] p-4 text-xs text-gold/90">
            <p className="font-semibold text-gold">For the real accent</p>
            <p className="mt-1 leading-relaxed">
              Add <code className="rounded bg-ink/60 px-1 py-0.5">AZURE_SPEECH_KEY</code> and{" "}
              <code className="rounded bg-ink/60 px-1 py-0.5">AZURE_SPEECH_REGION</code> to{" "}
              <code className="rounded bg-ink/60 px-1 py-0.5">.env.local</code>. The defaults are
              th-TH-PremwadeeNeural and ja-JP-NanamiNeural — native speakers, not a synthetic approximation. Google Cloud TTS
              (Neural2) or ElevenLabs multilingual v2 also work.
            </p>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center gap-3 rounded-2xl border border-line/60 bg-panel/40 p-3">
              <span className="text-lg">{course.flag}</span>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm", scriptClass[course.id])}>{SAMPLES[course.id].text}</p>
                <p className="truncate text-[11px] text-muted">{SAMPLES[course.id].latin}</p>
              </div>
              <SpeakButton text={SAMPLES[course.id].text} locale={course.locale} rate={progress.settings.rate} variant="ghost" size="sm" />
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="font-display text-lg font-semibold">How fast they speak</h2>
        <p className="text-sm text-muted">
          Native pace is the goal. Slow it down only while a sound is still new to you.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0.6}
            max={1.3}
            step={0.05}
            value={progress.settings.rate}
            onChange={(event) => saveSettings({ rate: Number(event.target.value) })}
            className="h-1.5 w-full accent-jade"
          />
          <span className="w-12 shrink-0 text-right text-sm text-cream">{progress.settings.rate.toFixed(2)}×</span>
        </div>
      </section>

      <section className="space-y-2.5">
        <Toggle
          label="Show romanisation"
          detail="Reading aids under target-script words. Off keeps your eyes in the real script."
          checked={progress.settings.latin}
          onChange={(value) => saveSettings({ latin: value })}
        />
        <Toggle
          label="Play audio automatically"
          detail="Hear every new word the moment it appears."
          checked={progress.settings.autoPlay}
          onChange={(value) => saveSettings({ autoPlay: value })}
        />
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-semibold">Progress</h2>
        <p className="mt-1 text-sm text-muted">
          Stored on this device only. Nothing leaves the browser unless you talk to the AI partner.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {!confirming ? (
            <button type="button" onClick={() => setConfirming(true)} className="btn btn-ghost-danger px-5 py-3 text-sm">
              Reset all progress
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  resetProgress();
                  setConfirming(false);
                }}
                className="btn btn-primary px-5 py-3 text-sm"
              >
                Yes, wipe it
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="btn btn-ghost px-5 py-3 text-sm">
                Keep my streak
              </button>
            </>
          )}
        </div>
      </section>

      <p className="pb-4 text-center text-[11px] text-muted">
        <Icon name="heart" className="mr-1 inline h-3 w-3 text-sakura" />
        Peeking is allowed. It just costs you the multiplier.
      </p>
    </div>
  );
}
