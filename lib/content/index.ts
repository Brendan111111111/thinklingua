import { thai } from "./thai";
import { japanese } from "./japanese";
import { spanish } from "./spanish";
import { french } from "./french";
import { intermediateReadingByLanguage } from "./readingIntermediate";
import { expandLevels } from "./expansion";
import type { Course, LangId, Lesson, ReadingLesson, SpeakingVariant, Track, Unit } from "./types";

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

const PRACTICE_SUFFIX = ".practice";
const AGAIN: Record<LangId, string> = { th: "อีกครั้ง", ja: "もう一度", es: "otra vez", fr: "encore" };
const FOUR_SPEAKING_VARIANTS = [0, 1, 2, 3] as const;
const SIX_SPEAKING_VARIANTS = [0, 1, 2, 3, 4, 5] as const;

export function speakingVariantsForUnit(unit: Unit): readonly SpeakingVariant[] {
  return unit.stage === "mastery" ? SIX_SPEAKING_VARIANTS : FOUR_SPEAKING_VARIANTS;
}

function practiceLesson(course: Course, lesson: Lesson): Lesson {
  return {
    ...lesson,
    id: `${lesson.id}${PRACTICE_SUFFIX}`,
    title: `${lesson.title} · ${AGAIN[course.id]}`,
    latin: `${lesson.latin} · review`,
  };
}

function practiceReading(course: Course, lesson: ReadingLesson): ReadingLesson {
  return {
    ...lesson,
    id: `${lesson.id}${PRACTICE_SUFFIX}`,
    title: `${lesson.title} · ${AGAIN[course.id]}`,
    latin: `${lesson.latin} · review`,
  };
}

function withPractice(course: Course): Course {
  return {
    ...course,
    units: course.units.map((unit) => ({
      ...unit,
      lessons: unit.lessons.flatMap((lesson) => [lesson, practiceLesson(course, lesson)]),
    })),
    reading: course.reading.flatMap((lesson) => [lesson, practiceReading(course, lesson)]),
  };
}

const CHECKPOINT: Record<LangId, { title: string; intro: string }> = {
  th: { title: "ทบทวน", intro: "ทบทวนทุกอย่างในบทนี้" },
  ja: { title: "復習", intro: "この章のぜんぶを、もう一度。" },
  es: { title: "Repaso", intro: "Repasa este capítulo." },
  fr: { title: "Révision", intro: "Révise ce chapitre." },
};

/** Older courses grow a checkpoint for every unit that does not have one yet. */
function ensureCheckpoints(course: Course): Course {
  return {
    ...course,
    units: course.units.map((unit) => {
      if (unit.lessons.some((lesson) => lesson.kind === "checkpoint")) return unit;
      const copy = CHECKPOINT[course.id];
      const checkpoint: Lesson = {
        id: `${unit.id}.l${unit.lessons.length + 1}`,
        title: copy.title,
        latin: "Checkpoint",
        intro: copy.intro,
        kind: "checkpoint",
        newLexemes: [],
        phrases: [...new Set(unit.lessons.flatMap((lesson) => lesson.phrases))],
        ear: unit.lessons.flatMap((lesson) => lesson.ear).slice(0, 2),
      };
      return { ...unit, lessons: [...unit.lessons, checkpoint] };
    }),
  };
}

function withIntermediateReading(course: Course): Course {
  const extra = intermediateReadingByLanguage[course.id];
  return extra.length > 0 ? { ...course, reading: [...course.reading, ...extra] } : course;
}

const sourceCourses: Course[] = [thai, japanese, spanish, french];
export const courses: Course[] = sourceCourses.map((course) =>
  withPractice(ensureCheckpoints(expandLevels(withIntermediateReading(course)))),
);

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

/** Speaking lessons are generated: four passes per unit, drawn from its words. */
export function speakingLessonId(unit: Unit, variant: SpeakingVariant = 0): string {
  if (variant === 0) return `speak.${unit.id}`;
  return variant === 1
    ? `speak.${unit.id}${PRACTICE_SUFFIX}`
    : `speak.${unit.id}${PRACTICE_SUFFIX}-${variant}`;
}

export function speakingVariantFor(lessonId: string): SpeakingVariant {
  if (lessonId.endsWith(`${PRACTICE_SUFFIX}-5`)) return 5;
  if (lessonId.endsWith(`${PRACTICE_SUFFIX}-4`)) return 4;
  if (lessonId.endsWith(`${PRACTICE_SUFFIX}-3`)) return 3;
  if (lessonId.endsWith(`${PRACTICE_SUFFIX}-2`)) return 2;
  if (lessonId.endsWith(PRACTICE_SUFFIX)) return 1;
  return 0;
}

export function speakingLessonTitle(course: Course, unit: Unit, variant: SpeakingVariant): string {
  if (variant === 0) return unit.title;
  const again = AGAIN[course.id];
  return `${unit.title} · ${again}${variant > 1 ? ` ${variant}` : ""}`;
}

export function findSpeakingUnit(course: Course, lessonId: string): Unit | undefined {
  if (!lessonId.startsWith("speak.")) return undefined;
  const base = lessonId.replace(/\.practice(?:-\d+)?$/, "");
  return course.units.find((unit) => speakingLessonId(unit) === base);
}

export function findReadingLesson(course: Course, lessonId: string): ReadingLesson | undefined {
  return course.reading.find((lesson) => lesson.id === lessonId);
}

/** Every lesson id in a track, in the order the course map shows them. */
export function trackLessonIds(course: Course, track: Track): string[] {
  if (track === "words") return allLessons(course).map(({ lesson }) => lesson.id);
  if (track === "speak")
    return course.units.flatMap((unit) => speakingVariantsForUnit(unit).map((variant) => speakingLessonId(unit, variant)));
  return course.reading.map((lesson) => lesson.id);
}

export function trackLessonCount(course: Course, track: Track): number {
  return trackLessonIds(course, track).length;
}

/** Audio-only production drills wait until every reading lesson is complete. */
export function hasCompletedReadingTrack(course: Course, completed: Record<string, unknown>): boolean {
  return course.reading.length > 0 && course.reading.every((lesson) => Boolean(completed[lesson.id]));
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
    const variant = speakingVariantFor(lessonId);
    return {
      id: lessonId,
      title: speakingLessonTitle(course, unit, variant),
      latin: `${unit.latin} · speaking${variant === 1 ? " review" : variant > 1 ? ` review ${variant}` : ""}`,
      intro: `${unit.latin} — say what you know out loud.`,
      track: "speak",
    };
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
