"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildExercises, buildReading, buildReview, buildSpeaking, earAudio } from "@/lib/exercises";
import { findLesson, findReadingLesson, findSpeakingUnit, getCourse, scriptClass } from "@/lib/content";
import {
  HEART_MAX,
  completeLesson,
  dayKey,
  heartsNow,
  spendHeart,
  recordAnswer,
  recordPeek,
  useProgress,
  type LessonResult,
} from "@/lib/progress";
import { canRecognise, listenOnce, soundsClose, speak, stopSpeaking } from "@/lib/speech";
import { SpeakButton } from "./SpeakButton";
import { SpeakCard } from "./SpeakCard";
import { Badge, Icon, ProgressBar, Ring, cn } from "./ui";

type Props = { courseId: string; lessonId?: string; mode?: "lesson" | "review" };

const CONFETTI_COLOURS = ["#3de0ae", "#ffc65c", "#ff7ea0", "#a78bfa", "#6fc3ff"];

export function LessonRunner({ courseId, lessonId, mode = "lesson" }: Props) {
  const course = useMemo(() => getCourse(courseId), [courseId]);
  const exercises = useMemo(() => {
    const currentCourse = getCourse(courseId);
    if (!currentCourse) return [];
    if (mode === "review") return buildReview(currentCourse, Object.keys(currentCourse.lexemes));
    if (lessonId?.startsWith("read.")) {
      const reading = findReadingLesson(currentCourse, lessonId);
      return reading ? buildReading(reading) : [];
    }
    if (lessonId?.startsWith("speak.")) {
      const unit = findSpeakingUnit(currentCourse, lessonId);
      return unit ? buildSpeaking(currentCourse, unit) : [];
    }
    const found = lessonId ? findLesson(currentCourse, lessonId) : undefined;
    return found ? buildExercises(currentCourse, found.lesson) : [];
  }, [courseId, lessonId, mode]);

  const found = course && lessonId ? findLesson(course, lessonId) : undefined;
  const readingLesson = course && lessonId ? findReadingLesson(course, lessonId) : undefined;
  const speakingUnit = course && lessonId ? findSpeakingUnit(course, lessonId) : undefined;
  const lessonTitle = readingLesson?.title ?? speakingUnit?.title ?? found?.lesson.title ?? "";
  const unitTitle = readingLesson ? "Reading" : speakingUnit ? "Speaking" : found?.unit.title;
  const { progress, ready } = useProgress();

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"answer" | "correct" | "wrong">("answer");
  const [chosen, setChosen] = useState<string | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [peeks, setPeeks] = useState(0);
  const [showGloss, setShowGloss] = useState(false);
  const [score, setScore] = useState(0);
  const [earTotal, setEarTotal] = useState(0);
  const [earCorrect, setEarCorrect] = useState(0);
  const [result, setResult] = useState<LessonResult | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [hearing, setHearing] = useState(false);
  const finishedRef = useRef(false);

  const current = exercises[index];
  const total = exercises.length;
  const hearts = heartsNow(progress);
  const targetClass = course ? scriptClass[course.id] : "";
  const rate = progress.settings.rate;

  const finish = useCallback(
    (finalScore: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      stopSpeaking();
      const summary = completeLesson({
        lessonId: mode === "review" ? `review:${courseId}:${dayKey()}` : (lessonId ?? "lesson"),
        score: finalScore,
        total: Math.max(1, total),
        peeks,
        earTotal,
        earCorrect,
      });
      setResult(summary);
      setConfetti(true);
      window.setTimeout(() => setConfetti(false), 3400);
    },
    [courseId, earCorrect, earTotal, lessonId, mode, peeks, total],
  );

  const currentKey = current?.key;

  useEffect(() => {
    if (!ready || !current || !course || !progress.settings.autoPlay) return;
    // Reading drills hide the answer, so auto-playing them would give it away.
    if (current.kind === "read" || current.kind === "scriptRead" || current.kind === "scriptWord") return;
    const text = current.kind === "ear" ? earAudio(current.drill).text : current.text;
    const timer = window.setTimeout(() => {
      void speak(text, { locale: course.locale, rate });
    }, 240);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, ready, course, progress.settings.autoPlay, rate]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Enter") return;
      if (result) return;
      if (phase !== "answer") {
        event.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, result, index]);

  function place(poolIndex: number) {
    if (phase !== "answer") return;
    setPlaced((previous) => [...previous, poolIndex]);
  }

  function unplace(position: number) {
    if (phase !== "answer") return;
    setPlaced((previous) => previous.filter((_, at) => at !== position));
  }

  function correctAnswerText(): string {
    if (!current) return "";
    if (current.kind === "ear") return earAudio(current.drill).text;
    return current.text;
  }

  function correctLatin(): string {
    if (!current) return "";
    if (current.kind === "ear") return earAudio(current.drill).latin;
    return current.latin;
  }

  function currentGloss(): string {
    if (!current) return "";
    if (current.kind === "ear") return earAudio(current.drill).gloss;
    if (current.kind === "build" || current.kind === "shadow" || current.kind === "speak" || current.kind === "scriptWord") {
      return current.gloss;
    }
    return "";
  }

  function isCorrect(): boolean {
    if (!current) return false;
    if (current.kind === "shadow") return true;
    if (current.kind === "build") {
      const attempt = placed.map((poolIndex) => current.pool[poolIndex]);
      return attempt.join("\u0001") === current.tiles.join("\u0001");
    }
    if (current.kind === "ear") return chosen === current.drill.target;
    if (current.kind === "scriptRead" || current.kind === "scriptListen") return chosen === current.glyph;
    if (current.kind === "scriptWord") return chosen === current.latin;
    if (current.kind === "speak") return false;
    return chosen === current.lexemeId;
  }

  function check() {
    if (!current || phase !== "answer" || current.kind === "shadow") return;
    const ok = isCorrect();
    const lexemeId = "lexemeId" in current ? current.lexemeId : undefined;
    setPhase(ok ? "correct" : "wrong");
    if (ok) setScore((value) => value + 1);
    else spendHeart();
    if (current.kind === "ear") setEarTotal((value) => value + 1);
    if (current.kind === "ear" && ok) setEarCorrect((value) => value + 1);
    recordAnswer({ correct: ok, lexemeId, ear: current.kind === "ear" });
  }

  function next() {
    stopSpeaking();
    if (index + 1 >= total) {
      finish(score);
      return;
    }
    setIndex((value) => value + 1);
    setPhase("answer");
    setChosen(null);
    setPlaced([]);
    setShowGloss(false);
    setTranscript(null);
    setHearing(false);
  }

  function peek() {
    if (showGloss) return;
    setShowGloss(true);
    setPeeks((value) => value + 1);
    recordPeek();
  }

  function startHearing() {
    if (!course) return;
    setTranscript(null);
    setHearing(true);
    const stop = listenOnce(
      course.locale,
      (text) => setTranscript(text),
      () => setHearing(false),
    );
    if (!stop) setHearing(false);
  }

  if (!course) {
    return (
      <div className="card p-8 text-center">
        <p className="text-cream">That course does not exist.</p>
        <Link href="/learn" className="btn btn-primary mt-4 px-6 py-3">
          Back to courses
        </Link>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-cream">This lesson has no drills yet.</p>
        <Link href={`/learn/${course.id}`} className="btn btn-primary mt-4 px-6 py-3">
          Back to {course.english}
        </Link>
      </div>
    );
  }

  if (result) {
    const percent = Math.round((score / Math.max(1, total)) * 100);
    return (
      <div className="relative mx-auto max-w-xl">
        {confetti &&
          Array.from({ length: 26 }).map((_, piece) => (
            <span
              key={piece}
              className="confetti-piece"
              style={{
                left: `${(piece * 37) % 100}%`,
                backgroundColor: CONFETTI_COLOURS[piece % CONFETTI_COLOURS.length],
                animationDelay: `${(piece % 9) * 0.11}s`,
              }}
            />
          ))}
        <div className="card anim-pop p-8 text-center">
          <div className="mx-auto flex w-fit items-center justify-center">
            <Ring value={percent / 100} size={132} stroke={9} tone={percent >= 70 ? "#3de0ae" : "#ffc65c"}>
              <span className="font-display text-3xl font-semibold">{percent}%</span>
            </Ring>
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">
            {result.perfect ? "Flawless." : "Lesson complete."}
          </h1>
          <p className={cn("mt-1 text-lg", targetClass)}>{mode === "review" ? "ทบทวนเสร็จแล้ว" : lessonTitle}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="card-soft p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted">XP</p>
              <p className="font-display text-xl text-jade">+{result.xpGained}</p>
            </div>
            <div className="card-soft p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted">Streak</p>
              <p className="font-display text-xl text-gold">{result.streak}</p>
            </div>
            <div className="card-soft p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted">No English</p>
              <p className="font-display text-xl text-sakura">×{result.multiplier.toFixed(1)}</p>
            </div>
          </div>

          {result.monolingual > 0 && (
            <p className="mt-4 text-sm text-muted">
              {result.monolingual} lesson{result.monolingual === 1 ? "" : "s"} in a row without a single translation.
            </p>
          )}

          {result.unlocked.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {result.unlocked.map((id) => (
                <Badge key={id} tone="jade">
                  🏆 {id.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          )}

          {result.levelUp && <p className="mt-4 text-sm text-gold">New level — your rank just moved up.</p>}

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <Link href={`/learn/${course.id}`} className="btn btn-primary flex-1 px-5 py-3.5">
              Back to the map
            </Link>
            <Link href="/tutor" className="btn btn-ghost flex-1 px-5 py-3.5">
              Talk to a native
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const answering = phase === "answer";
  const optionState = (id: string) => {
    if (answering) return chosen === id ? "picked" : undefined;
    const correctId =
      current.kind === "ear"
        ? current.drill.target
        : current.kind === "scriptWord"
          ? current.latin
          : current.kind === "scriptRead" || current.kind === "scriptListen"
            ? current.glyph
            : "lexemeId" in current
              ? current.lexemeId
              : "";
    if (id === correctId) return "correct";
    if (id === chosen) return "wrong";
    return "dim";
  };

  return (
    <div className="mx-auto max-w-2xl pb-40">
      <div className="mb-5 flex items-center gap-3">
        <Link href={`/learn/${course.id}`} aria-label="Leave lesson" className="btn btn-ghost h-10 w-10 shrink-0">
          <Icon name="x" className="h-4 w-4" />
        </Link>
        <ProgressBar value={index / Math.max(1, total)} className="h-2.5" />
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-sakura">
          <Icon name="heart" className="h-4 w-4" />
          {hearts}
        </span>
      </div>

      <div className="mb-5 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted">
        <span>
          {mode === "review" ? "Review" : unitTitle} · {Math.min(index + 1, total)}/{total}
        </span>
        <button
          type="button"
          onClick={peek}
          className={cn("inline-flex items-center gap-1.5 rounded-full border border-line/70 px-3 py-1 text-[11px] font-semibold normal-case tracking-normal transition hover:border-jade/40", showGloss ? "text-muted" : "text-cream/80")}
        >
          <Icon name="eye" className="h-3.5 w-3.5" />
          {showGloss ? "meaning shown" : "peek meaning"}
        </button>
      </div>

      {hearts === 0 && (
        <div className="mb-4 rounded-2xl border border-gold/30 bg-gold/10 p-3 text-xs text-gold">
          Focus is empty — you can keep going, or refill with a review session.
        </div>
      )}

      <div className="card p-6 sm:p-8">
        {current.kind === "recognise" && (
          <div className="anim-slide">
            <Prompt title="Listen, then pick the picture." hint="No English. Let the sound land on the image." />
            <div className="mt-4 flex flex-col items-center gap-4">
              <p className={cn("text-center text-4xl font-semibold", targetClass)}>{current.text}</p>
              <SpeakButton text={current.text} locale={course.locale} rate={rate} size="lg" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {current.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={!answering}
                  data-state={optionState(option.id)}
                  onClick={() => setChosen(option.id)}
                  className="answer"
                >
                  <span className="text-4xl">{option.glyph}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {current.kind === "listen" && (
          <div className="anim-slide">
            <Prompt title="Sound only. What do you hear?" hint="The text appears after you answer." />
            <div className="mt-6 flex flex-col items-center gap-4">
              <SpeakButton text={current.text} locale={course.locale} rate={rate} size="lg" />
              {!answering && <p className={cn("text-center text-3xl font-semibold", targetClass)}>{current.text}</p>}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {current.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={!answering}
                  data-state={optionState(option.id)}
                  onClick={() => setChosen(option.id)}
                  className="answer"
                >
                  <span className="text-4xl">{option.glyph}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {current.kind === "read" && (
          <div className="anim-slide">
            <Prompt title="Which phrase means this?" hint="Picture first — reach for the word, not the translation." />
            <div className="mt-6 flex flex-col items-center gap-3">
              <span className="text-6xl">{current.glyph}</span>
              <SpeakButton text={current.text} locale={course.locale} rate={rate} variant="ghost" size="md" />
            </div>
            <div className="mt-6 grid gap-2.5">
              {current.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={!answering}
                  data-state={optionState(option.id)}
                  onClick={() => setChosen(option.id)}
                  className={cn("answer !flex-row !justify-start px-4 py-3", targetClass)}
                >
                  <span className="text-xl">{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {current.kind === "build" && (
          <div className="anim-slide">
            <Prompt
              title={current.audioOnly ? "Hear it, then say it back." : "Build the sentence."}
              hint={current.audioOnly ? "Tiles appear after you listen." : "Order the tiles the way the phrase runs."}
            />
            <div className="mt-5 flex flex-col items-center gap-3">
              <span className="text-5xl">{current.glyph}</span>
              <SpeakButton text={current.text} locale={course.locale} rate={rate} />
              {!current.audioOnly && <p className={cn("text-center text-2xl font-semibold", targetClass)}>{current.text}</p>}
            </div>

            <div className="mt-6 flex min-h-[3.5rem] flex-wrap items-end gap-2 border-b border-dashed border-line pb-2">
              {placed.length === 0 && <span className="pb-2 text-sm text-muted">Tap tiles to build the phrase</span>}
              {placed.map((poolIndex, position) => (
                <button
                  key={`${poolIndex}-${position}`}
                  type="button"
                  className={cn("tile", targetClass)}
                  onClick={() => unplace(position)}
                  disabled={!answering}
                >
                  {current.pool[poolIndex]}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {current.pool.map((tile, poolIndex) => (
                <button
                  key={`${tile}-${poolIndex}`}
                  type="button"
                  className={cn("tile", targetClass)}
                  data-used={placed.includes(poolIndex)}
                  onClick={() => place(poolIndex)}
                  disabled={!answering}
                >
                  {tile}
                </button>
              ))}
            </div>
          </div>
        )}

        {current.kind === "ear" && (
          <div className="anim-slide">
            <Prompt title="Two words, one sound. Which did you hear?" hint={current.drill.hint} />
            <div className="mt-6 flex justify-center">
              <SpeakButton text={earAudio(current.drill).text} locale={course.locale} rate={rate} size="lg" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {(["a", "b"] as const).map((side) => {
                const option = side === "a" ? current.drill.a : current.drill.b;
                return (
                  <button
                    key={side}
                    type="button"
                    disabled={!answering}
                    data-state={optionState(side)}
                    onClick={() => setChosen(side)}
                    className="answer py-6"
                  >
                    <span className={cn("text-2xl font-semibold", targetClass)}>{option.text}</span>
                    {!answering && <span className="text-[11px] text-muted">{option.latin}</span>}
                  </button>
                );
              })}
            </div>
            {!answering && (
              <p className="mt-4 text-center text-xs text-muted">
                Now play both again and feel the difference — this is the accent.
              </p>
            )}
          </div>
        )}

        {current.kind === "shadow" && (
          <div className="anim-slide">
            <Prompt title="Say it out loud. Match the rhythm." hint="Shadow the speaker — same speed, same melody." />
            <div className="mt-6 flex flex-col items-center gap-4">
              <span className="text-5xl">{current.glyph}</span>
              <p className={cn("text-center text-3xl font-semibold", targetClass)}>{current.text}</p>
              <SpeakButton text={current.text} locale={course.locale} rate={rate} size="lg" />
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              {canRecognise() ? (
                <button type="button" onClick={startHearing} className={cn("btn px-5 py-3", hearing ? "btn-ghost-danger" : "btn-ghost")}>
                  <Icon name="mic" className="h-4 w-4" />
                  {hearing ? "Listening…" : "Record my voice"}
                </button>
              ) : (
                <p className="text-xs text-muted">Your browser cannot listen, so this one is on your honour.</p>
              )}
              {transcript !== null && (
                <div className="w-full rounded-2xl border border-line/70 bg-panel/60 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-muted">I heard</p>
                  <p className={cn("mt-1 text-lg", targetClass)}>{transcript || "—"}</p>
                  <p className="mt-1 text-xs text-jade">
                    {soundsClose(transcript, current.text) ? "Close enough — that is the shape." : "Try once more, slower, then move on."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {current.kind === "scriptRead" && (
          <div className="anim-slide">
            <Prompt title="What sound does this letter make?" hint="Look at the shape, then choose the sound." />
            <div className="mt-7 flex justify-center">
              <p className={cn("text-7xl font-semibold", targetClass)}>{current.glyph}</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {current.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={!answering}
                  data-state={optionState(option.id)}
                  onClick={() => setChosen(option.id)}
                  className="answer py-5"
                >
                  <span className="text-xl font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {current.kind === "scriptListen" && (
          <div className="anim-slide">
            <Prompt title="Hear the sound. Pick the letter." hint="The letter appears after you answer." />
            <div className="mt-7 flex justify-center">
              <SpeakButton text={current.pronounce} locale={course.locale} rate={rate} size="lg" />
            </div>
            {!answering && (
              <p className="mt-4 text-center text-sm text-muted">
                <span className={cn("text-2xl text-cream", targetClass)}>{current.glyph}</span> · {current.sound}
              </p>
            )}
            <div className="mt-7 grid grid-cols-2 gap-3">
              {current.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={!answering}
                  data-state={optionState(option.id)}
                  onClick={() => setChosen(option.id)}
                  className="answer py-6"
                >
                  <span className={cn("text-4xl font-semibold", targetClass)}>{option.glyph}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {current.kind === "scriptWord" && (
          <div className="anim-slide">
            <Prompt title="Read the word." hint="Blend the letters you just learned. Sound is revealed after you answer." />
            <div className="mt-7 flex flex-col items-center gap-2">
              <p className={cn("text-4xl font-semibold", targetClass)}>{current.text}</p>
            </div>
            <div className="mt-7 grid gap-2.5">
              {current.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={!answering}
                  data-state={optionState(option.id)}
                  onClick={() => setChosen(option.id)}
                  className="answer !flex-row !justify-start px-4 py-3"
                >
                  <span className="text-lg">{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {current.kind === "speak" && (
          <SpeakCard
            key={current.key}
            text={current.text}
            latin={current.latin}
            gloss={current.gloss}
            glyph={current.glyph}
            tone={current.tone}
            locale={course.locale}
            rate={rate}
            locked={!answering}
            onGraded={(pass) => {
              if (phase !== "answer") return;
              setPhase(pass ? "correct" : "wrong");
              if (pass) setScore((value) => value + 1);
              else spendHeart();
              recordAnswer({ correct: pass, lexemeId: current.lexemeId });
            }}
          />
        )}

        {(current.kind !== "shadow" && current.kind !== "speak") && (
          <div className="mt-7 flex items-center justify-between gap-3">
            <p className="text-xs text-muted">
              {showGloss ? "You peeked — this lesson will not count toward your no-English streak." : "Try it before you peek."}
            </p>
            <button type="button" onClick={check} disabled={!answering || (current.kind === "build" ? placed.length === 0 : !chosen)} className="btn btn-primary px-7 py-3">
              Check
            </button>
          </div>
        )}

        {current.kind === "shadow" && (
          <div className="mt-7 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setScore((value) => value + 1);
                next();
              }}
              className="btn btn-primary px-7 py-3"
            >
              I said it
            </button>
          </div>
        )}

        {showGloss && (
          <p className="mt-4 rounded-xl border border-line/70 bg-ink/50 p-3 text-sm text-muted">
            <span className="text-cream">{correctAnswerText()}</span> · {correctLatin()} — {currentGloss()}
          </p>
        )}
      </div>

      {/* feedback sheet */}
      {!answering && (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 border-t px-4 pb-4 pt-3 backdrop-blur-xl",
            phase === "correct" ? "border-jade/40 bg-jade/10" : "border-sakura/40 bg-sakura/10",
          )}
        >
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                phase === "correct" ? "bg-jade text-ink" : "bg-sakura text-ink",
              )}
            >
              <Icon name={phase === "correct" ? "check" : "x"} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide">
                {phase === "correct" ? "Correct" : "Not yet"}
              </p>
              <p className={cn("truncate text-lg font-semibold", targetClass)}>{correctAnswerText()}</p>
              {progress.settings.latin && <p className="truncate text-[11px] text-muted">{correctLatin()}</p>}
            </div>
            <SpeakButton text={correctAnswerText()} locale={course.locale} rate={rate} size="sm" variant="ghost" />
            <button type="button" onClick={next} className="btn btn-primary px-6 py-3">
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Prompt({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold leading-snug">{title}</h2>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

export function HeartRow({ progress }: { progress: Parameters<typeof heartsNow>[0] }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-sakura">
      <Icon name="heart" className="h-4 w-4" />
      {heartsNow(progress)}/{HEART_MAX}
    </span>
  );
}
