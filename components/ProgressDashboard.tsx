"use client";

import Link from "next/link";
import { allCourseLessonIds, courses, getCourse, scriptClass } from "@/lib/content";
import {
  ACHIEVEMENTS,
  HEART_MAX,
  dayKey,
  heartsNow,
  levelFor,
  levelProgress,
  questProgress,
  rankFor,
  useProgress,
} from "@/lib/progress";
import { Badge, Icon, ProgressBar, Ring, cn } from "./ui";

function lastDays(count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return dayKey(date);
  });
}

export function ProgressDashboard() {
  const { progress, ready } = useProgress();

  if (!ready) {
    return (
      <div className="space-y-4">
        <div className="card h-40 animate-pulse bg-panel/40" />
        <div className="card h-56 animate-pulse bg-panel/40" />
      </div>
    );
  }

  const course = getCourse(progress.active) ?? courses[0];
  const level = levelFor(progress.xp);
  const days = lastDays(28);
  const quests = questProgress(progress);
  const hearts = heartsNow(progress);
  const accuracy = progress.stats.answers === 0 ? 0 : Math.round((progress.stats.correct / progress.stats.answers) * 100);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-jade">Progress</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          You think in <span className={scriptClass[course.id]}>{course.name}</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Level {level} · <span className={scriptClass[course.id]}>{rankFor(course, progress.xp)}</span> · {progress.xp} XP total
        </p>
      </header>

      <section className="card p-6">
        <div className="flex flex-wrap items-center gap-6">
          <Ring value={levelProgress(progress.xp)} size={96} stroke={7} tone="#3de0ae">
            <span className="font-display text-xl font-semibold">{level}</span>
          </Ring>
          <div className="min-w-[180px] flex-1">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-lg">Next level</p>
              <p className="text-xs text-muted">{120 - (progress.xp % 120)} XP to go</p>
            </div>
            <ProgressBar value={levelProgress(progress.xp)} className="mt-2" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">Streak</p>
                <p className="flex items-center gap-1 font-display text-xl text-gold">
                  <Icon name="flame" className="h-4 w-4" /> {progress.streak}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">Best</p>
                <p className="font-display text-xl text-gold">{progress.best}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">Focus</p>
                <p className="flex items-center gap-1 font-display text-xl text-sakura">
                  <Icon name="heart" className="h-4 w-4" /> {hearts}/{HEART_MAX}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">Accuracy</p>
                <p className="font-display text-xl text-jade">{accuracy}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Last four weeks</h2>
          <span className="text-[11px] text-muted">darker = more XP</span>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const xp = progress.days[day]?.xp ?? 0;
            const intensity = xp === 0 ? "bg-line/40" : xp < 20 ? "bg-jade/25" : xp < 60 ? "bg-jade/55" : "bg-jade";
            return (
              <div
                key={day}
                title={`${day} · ${xp} XP`}
                className={cn("week-cell border border-line/30", intensity)}
              />
            );
          })}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-semibold">Today&apos;s quests</h2>
        <div className="mt-4 space-y-4">
          {quests.map((quest) => (
            <div key={quest.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span>{quest.glyph}</span>
                  {quest.label}
                </span>
                <span className={cn("text-xs", quest.value >= quest.target ? "text-jade" : "text-muted")}>
                  {quest.value}/{quest.target}
                </span>
              </div>
              <ProgressBar value={quest.value / quest.target} className="mt-1.5 h-1.5" tone={quest.value >= quest.target ? "jade" : "gold"} />
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Achievements</h2>
          <span className="text-xs text-muted">
            {progress.achievements.length}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = progress.achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3 transition",
                  unlocked ? "border-jade/35 bg-jade/[0.07]" : "border-line/60 bg-panel/30 opacity-70",
                )}
              >
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg", unlocked ? "bg-jade/15" : "bg-line/40 grayscale")}>
                  {achievement.glyph}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{achievement.title}</p>
                  <p className="truncate text-[11px] text-muted">{achievement.detail}</p>
                </div>
                {unlocked && <Icon name="check" className="ml-auto h-4 w-4 shrink-0 text-jade" />}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-semibold">Languages</h2>
        <div className="mt-4 space-y-3">
          {courses.map((option) => {
            const ids = allCourseLessonIds(option);
            const done = ids.filter((id) => progress.completed[id]).length;
            const percent = ids.length === 0 ? 0 : done / ids.length;
            return (
              <Link key={option.id} href={`/learn/${option.id}`} className="block rounded-xl p-2 transition hover:bg-panel/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{option.flag}</span>
                    <span className={scriptClass[option.id]}>{option.name}</span>
                    {option.primary && <Badge tone="jade">primary</Badge>}
                  </span>
                  <span className="text-xs text-muted">
                    {done}/{ids.length}
                  </span>
                </div>
                <ProgressBar value={percent} className="mt-1.5 h-1.5" tone={option.id === "ja" ? "sakura" : option.id === "th" ? "gold" : "violet"} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-[11px] uppercase tracking-wide text-muted">No-English streak</p>
          <p className="font-display text-3xl text-jade">{progress.mono}</p>
          <p className="mt-1 text-xs text-muted">best {progress.bestMono}</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] uppercase tracking-wide text-muted">Ear drills won</p>
          <p className="font-display text-3xl text-gold">
            {progress.stats.earCorrect}
            <span className="text-base text-muted">/{progress.stats.ear}</span>
          </p>
          <p className="mt-1 text-xs text-muted">tone and mora perception</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] uppercase tracking-wide text-muted">Peeks</p>
          <p className="font-display text-3xl text-sakura">{progress.stats.peeks}</p>
          <p className="mt-1 text-xs text-muted">times you reached for English</p>
        </div>
      </section>
    </div>
  );
}
