"use client";

import Link from "next/link";
import { useState } from "react";
import {
  allCourseLessonIds,
  courses,
  getCourse,
  lessonSummary,
  scriptClass,
  speakingLessonId,
  speakingLessonTitle,
  tintClass,
  trackLessonIds,
  totalCourseLessons,
  type Track,
} from "@/lib/content";
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
          const ids = allCourseLessonIds(course);
          const done = ids.filter((id) => progress.completed[id]).length;
          const percent = ids.length === 0 ? 0 : done / ids.length;
          const active = progress.active === course.id;
          const words = trackLessonIds(course, "words").length;
          const speaking = trackLessonIds(course, "speak").length;
          const reading = trackLessonIds(course, "read").length;
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
                <span className="pill">{words} word lessons</span>
                <span className="pill">{speaking} speaking</span>
                <span className="pill">{reading} reading</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted">
                  Level {levelFor(progress.xp)} · <span className={scriptClass[course.id]}>{rankFor(course, progress.xp)}</span>
                </span>
                <span className="btn btn-ghost px-4 py-2 text-xs">
                  {done === 0 ? "Start" : done === ids.length ? "Review" : "Continue"}
                  <Icon name="arrow" className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="card mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Three ways into every unit</h2>
        <div className="mt-3 grid gap-4 text-sm text-muted sm:grid-cols-3">
          <div>
            <p className="font-semibold text-cream">Words — picture → sound → word</p>
            <p className="mt-1">Every new word lands on an image and a native voice before it lands on anything written.</p>
          </div>
          <div>
            <p className="font-semibold text-cream">Speaking — you talk, it grades</p>
            <p className="mt-1">The microphone drill compares what you said with the native line and shows what it missed.</p>
          </div>
          <div>
            <p className="font-semibold text-cream">Reading — the letters themselves</p>
            <p className="mt-1">Hiragana and Thai letters get their own lessons, taught as sounds rather than as a chart.</p>
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

const SPEAKING_VARIANTS = [0, 1, 2, 3] as const;

const TRACKS: { id: Track; label: string; hint: string }[] = [
  { id: "words", label: "Words", hint: "picture → sound → word" },
  { id: "speak", label: "Speaking", hint: "you talk, it grades" },
  { id: "read", label: "Reading", hint: "letters and sounds" },
];

const TRACK_TONES: Record<Track, string> = { words: "gold", speak: "sakura", read: "sky" };

function MilestoneMarker({ complete, detail, label = "Intermediate milestone" }: { complete: boolean; detail: string; label?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <div className={cn("h-px flex-1 bg-gradient-to-r from-transparent", complete ? "to-jade/40" : "to-violet/40")} />
      <Badge tone={complete ? "jade" : "violet"}>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="bolt" className="h-3 w-3" />
          {label}
        </span>
      </Badge>
      <span className="hidden text-[11px] text-muted sm:inline">{detail}</span>
      <div className={cn("h-px flex-1 bg-gradient-to-l from-transparent", complete ? "to-jade/40" : "to-violet/40")} />
    </div>
  );
}

