import { thai } from "./thai";
import { japanese } from "./japanese";
import { spanish } from "./spanish";
import { french } from "./french";
import type { Course, LangId, Lesson, Unit } from "./types";

export type { Course, LangId, Lesson, LessonKind, Unit, Lexeme, Phrase, EarDrill } from "./types";

export const courses: Course[] = [thai, japanese, spanish, french];

const byId = new Map(courses.map((course) => [course.id, course]));

export function getCourse(id: string): Course | undefined {
  return byId.get(id as LangId);
}

export const primaryCourses = courses.filter((course) => course.primary);

export function allLessons(course: Course): { lesson: Lesson; unit: Unit }[] {
  return course.units.flatMap((unit) => unit.lessons.map((lesson) => ({ lesson, unit })));
}

export function findLesson(course: Course, lessonId: string): { lesson: Lesson; unit: Unit } | undefined {
  return allLessons(course).find(({ lesson }) => lesson.id === lessonId);
}

export function courseLessonCount(course: Course): number {
  return course.units.reduce((total, unit) => total + unit.lessons.length, 0);
}

export function lessonLexemes(course: Course, lesson: Lesson): string[] {
  if (lesson.newLexemes.length > 0) return lesson.newLexemes;
  return course.units
    .flatMap((unit) => unit.lessons)
    .filter((entry) => entry.id !== lesson.id)
    .flatMap((entry) => entry.newLexemes);
}

export function unitOf(course: Course, lessonId: string): Unit | undefined {
  return course.units.find((unit) => unit.lessons.some((lesson) => lesson.id === lessonId));
}

export function nextLesson(course: Course, completed: Record<string, unknown>): Lesson | undefined {
  return allLessons(course).find(({ lesson }) => !completed[lesson.id])?.lesson;
}

export const scriptClass: Record<LangId, string> = {
  th: "script-th",
  ja: "script-ja",
  es: "script-es",
  fr: "script-fr",
};

export const tintClass: Record<Unit["tint"], { text: string; ring: string; from: string; border: string }> = {
  gold: { text: "text-gold", ring: "ring-gold/40", from: "from-gold/25", border: "border-gold/30" },
  sakura: { text: "text-sakura", ring: "ring-sakura/40", from: "from-sakura/25", border: "border-sakura/30" },
  jade: { text: "text-jade", ring: "ring-jade/40", from: "from-jade/25", border: "border-jade/30" },
  sky: { text: "text-sky", ring: "ring-sky/40", from: "from-sky/25", border: "border-sky/30" },
  violet: { text: "text-violet", ring: "ring-violet/40", from: "from-violet/25", border: "border-violet/30" },
};
