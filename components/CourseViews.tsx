"use client";

import Link from "next/link";
import { allLessons, courseLessonCount, courses, getCourse, scriptClass, tintClass } from "@/lib/content";
import { levelFor, rankFor, useProgress } from "@/lib/progress";
import { Badge, Icon, ProgressBar, Ring, cn } from "./ui";
import { SpeakButton } from "./SpeakButton";

export function CoursePicker() {
  const { progress, ready } = useProgress();

  return (
    <div>
      <header className="mb-7">
        <p className="text-[11px] uppercase tracking-[0.2em] text-jade">Courses</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Choose a language to think in</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Thai and Japanese are the flagship courses, built with tone and mora drills from the first lesson. Spanish and French
          use the same engine for a change of scenery.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => {
          const lessons = allLessons(course);
          const done = lessons.filter(({ lesson }) => progress.completed[lesson.id]).length;
          const percent = lessons.length === 0 ? 0 : done / lessons.length;
          const active = progress.active === course.id;
          return (
            <Link
              key={course.id}
              href={`/learn/${course.id}`}
              className={cn(
                "card group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:border-jade/40",
                active && "border-jade/40",
              )}
            >
              <div className={cn("pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br blur-2xl", tintClass[course.units[0]?.tint ?? "jade"].from)} />
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{course.flag}</span>
                    {course.primary ? <Badge tone="jade">primary</Badge> : <Badge tone="muted">same method</Badge>}
                  </div>
                  <h2 className={cn("mt-3 font-display text-2xl font-semibold", scriptClass[course.id])}>{course.name}</h2>
                  <p className="text-sm text-muted">{course.english}</p>
                </div>
                <Ring value={percent} size={58} stroke={5} tone={course.id === "ja" ? "#ff7ea0" : course.id === "th" ? "#ffc65c" : "#a78bfa"}>
                  <span className="text-[11px] font-semibold">{Math.round(percent * 100)}%</span>
                </Ring>
              </div>

              <p className={cn("mt-4 line-clamp-2 text-sm text-cream/80", scriptClass[course.id])}>{course.tagline}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                <span className="pill">{lessons.length} lessons</span>
                <span className="pill">{course.units.length} units</span>
                <span className="pill">{course.scriptLabel}</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted">
                  Level {levelFor(progress.xp)} · <span className={scriptClass[course.id]}>{rankFor(course, progress.xp)}</span>
                </span>
                <span className="btn btn-ghost px-4 py-2 text-xs">
                  {done === 0 ? "Start" : done === lessons.length ? "Review" : "Continue"}
                  <Icon name="arrow" className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="card mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Why there is no translation button</h2>
        <div className="mt-3 grid gap-4 text-sm text-muted sm:grid-cols-3">
          <div>
            <p className="font-semibold text-cream">Picture → sound → word</p>
            <p className="mt-1">Every new word lands on an image and a native voice before it ever lands on a written definition.</p>
          </div>
          <div>
            <p className="font-semibold text-cream">Ear before eye</p>
            <p className="mt-1">Tone and mora drills come first, because an accent is a listening skill before it is a speaking one.</p>
          </div>
          <div>
            <p className="font-semibold text-cream">Peeking has a cost</p>
            <p className="mt-1">The meaning is always one tap away, but peeking resets your no-English multiplier. Convenience is not free.</p>
          </div>
        </div>
        {ready && (
          <p className="mt-4 text-xs text-muted">
            Monolingual streak: <span className="text-jade">{progress.mono}</span> · best {progress.bestMono} · total XP {progress.xp}
          </p>
        )}
      </section>
    </div>
  );
}

export function CourseMap({ courseId }: { courseId: string }) {
  const course = getCourse(courseId);
  const { progress } = useProgress();

  if (!course) {
    return (
      <div className="card p-8 text-center">
        <p>Course not found.</p>
        <Link href="/learn" className="btn btn-primary mt-4 px-6 py-3">
          All courses
        </Link>
      </div>
    );
  }

  const lessons = allLessons(course);
  const nextLesson = lessons.find(({ lesson }) => !progress.completed[lesson.id])?.lesson;
  const done = lessons.filter(({ lesson }) => progress.completed[lesson.id]).length;
  const percent = lessons.length === 0 ? 0 : done / lessons.length;
  const firstUnitTint = course.units[0]?.tint ?? "gold";

  return (
    <div>
      <Link href="/learn" className="inline-flex items-center gap-2 text-xs text-muted transition hover:text-cream">
        <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
        All courses
      </Link>

      <header className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{course.flag}</span>
            <Badge tone={course.primary ? "jade" : "muted"}>{course.primary ? "flagship" : "same method"}</Badge>
          </div>
          <h1 className={cn("mt-2 font-display text-4xl font-semibold tracking-tight", scriptClass[course.id])}>{course.name}</h1>
          <p className={cn("mt-1 text-lg text-cream/80", scriptClass[course.id])}>{course.tagline}</p>
          <p className="mt-2 max-w-lg text-sm text-muted">{course.accentTip}</p>
        </div>
        <div className="flex items-center gap-4 rounded-3xl border border-line/70 bg-panel/50 p-4">
          <Ring value={percent} size={72} stroke={6} tone={course.id === "ja" ? "#ff7ea0" : "#ffc65c"}>
            <span className="text-sm font-semibold">{Math.round(percent * 100)}%</span>
          </Ring>
          <div className="text-sm">
            <p className="text-cream">{done} of {lessons.length} lessons</p>
            <p className="text-muted">Level {levelFor(progress.xp)} · <span className={scriptClass[course.id]}>{rankFor(course, progress.xp)}</span></p>
            <div className="mt-2">
              <ProgressBar value={percent} tone={course.id === "ja" ? "sakura" : "gold"} />
            </div>
          </div>
        </div>
      </header>

      {nextLesson && (
        <Link
          href={`/learn/${course.id}/${nextLesson.id}`}
          className="card mt-6 flex items-center justify-between gap-4 border-jade/30 p-5 transition hover:border-jade/60"
        >
          <div>
            <p className="text-[11px] uppercase tracking-wider text-jade">Next up</p>
            <p className={cn("mt-1 font-display text-xl", scriptClass[course.id])}>{nextLesson.title}</p>
            <p className="text-xs text-muted">{nextLesson.intro}</p>
          </div>
          <span className="btn btn-primary h-12 w-12 shrink-0">
            <Icon name="arrow" className="h-5 w-5" />
          </span>
        </Link>
      )}

      <div className="mt-8 space-y-8">
        {course.units.map((unit, unitIndex) => {
          const tint = tintClass[unit.tint];
          return (
            <section key={unit.id}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn("grid h-11 w-11 place-items-center rounded-2xl border bg-panel/60 text-xl", tint.border)}>{unit.glyph}</span>
                  <div>
                    <h2 className={cn("font-display text-lg font-semibold", scriptClass[course.id])}>{unit.title}</h2>
                    <p className="text-[11px] uppercase tracking-wide text-muted">
                      Unit {unitIndex + 1} · {unit.latin}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-muted">
                  {unit.lessons.filter((lesson) => progress.completed[lesson.id]).length}/{unit.lessons.length}
                </span>
              </div>

              <div className="grid gap-2.5">
                {unit.lessons.map((lesson) => {
                  const record = progress.completed[lesson.id];
                  const isNext = nextLesson?.id === lesson.id;
                  return (
                    <Link
                      key={lesson.id}
                      href={`/learn/${course.id}/${lesson.id}`}
                      className={cn(
                        "group flex items-center gap-4 rounded-2xl border p-4 transition",
                        record ? "border-line/60 bg-panel/40" : "border-line/80 bg-panel/60 hover:border-jade/40",
                        isNext && "border-jade/40 bg-jade/[0.06]",
                        lesson.kind === "checkpoint" && "border-dashed",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-11 w-11 shrink-0 place-items-center rounded-full border text-sm font-semibold",
                          record
                            ? "border-jade/50 bg-jade/15 text-jade"
                            : isNext
                              ? "border-jade/50 bg-jade/10 text-cream"
                              : "border-line bg-ink/40 text-muted",
                        )}
                      >
                        {record ? <Icon name="check" className="h-4 w-4" /> : lesson.kind === "checkpoint" ? "★" : <span className={scriptClass[course.id]}>{course.name.slice(0, 1)}</span>}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate font-medium", scriptClass[course.id])}>{lesson.title}</p>
                        <p className="truncate text-[11px] text-muted">
                          {lesson.latin}
                          {record ? ` · best ${record.best}%` : lesson.kind === "checkpoint" ? " · unit review" : ""}
                        </p>
                      </div>
                      {isNext && <Badge tone="jade">next</Badge>}
                      <SpeakButton text={lesson.title} locale={course.locale} rate={progress.settings.rate} variant="plain" size="sm" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-8 text-center text-[11px] text-muted">
        {courseLessonCount(course)} lessons · {course.scriptLabel} · every word voiced by a native speaker
      </p>
    </div>
  );
}