export function CourseMap({ courseId }: { courseId: string }) {
  const course = getCourse(courseId);
  const { progress } = useProgress();
  const [track, setTrack] = useState<Track>("words");

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

  const ids = trackLessonIds(course, track);
  const done = ids.filter((id) => progress.completed[id]).length;
  const percent = ids.length === 0 ? 0 : done / ids.length;
  const tint = course.units[0]?.tint ?? "gold";
  const readingGlyph = course.id === "ja" ? "あ" : course.id === "th" ? "ก" : "Aa";
  const trackLabels: Record<Track, string> = { words: "Words", speak: "Speaking", read: "Reading" };
  const nextId = ids.find((id) => !progress.completed[id]);
  const nextSummary = nextId ? lessonSummary(course, nextId) : undefined;
  const allIds = allCourseLessonIds(course);
  const totalDone = allIds.filter((id) => progress.completed[id]).length;
  const overallPercent = allIds.length === 0 ? 0 : totalDone / allIds.length;

  const milestoneUnitIndex = course.units.findIndex((unit) => unit.stage === "intermediate");
  const advancedUnitIndex = course.units.findIndex((unit) => unit.stage === "advanced");
  const milestoneReadingIndex = course.reading.findIndex((lesson) => lesson.stage === "intermediate");
  const advancedReadingIndex = course.reading.findIndex((lesson) => lesson.stage === "advanced");
  const intermediateUnits = course.units.filter((unit) => unit.stage === "intermediate");
  const advancedUnits = course.units.filter((unit) => unit.stage === "advanced");
  const intermediateReading = course.reading.filter((lesson) => lesson.stage === "intermediate");
  const advancedReading = course.reading.filter((lesson) => lesson.stage === "advanced");
  const intermediateSpeakingIds = intermediateUnits.flatMap((unit) => SPEAKING_VARIANTS.map((variant) => speakingLessonId(unit, variant)));
  const advancedSpeakingIds = advancedUnits.flatMap((unit) => SPEAKING_VARIANTS.map((variant) => speakingLessonId(unit, variant)));
  const milestoneIds = [
    ...intermediateUnits.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)),
    ...intermediateReading.map((lesson) => lesson.id),
    ...intermediateSpeakingIds,
  ];
  const advancedIds = [
    ...advancedUnits.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)),
    ...advancedReading.map((lesson) => lesson.id),
    ...advancedSpeakingIds,
  ];
  const milestoneDone = milestoneIds.filter((id) => progress.completed[id]).length;
  const milestonePercent = milestoneIds.length === 0 ? 0 : milestoneDone / milestoneIds.length;
  const milestoneUnitsDone = intermediateUnits.filter((unit) => unit.lessons.every((lesson) => progress.completed[lesson.id])).length;
  const milestoneReadingDone = intermediateReading.filter((lesson) => progress.completed[lesson.id]).length;
  const milestoneSpeakingDone = intermediateSpeakingIds.filter((id) => progress.completed[id]).length;
  const milestoneStarted = milestoneDone > 0;
  const milestoneReached = milestoneIds.length > 0 && milestoneDone === milestoneIds.length;
  const advancedDone = advancedIds.filter((id) => progress.completed[id]).length;
  const advancedPercent = advancedIds.length === 0 ? 0 : advancedDone / advancedIds.length;
  const advancedUnitsDone = advancedUnits.filter((unit) => unit.lessons.every((lesson) => progress.completed[lesson.id])).length;
  const advancedReadingDone = advancedReading.filter((lesson) => progress.completed[lesson.id]).length;
  const advancedSpeakingDone = advancedSpeakingIds.filter((id) => progress.completed[id]).length;
  const advancedStarted = advancedDone > 0;
  const advancedReached = advancedIds.length > 0 && advancedDone === advancedIds.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/learn" className="inline-flex items-center gap-2 text-xs text-muted transition hover:text-cream">
          <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
          All courses
        </Link>
        <Link
          href={`/learn/${course.id}/placement`}
          className="inline-flex items-center gap-1.5 rounded-full border border-violet/35 bg-violet/10 px-3 py-1.5 text-[11px] font-semibold text-violet transition hover:border-violet/60 hover:bg-violet/15"
        >
          <Icon name="bolt" className="h-3.5 w-3.5" />
          {progress.placement?.[course.id] ? "Retake placement" : "Placement test"}
        </Link>
      </div>

      <header className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{course.flag}</span>
            <Badge tone={course.primary ? "jade" : "muted"}>{course.primary ? "flagship" : "same method"}</Badge>
            {progress.placement?.[course.id] ? <Badge tone="violet">placed at intermediate</Badge> : null}
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
            <p className="text-cream">
              {done} of {ids.length} · {trackLabels[track].toLowerCase()}
            </p>
            <p className="text-muted">
              Level {levelFor(progress.xp)} · <span className={scriptClass[course.id]}>{rankFor(course, progress.xp)}</span>
            </p>
            <div className="mt-2">
              <ProgressBar value={percent} tone={course.id === "ja" ? "sakura" : "gold"} />
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-3 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-3xl border border-line/70 bg-panel/40 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Progress summary</p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {totalDone}
                <span className="text-base font-normal text-muted"> / {allIds.length}</span>
              </p>
              <p className="text-xs text-muted">lessons complete across all three tracks</p>
            </div>
            <span className="rounded-2xl border border-jade/30 bg-jade/10 px-3 py-2 text-right">
              <span className="block font-display text-xl font-semibold text-jade">{Math.round(overallPercent * 100)}%</span>
              <span className="text-[10px] uppercase tracking-wide text-muted">course</span>
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {TRACKS.map((option) => {
              const summaryIds = trackLessonIds(course, option.id);
              const summaryDone = summaryIds.filter((id) => progress.completed[id]).length;
              const summaryPercent = summaryIds.length === 0 ? 0 : summaryDone / summaryIds.length;
              return (
                <div key={option.id} className="rounded-2xl border border-line/60 bg-ink/20 p-3">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold text-cream">{option.label}</span>
                    <span className="text-muted">{summaryDone}/{summaryIds.length}</span>
                  </div>
                  <ProgressBar className="mt-2" value={summaryPercent} tone={TRACK_TONES[option.id]} />
                </div>
              );
            })}
          </div>
        </div>

        <div className={cn("relative overflow-hidden rounded-3xl border p-5", milestoneReached ? "border-jade/40 bg-jade/[0.07]" : "border-violet/30 bg-violet/[0.07]")}>
          <div className={cn("pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full blur-2xl", milestoneReached ? "bg-jade/20" : "bg-violet/20")} />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <span className={cn("grid h-9 w-9 place-items-center rounded-xl border", milestoneReached ? "border-jade/40 bg-jade/15 text-jade" : "border-violet/40 bg-violet/15 text-violet")}>
                <Icon name="bolt" className="h-4 w-4" />
              </span>
              <Badge tone={milestoneReached ? "jade" : "violet"}>
                {milestoneReached ? "reached" : milestoneStarted ? "in progress" : "up next"}
              </Badge>
            </div>
            <p className={cn("mt-3 text-[11px] uppercase tracking-[0.2em]", milestoneReached ? "text-jade" : "text-violet")}>Intermediate milestone</p>
            <p className="mt-1 font-display text-xl font-semibold">The deeper half of the course.</p>
            <p className="mt-1 text-xs text-muted">
              Finish the final units, the second reading stretch, and its speaking reviews.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-muted">
              <span><strong className="text-cream">{milestoneUnitsDone}/{intermediateUnits.length}</strong> units</span>
              <span><strong className="text-cream">{milestoneReadingDone}/{intermediateReading.length}</strong> reading</span>
              <span><strong className="text-cream">{milestoneSpeakingDone}/{intermediateSpeakingIds.length}</strong> speaking</span>
            </div>
            <ProgressBar className="mt-3" value={milestonePercent} tone={milestoneReached ? "jade" : "violet"} />
          </div>
        </div>
      </section>

      <section className="mt-3">
        <div className={cn("relative overflow-hidden rounded-3xl border p-5", advancedReached ? "border-jade/40 bg-jade/[0.07]" : "border-gold/30 bg-gold/[0.06]")}>
          <div className={cn("pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full blur-2xl", advancedReached ? "bg-jade/20" : "bg-gold/20")} />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={cn("grid h-9 w-9 place-items-center rounded-xl border", advancedReached ? "border-jade/40 bg-jade/15 text-jade" : "border-gold/40 bg-gold/15 text-gold")}>
                <Icon name="bolt" className="h-4 w-4" />
              </span>
              <div>
                <p className={cn("text-[11px] uppercase tracking-[0.2em]", advancedReached ? "text-jade" : "text-gold")}>Advanced milestone</p>
                <p className="mt-1 font-display text-xl font-semibold">The final stretch.</p>
              </div>
            </div>
            <Badge tone={advancedReached ? "jade" : "gold"}>{advancedReached ? "reached" : advancedStarted ? "in progress" : "up next"}</Badge>
          </div>
          <p className="mt-3 max-w-2xl text-xs text-muted">Finish the advanced units, the third reading set, and its speaking reviews.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-muted sm:max-w-lg">
            <span><strong className="text-cream">{advancedUnitsDone}/{advancedUnits.length}</strong> units</span>
            <span><strong className="text-cream">{advancedReadingDone}/{advancedReading.length}</strong> reading</span>
            <span><strong className="text-cream">{advancedSpeakingDone}/{advancedSpeakingIds.length}</strong> speaking</span>
          </div>
          <ProgressBar className="mt-3" value={advancedPercent} tone={advancedReached ? "jade" : "gold"} />
        </div>
      </section>

      <div className="mt-6 grid gap-2 rounded-3xl border border-line/70 bg-panel/40 p-2 sm:grid-cols-3">
        {TRACKS.map((option) => {
          const trackIds = trackLessonIds(course, option.id);
          const trackDone = trackIds.filter((id) => progress.completed[id]).length;
          const active = option.id === track;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTrack(option.id)}
              aria-pressed={active}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition",
                active ? "border-jade/50 bg-jade/[0.1]" : "border-transparent hover:bg-panel2/60",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className={cn("grid h-6 w-6 place-items-center rounded-lg border text-[11px]", active ? "border-jade/40 bg-jade/15 text-jade" : "border-line bg-ink/40 text-muted")}>
                  {option.id === "words" ? "◧" : option.id === "speak" ? "◉" : readingGlyph}
                </span>
                {option.label}
                <span className={cn("ml-auto text-[11px] font-normal", active ? "text-jade" : "text-muted")}>
                  {trackDone}/{trackIds.length}
                </span>
              </span>
              <span className="mt-1 block pl-8 text-[11px] text-muted">{option.hint}</span>
            </button>
          );
        })}
      </div>

      {nextSummary && (
        <Link
          href={`/learn/${course.id}/${nextSummary.id}`}
          className="card mt-5 flex items-center justify-between gap-4 border-jade/30 p-5 transition hover:border-jade/60"
        >
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-jade">Next up · {trackLabels[track]}</p>
            <p className={cn("mt-1 truncate font-display text-xl", scriptClass[course.id])}>{nextSummary.title}</p>
            <p className="truncate text-xs text-muted">{nextSummary.intro}</p>
          </div>
          <span className="btn btn-primary h-12 w-12 shrink-0">
            <Icon name="arrow" className="h-5 w-5" />
          </span>
        </Link>
      )}

      {track === "words" && (
        <div className="mt-8 space-y-8">
          {course.units.map((unit, unitIndex) => {
            const unitTint = tintClass[unit.tint];
            return (
              <div key={unit.id}>
                {unitIndex === milestoneUnitIndex && (
                  <MilestoneMarker
                    label="Intermediate milestone"
                    complete={milestoneUnitsDone === intermediateUnits.length}
                    detail={`${milestoneUnitsDone}/${intermediateUnits.length} units done`}
                  />
                )}
                {unitIndex === advancedUnitIndex && (
                  <MilestoneMarker
                    label="Advanced milestone"
                    complete={advancedUnitsDone === advancedUnits.length}
                    detail={`${advancedUnitsDone}/${advancedUnits.length} units done`}
                  />
                )}
                <section>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn("grid h-11 w-11 place-items-center rounded-2xl border bg-panel/60 text-xl", unitTint.border)}>{unit.glyph}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className={cn("font-display text-lg font-semibold", scriptClass[course.id])}>{unit.title}</h2>
                        {unit.stage === "intermediate" && <Badge tone="violet">intermediate</Badge>}
                        {unit.stage === "advanced" && <Badge tone="gold">advanced</Badge>}
                      </div>
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
                    const isNext = nextId === lesson.id;
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
                            {record
                              ? record.skipped
                                ? " · placed"
                                : ` · best ${record.best}%`
                              : lesson.kind === "checkpoint"
                                ? " · unit review"
                                : ""}
                          </p>
                        </div>
                        {isNext && <Badge tone="jade">next</Badge>}
                        <SpeakButton text={lesson.title} locale={course.locale} rate={progress.settings.rate} variant="plain" size="sm" />
                      </Link>
                    );
                  })}
                </div>
                </section>
              </div>
            );
          })}
        </div>
      )}

      {track === "speak" && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2 text-xs text-muted">
            <Icon name="mic" className="h-4 w-4" />
            Say each word out loud. The app listens through your microphone and scores the attempt — no multiple choice here.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {course.units.flatMap((unit) =>
              SPEAKING_VARIANTS.map((variant) => {
                const id = speakingLessonId(unit, variant);
                const record = progress.completed[id];
                const wordCount = new Set(unit.lessons.flatMap((lesson) => lesson.newLexemes)).size;
                return (
                  <Link
                    key={id}
                    href={`/learn/${course.id}/${id}`}
                    className={cn(
                      "card-soft group p-5 transition hover:-translate-y-0.5 hover:border-jade/40",
                      record ? "border-jade/25" : "border-line/70",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl border border-line/70 bg-ink/40 text-xl">{unit.glyph}</span>
                      {record ? <Badge tone="jade">best {record.best}%</Badge> : <Badge tone="muted">not yet</Badge>}
                    </div>
                    <p className={cn("mt-3 font-display text-lg font-semibold", scriptClass[course.id])}>{speakingLessonTitle(course, unit, variant)}</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted">{unit.latin} · speaking{variant === 1 ? " review" : variant > 1 ? ` review ${variant}` : ""}</p>
                    <p className="mt-2 text-xs text-muted">
                      {wordCount} words and two sentences from this unit. Native audio first, then your turn.
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] text-jade">
                      <Icon name="mic" className="h-3.5 w-3.5" />
                      {record ? "Practise again" : "Start speaking"}
                    </p>
                  </Link>
                );
              }),
            )}
          </div>
        </div>
      )}

      {track === "read" && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2 text-xs text-muted">
            <span className={cn("grid h-6 w-6 place-items-center rounded-lg border border-line bg-ink/40 text-[11px]", scriptClass[course.id])}>{readingGlyph}</span>
            Letters first, then words. Every sound is voiced, and every letter comes with a word you already know.
          </div>
          <div className="space-y-2.5">
            {course.reading.map((lesson, index) => {
              const record = progress.completed[lesson.id];
              return (
                <div key={lesson.id}>
                  {index === milestoneReadingIndex && (
                    <MilestoneMarker
                      label="Intermediate milestone"
                      complete={milestoneReadingDone === intermediateReading.length}
                      detail={`${milestoneReadingDone}/${intermediateReading.length} reading lessons done`}
                    />
                  )}
                  {index === advancedReadingIndex && (
                    <MilestoneMarker
                      label="Advanced milestone"
                      complete={advancedReadingDone === advancedReading.length}
                      detail={`${advancedReadingDone}/${advancedReading.length} reading lessons done`}
                    />
                  )}
                  <Link
                    href={`/learn/${course.id}/${lesson.id}`}
                    className={cn(
                      "group flex items-start gap-4 rounded-2xl border p-4 transition",
                      record ? "border-line/60 bg-panel/40" : "border-line/80 bg-panel/60 hover:border-jade/40",
                    )}
                  >
                  <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-line bg-ink/40 text-lg", scriptClass[course.id])}>
                    {lesson.title.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("truncate font-medium", scriptClass[course.id])}>{lesson.title}</p>
                      {record && <Badge tone="jade">done</Badge>}
                    </div>
                    <p className="truncate text-[11px] uppercase tracking-wide text-muted">
                      {index + 1} · {lesson.latin}
                    </p>
                    <p className="mt-1 text-xs text-muted">{lesson.intro}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {lesson.symbols.length} letters · {lesson.symbols.filter((symbol) => symbol.example).length} example words
                    </p>
                  </div>
                  <Icon name="arrow" className="mt-2 h-4 w-4 shrink-0 text-muted transition group-hover:text-cream" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-[11px] text-muted">
        {totalCourseLessons(course)} lessons · {course.scriptLabel} · every word voiced by a native speaker
      </p>
    </div>
  );
}
