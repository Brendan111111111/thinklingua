"use client";

import { useEffect, useState } from "react";
import type { Course, LangId } from "./content/types";

export const HEART_MAX = 5;
export const HEART_REFILL_MS = 5 * 60 * 1000;
const STORE_KEY = "thinklingua.v1";

export type DayStat = { xp: number; lessons: number; answers: number; perfect: number };
export type Settings = { rate: number; latin: boolean; autoPlay: boolean; voice: string };
export type Card = { id: string; due: number; interval: number; ease: number; lapses: number };

export type Progress = {
  v: 1;
  active: LangId;
  xp: number;
  hearts: number;
  heartsAt: number;
  streak: number;
  best: number;
  lastDay: string | null;
  mono: number;
  bestMono: number;
  completed: Record<string, { best: number; at: number; skipped?: boolean }>;
  placement: Partial<Record<LangId, { score: number; at: number }>>;
  srs: Record<string, Card>;
  achievements: string[];
  days: Record<string, DayStat>;
  stats: { answers: number; correct: number; ear: number; earCorrect: number; peeks: number; chats: number };
  settings: Settings;
};

export const EMPTY_PROGRESS: Progress = {
  v: 1,
  active: "th",
  xp: 0,
  hearts: HEART_MAX,
  heartsAt: 0,
  streak: 0,
  best: 0,
  lastDay: null,
  mono: 0,
  bestMono: 0,
  completed: {},
  placement: {},
  srs: {},
  achievements: [],
  days: {},
  stats: { answers: 0, correct: 0, ear: 0, earCorrect: 0, peeks: 0, chats: 0 },
  settings: { rate: 1, latin: false, autoPlay: true, voice: "auto" },
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDay(key: string, delta: number): string {
  const [year, month, day] = key.split("-").map(Number);
  return dayKey(new Date(year, (month ?? 1) - 1, (day ?? 1) + delta));
}

/* ── store plumbing ────────────────────────────────────────────────────── */
let state: Progress = EMPTY_PROGRESS;
let loaded = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — keep session state in memory */
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function hydrate(): Progress {
  if (loaded || typeof window === "undefined") return state;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Progress>;
      state = {
        ...EMPTY_PROGRESS,
        ...parsed,
        placement: { ...EMPTY_PROGRESS.placement, ...(parsed.placement ?? {}) },
        settings: { ...EMPTY_PROGRESS.settings, ...(parsed.settings ?? {}) },
        stats: { ...EMPTY_PROGRESS.stats, ...(parsed.stats ?? {}) },
      };
    }
  } catch {
    state = { ...EMPTY_PROGRESS };
  }
  state = regenHearts(state, Date.now());
  return state;
}

function regenHearts(progress: Progress, now: number): Progress {
  if (progress.hearts >= HEART_MAX) {
    return progress.heartsAt === now ? progress : { ...progress, heartsAt: now };
  }
  const elapsed = now - progress.heartsAt;
  const gained = Math.floor(elapsed / HEART_REFILL_MS);
  if (gained <= 0) return progress;
  const hearts = Math.min(HEART_MAX, progress.hearts + gained);
  return { ...progress, hearts, heartsAt: hearts >= HEART_MAX ? now : progress.heartsAt + gained * HEART_REFILL_MS };
}

