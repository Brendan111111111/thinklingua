import { thai } from "./thai";
import { japanese } from "./japanese";
import { spanish } from "./spanish";
import { french } from "./french";
import type { Course, LangId, Lesson, ReadingLesson, Track, Unit } from "./types";

export type {
  Course,
  LangId,
  Lesson,
  LessonKind,
  Unit,
  Lexeme,
  Phrase,
  EarDrill,
  Track,
  ReadingLesson,
  ReadingSymbol,
} from "./types";

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

/** Speaking lessons are generated: one per unit, drawn from its words. */
export function speakingLessonId(unit: Unit): string {
  return `speak.${unit.id}`;
}

export function findSpeakingUnit(course: Course, lessonId: string): Unit | undefined {
  if (!lessonId.startsWith("speak.")) return undefined;
  return course.units.find((unit) => speakingLessonId(unit) === lessonId);
}

export function findReadingLesson(course: Course, lessonId: string): ReadingLesson | undefined {
  return course.reading.find((lesson) => lesson.id === lessonId);
}

/** Every lesson id in a track, in the order the course map shows them. */
export function trackLessonIds(course: Course, track: Track): string[] {
  if (track === "words") return allLessons(course).map(({ lesson }) => lesson.id);
  if (track === "speak") return course.units.map(speakingLessonId);
  return course.reading.map((lesson) => lesson.id);
}

export function trackLessonCount(course: Course, track: Track): number {
  return trackLessonIds(course, track).length;
}

export function totalCourseLessons(course: Course): number {
  return trackLessonIds(course, "words").length + trackLessonIds(course, "speak").length + trackLessonIds(course, "read").length;
}

export function allCourseLessonIds(course: Course): string[] {
  return [...trackLessonIds(course, "words"), ...trackLessonIds(course, "speak"), ...trackLessonIds(course, "read")];
}

/** Title/intro for any lesson id, used by the map and the next-up card. */
export function lessonSummary(
  course: Course,
  lessonId: string,
): { id: string; title: string; latin: string; intro: string; track: Track } | undefined {
  const word = findLesson(course, lessonId);
  if (word) {
    return { id: lessonId, title: word.lesson.title, latin: word.lesson.latin, intro: word.lesson.intro, track: "words" };
  }
  const unit = findSpeakingUnit(course, lessonId);
  if (unit) {
    return { id: lessonId, title: unit.title, latin: `${unit.latin} · speaking`, intro: `${unit.latin} — say what you know out loud.`, track: "speak" };
  }
  const reading = findReadingLesson(course, lessonId);
  if (reading) {
    return { id: lessonId, title: reading.title, latin: reading.latin, intro: reading.intro, track: "read" };
  }
  return undefined;
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