export function getProgress(): Progress {
  const hydrated = hydrate();
  const next = regenHearts(hydrated, Date.now());
  if (next !== hydrated) state = next;
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function update(recipe: (progress: Progress) => Progress) {
  const current = getProgress();
  const next = recipe(current);
  if (next === current) return;
  state = next;
  persist();
  emit();
}

/** Hydration-safe hook: `ready` is false until the client store is mounted. */
export function useProgress(): { progress: Progress; ready: boolean } {
  const [snapshot, setSnapshot] = useState<Progress | null>(null);

  useEffect(() => {
    setSnapshot(getProgress());
    const unsubscribe = subscribe(() => setSnapshot(getProgress()));
    return unsubscribe;
  }, []);

  return { progress: snapshot ?? EMPTY_PROGRESS, ready: snapshot !== null };
}

/* ── derived values ────────────────────────────────────────────────────── */
export function levelFor(xp: number): number {
  return Math.floor(xp / 120) + 1;
}

export function levelProgress(xp: number): number {
  return (xp % 120) / 120;
}

export function rankFor(course: Course, xp: number): string {
  const level = levelFor(xp);
  const index = Math.min(course.ranks.length - 1, Math.floor((level - 1) / 2));
  return course.ranks[index];
}

export function heartsNow(progress: Progress): number {
  return regenHearts(progress, Date.now()).hearts;
}

export function todayStat(progress: Progress): DayStat {
  return progress.days[dayKey()] ?? { xp: 0, lessons: 0, answers: 0, perfect: 0 };
}

/* ── mutations ─────────────────────────────────────────────────────────── */
export function setActiveLanguage(lang: LangId) {
  update((progress) => (progress.active === lang ? progress : { ...progress, active: lang }));
}

/** Mark a placement-test result without granting lesson XP or streak credit. */
export function placeAtIntermediate(lang: LangId, lessonIds: string[], score: number) {
  update((progress) => {
    const now = Date.now();
    const completed = { ...progress.completed };
    for (const id of lessonIds) {
      const existing = completed[id];
      completed[id] = {
        best: Math.max(existing?.best ?? 0, 100),
        at: existing?.at ?? now,
        skipped: true,
      };
    }
    return {
      ...progress,
      active: lang,
      completed,
      placement: { ...progress.placement, [lang]: { score, at: now } },
    };
  });
}

function todays(progress: Progress): [string, DayStat] {
  const key = dayKey();
  return [key, progress.days[key] ?? { xp: 0, lessons: 0, answers: 0, perfect: 0 }];
}

export function spendHeart(): number {
  const now = Date.now();
  const current = getProgress();
  const before = current.hearts >= HEART_MAX ? now : current.heartsAt;
  const hearts = Math.max(0, current.hearts - 1);
  update((progress) => ({ ...progress, hearts, heartsAt: before }));
  return hearts;
}

export function refillHearts(amount = 2) {
  update((progress) => ({ ...progress, hearts: Math.min(HEART_MAX, progress.hearts + amount) }));
}

export function recordPeek() {
  update((progress) => ({ ...progress, stats: { ...progress.stats, peeks: progress.stats.peeks + 1 } }));
}

/** SRS scheduling (Leitner-style with an ease factor). */
function schedule(card: Card | undefined, correct: boolean, now: number): Card {
  const base: Card = card ?? { id: "", due: now, interval: 0, ease: 2.4, lapses: 0 };
  if (correct) {
    const interval = base.interval < 1 ? 1 : Math.min(180, Math.round(base.interval * base.ease));
    return {
      ...base,
      interval,
      ease: Math.min(2.9, base.ease + 0.05),
      due: now + interval * DAY_MS,
      lapses: base.lapses,
    };
  }
  return { ...base, interval: 1, ease: Math.max(1.5, base.ease - 0.2), due: now + 10 * 60 * 1000, lapses: base.lapses + 1 };
}

export function recordAnswer(options: {
  correct: boolean;
  lexemeId?: string;
  ear?: boolean;
  xp?: number;
}): void {
  const now = Date.now();
  update((progress) => {
    const [key, day] = todays(progress);
    const gained = options.correct ? (options.xp ?? 10) : 2;
    return {
      ...progress,
      xp: progress.xp + gained,
      days: {
        ...progress.days,
        [key]: {
          ...day,
          xp: day.xp + gained,
          answers: day.answers + 1,
          perfect: day.perfect + (options.correct ? 1 : 0),
        },
      },
      stats: {
        ...progress.stats,
        answers: progress.stats.answers + 1,
        correct: progress.stats.correct + (options.correct ? 1 : 0),
        ear: progress.stats.ear + (options.ear ? 1 : 0),
        earCorrect: progress.stats.earCorrect + (options.ear && options.correct ? 1 : 0),
      },
      srs:
        options.lexemeId && progress.srs[options.lexemeId] !== undefined
          ? { ...progress.srs, [options.lexemeId]: { ...schedule(progress.srs[options.lexemeId], options.correct, now), id: options.lexemeId } }
          : options.lexemeId
            ? { ...progress.srs, [options.lexemeId]: { ...schedule(undefined, options.correct, now), id: options.lexemeId } }
            : progress.srs,
    };
  });
}

export type LessonResult = {
  xpGained: number;
  perfect: boolean;
  monolingual: number;
  streak: number;
  best: number;
  multiplier: number;
  unlocked: string[];
  levelUp: boolean;
};

export function completeLesson(input: {
  lessonId: string;
  score: number;
  total: number;
  peeks: number;
  earTotal: number;
  earCorrect: number;
}): LessonResult {
  const now = Date.now();
  const before = getProgress();
  const beforeLevel = levelFor(before.xp);
  const today = dayKey();
  const perfect = input.total > 0 && input.score >= input.total;

  let result: LessonResult = {
    xpGained: 0,
    perfect,
    monolingual: before.mono,
    streak: before.streak,
    best: before.best,
    multiplier: 1,
    unlocked: [],
    levelUp: false,
  };

  update((progress) => {
    const mono = input.peeks === 0 ? progress.mono + 1 : 0;
    const multiplier = 1 + Math.min(mono, 5) * 0.1;
    const bonus = Math.round((perfect ? 45 : 28) * multiplier);
    const streakActive = progress.lastDay !== today;
    const streak = streakActive
      ? progress.lastDay === shiftDay(today, -1)
        ? progress.streak + 1
        : 1
      : progress.streak;
    const [key, day] = todays(progress);

    const next: Progress = {
      ...progress,
      xp: progress.xp + bonus,
      streak,
      best: Math.max(progress.best, streak),
      lastDay: today,
      mono,
      bestMono: Math.max(progress.bestMono, mono),
      completed: {
        ...progress.completed,
        [input.lessonId]: {
          best: Math.max(progress.completed[input.lessonId]?.best ?? 0, Math.round((input.score / Math.max(1, input.total)) * 100)),
          at: now,
        },
      },
      days: {
        ...progress.days,
        [key]: { ...day, lessons: day.lessons + 1, xp: day.xp + bonus },
      },
    };

    const unlocked = evaluateAchievements(next, { earTotal: input.earTotal, earCorrect: input.earCorrect, perfect });
    next.achievements = [...new Set([...next.achievements, ...unlocked])];

    result = {
      xpGained: bonus,
      perfect,
      monolingual: mono,
      streak,
      best: Math.max(progress.best, streak),
      multiplier,
      unlocked,
      levelUp: levelFor(next.xp) > beforeLevel,
    };
    return next;
  });

  return result;
}

export function noteChat() {
  update((progress) => ({ ...progress, stats: { ...progress.stats, chats: progress.stats.chats + 1 } }));
}

export function saveSettings(patch: Partial<Settings>) {
  update((progress) => ({ ...progress, settings: { ...progress.settings, ...patch } }));
}

export function resetProgress() {
  const fresh: Progress = { ...EMPTY_PROGRESS, active: getProgress().active, settings: getProgress().settings };
  state = fresh;
  persist();
  emit();
}

/* ── achievements ──────────────────────────────────────────────────────── */
export type Achievement = {
  id: string;
  glyph: string;
  title: string;
  detail: string;
  check: (progress: Progress, context: { earTotal: number; earCorrect: number; perfect: boolean }) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", glyph: "🌱", title: "First step", detail: "Finish your first lesson", check: (p) => Object.keys(p.completed).length >= 1 },
  { id: "no-english", glyph: "🧠", title: "No translator", detail: "Finish a lesson without peeking", check: (p) => p.mono >= 1 },
  { id: "three-in-a-row", glyph: "🔗", title: "Thinking streak", detail: "Three lessons with zero peeks in a row", check: (p) => p.mono >= 3 },
  { id: "ear-opened", glyph: "👂", title: "Open ear", detail: "Get 10 listening drills right", check: (p) => p.stats.earCorrect >= 10 },
  { id: "hundred-club", glyph: "💯", title: "Hundred club", detail: "Reach 100 XP", check: (p) => p.xp >= 100 },
  { id: "five-hundred", glyph: "🏅", title: "Five hundred", detail: "Reach 500 XP", check: (p) => p.xp >= 500 },
  { id: "daily-three", glyph: "🔥", title: "Three days lit", detail: "Keep a 3-day streak", check: (p) => p.streak >= 3 },
  { id: "weekly", glyph: "🗓️", title: "Seven days lit", detail: "Keep a 7-day streak", check: (p) => p.streak >= 7 },
  { id: "flawless", glyph: "💎", title: "Flawless", detail: "Finish a lesson with no mistakes", check: (_p, c) => c.perfect },
  { id: "tone-hunter", glyph: "🎚️", title: "Tone hunter", detail: "Win every listening drill in one lesson", check: (_p, c) => c.earTotal > 0 && c.earCorrect === c.earTotal },
  { id: "conversationalist", glyph: "💬", title: "Conversationalist", detail: "Start a chat with the AI partner", check: (p) => p.stats.chats >= 1 },
  { id: "polyglot", glyph: "🌍", title: "Polyglot brain", detail: "Reach 120 XP", check: (p) => p.xp >= 120 },
];

export function evaluateAchievements(
  progress: Progress,
  context: { earTotal: number; earCorrect: number; perfect: boolean },
): string[] {
  return ACHIEVEMENTS.filter((achievement) => !progress.achievements.includes(achievement.id) && achievement.check(progress, context)).map(
    (achievement) => achievement.id,
  );
}

export function questProgress(progress: Progress) {
  const day = todayStat(progress);
  return [
    { id: "xp", label: "Earn 40 XP today", value: Math.min(day.xp, 40), target: 40, glyph: "⚡" },
    { id: "lessons", label: "Finish 2 lessons", value: Math.min(day.lessons, 2), target: 2, glyph: "📘" },
    { id: "answers", label: "Answer 15 drills", value: Math.min(day.answers, 15), target: 15, glyph: "🎯" },
  ];
}

export function dueLexemes(progress: Progress, ids: string[], limit = 12): string[] {
  const now = Date.now();
  const due = ids
    .map((id) => progress.srs[id])
    .filter((card): card is Card => Boolean(card) && card!.due <= now)
    .sort((a, b) => a.due - b.due)
    .map((card) => card.id)
    .slice(0, limit);
  if (due.length > 0) return due;
  return ids.slice(0, Math.min(limit, 8));
}
