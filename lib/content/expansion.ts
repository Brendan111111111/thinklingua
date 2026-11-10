import type { Course, EarDrill, LangId, Lesson, ReadingLesson, Unit } from "./types";

type ExpansionCopy = {
  units: string[];
  lesson: string;
  intro: string;
  readingSuffix: string;
  advancedUnits: string[];
  advancedLesson: string;
  advancedIntro: string;
  advancedReadingSuffix: string;
};

const COPY: Record<LangId, ExpansionCopy> = {
  th: {
    units: ["ทบทวนกลาง", "ในเมือง", "ผู้คนและแผน", "สรุปกลาง"],
    lesson: "ฝึกเพิ่ม",
    intro: "ใช้คำที่รู้แล้วในสถานการณ์ใหม่",
    readingSuffix: "อ่านต่อ",
    advancedUnits: ["ความคิดเห็น", "เล่าเหตุการณ์", "สมมติฐาน", "งานและการเรียน", "วัฒนธรรม", "สื่อ", "แผนงาน", "การเจรจา", "สรุปขั้นสูง"],
    advancedLesson: "ฝึกขั้นสูง",
    advancedIntro: "ใช้ภาษาไทยให้ลึกและเป็นธรรมชาติขึ้น",
    advancedReadingSuffix: "อ่านขั้นสูง",
  },
  ja: {
    units: ["復習", "まちで", "人と予定", "中間まとめ"],
    lesson: "練習",
    intro: "知っている言葉で、もう一歩長い文を作る。",
    readingSuffix: "読み広げ",
    advancedUnits: ["意見と理由", "過去を語る", "仮定", "仕事と学び", "文化", "メディア", "計画", "交渉", "上級まとめ"],
    advancedLesson: "上級練習",
    advancedIntro: "知っている言葉で、より深い表現を作る。",
    advancedReadingSuffix: "上級読解",
  },
  es: {
    units: ["Repaso activo", "En la ciudad", "Personas y planes", "Cierre intermedio"],
    lesson: "Práctica",
    intro: "Usa lo que ya sabes en frases más largas.",
    readingSuffix: "lectura ampliada",
    advancedUnits: ["Debate y matices", "Narrar el pasado", "Hipótesis", "Opiniones", "Trabajo y estudio", "Cultura", "Medios", "Proyectos", "Cierre avanzado"],
    advancedLesson: "Práctica avanzada",
    advancedIntro: "Usa el idioma con más matices y precisión.",
    advancedReadingSuffix: "lectura avanzada",
  },
  fr: {
    units: ["Révision active", "En ville", "Personnes et projets", "Bilan intermédiaire"],
    lesson: "Pratique",
    intro: "Utilise ce que tu sais dans des phrases plus longues.",
    readingSuffix: "lecture élargie",
    advancedUnits: ["Débat et nuances", "Récit au passé", "Hypothèses", "Opinions", "Travail et études", "Culture", "Médias", "Projets", "Bilan avancé"],
    advancedLesson: "Pratique avancée",
    advancedIntro: "Utilise la langue avec plus de nuance et de précision.",
    advancedReadingSuffix: "lecture avancée",
  },
};

const UNIT_GLYPHS = ["🔁", "🏙️", "👥", "🏁"];
const ADVANCED_GLYPHS = ["🧠", "📖", "🔮", "🗣️", "💼", "🎭", "📰", "🤝", "🏆"];
const UNIT_TINTS: Unit["tint"][] = ["jade", "sky", "violet", "gold"];
const ADVANCED_CONTENT_COUNTS = [3, 3, 3, 2, 2, 2, 2, 2, 2];

function pick<T>(items: T[], start: number, count: number): T[] {
  if (items.length === 0) return [];
  return Array.from({ length: Math.min(count, items.length) }, (_, index) => items[(start + index) % items.length]);
}

function normalizeIntermediateUnits(course: Course): Unit[] {
  const units = course.units.map((unit) => ({ ...unit, lessons: [...unit.lessons] }));

  // Thai and Japanese begin with one fewer word lesson in their intermediate
  // band than Spanish and French. Move one late-beginner lesson across the
  // boundary so every course has nine intermediate source lessons.
  if (course.id === "th" || course.id === "ja") {
    const beginnerUnit = units[3];
    const intermediateUnit = units[4];
    const contentIndex = beginnerUnit.lessons.findLastIndex((lesson) => lesson.kind === "lesson");
    if (contentIndex >= 0) {
      const [moved] = beginnerUnit.lessons.splice(contentIndex, 1);
      const checkpointIndex = intermediateUnit.lessons.findIndex((lesson) => lesson.kind === "checkpoint");
      if (checkpointIndex >= 0) intermediateUnit.lessons.splice(checkpointIndex, 0, moved);
      else intermediateUnit.lessons.push(moved);
    }
  }

  return units.map((unit, index) => {
    const stage = index >= 4 ? "intermediate" : "beginner";
    const latin = index >= 4 && !unit.latin.toLowerCase().startsWith("intermediate")
      ? `Intermediate · ${unit.latin}`
      : unit.latin;
    return { ...unit, stage, latin };
  });
}

function normalizeIntermediateReading(course: Course): ReadingLesson[] {
  const originals = course.reading.filter((lesson) => !lesson.id.endsWith(".practice"));
  const intermediateIds = new Set(originals.slice(-9).map((lesson) => lesson.id));
  return course.reading.map((lesson) =>
    intermediateIds.has(lesson.id)
      ? {
          ...lesson,
          latin: lesson.latin.toLowerCase().startsWith("intermediate") ? lesson.latin : `Intermediate · ${lesson.latin}`,
          stage: "intermediate" as const,
        }
      : { ...lesson, stage: lesson.stage ?? "beginner" as const },
  );
}

export function expandLevels(course: Course): Course {
  const copy = COPY[course.id];
  const lexemePool = [...new Set(course.units.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.newLexemes)))];
  const phrasePool = Object.keys(course.phrases);
  const earPool: EarDrill[] = course.units.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.ear));
  const labelledUnits = normalizeIntermediateUnits(course);

  const intermediateUnits: Unit[] = [2, 2, 2, 1].map((contentCount, unitIndex) => {
    const number = 7 + unitIndex;
    const lessons: Lesson[] = Array.from({ length: contentCount }, (_, lessonIndex) => {
      const seed = unitIndex * 3 + lessonIndex;
      return {
        id: `${course.id}.u${number}.l${lessonIndex + 1}`,
        title: `${copy.lesson} ${lessonIndex + 1}`,
        latin: "Intermediate · extension",
        intro: copy.intro,
        kind: "lesson",
        newLexemes: pick(lexemePool, seed * 2, 4),
        phrases: pick(phrasePool, seed * 2, 2),
        ear: pick(earPool, seed * 2, 2),
      };
    });
    return {
      id: `${course.id}.u${number}`,
      title: copy.units[unitIndex],
      latin: "Intermediate · extension",
      glyph: UNIT_GLYPHS[unitIndex],
      tint: UNIT_TINTS[unitIndex],
      stage: "intermediate",
      lessons,
    };
  });

  const advancedUnits: Unit[] = ADVANCED_CONTENT_COUNTS.map((contentCount, unitIndex) => {
    const number = 11 + unitIndex;
    const lessons: Lesson[] = Array.from({ length: contentCount }, (_, lessonIndex) => {
      const seed = 100 + unitIndex * 3 + lessonIndex;
      return {
        id: `${course.id}.u${number}.l${lessonIndex + 1}`,
        title: `${copy.advancedLesson} ${lessonIndex + 1}`,
        latin: "Advanced · extension",
        intro: copy.advancedIntro,
        kind: "lesson",
        newLexemes: pick(lexemePool, seed * 2, 4),
        phrases: pick(phrasePool, seed * 2, 2),
        ear: pick(earPool, seed * 2, 2),
      };
    });
    return {
      id: `${course.id}.u${number}`,
      title: copy.advancedUnits[unitIndex],
      latin: "Advanced · extension",
      glyph: ADVANCED_GLYPHS[unitIndex],
      tint: UNIT_TINTS[unitIndex % UNIT_TINTS.length],
      stage: "advanced",
      lessons,
    };
  });

  const readingSource = course.reading.filter((lesson) => !lesson.id.endsWith(".practice"));
  const readingSymbols = readingSource.flatMap((lesson) => lesson.symbols);
  const intermediateReading: ReadingLesson[] = Array.from({ length: 15 }, (_, index) => {
    const source = readingSource[index % readingSource.length];
    const symbols = Array.from({ length: 5 }, (_, offset) => ({
      ...readingSymbols[(index * 5 + offset) % readingSymbols.length],
    }));
    return {
      ...source,
      id: `read.${course.id}.intermediate.${index + 1}`,
      title: `${source.title} · ${copy.readingSuffix}`,
      latin: "Intermediate · reading extension",
      intro: "More sound combinations from the same script.",
      symbols,
      stage: "intermediate",
    };
  });

  const advancedReading: ReadingLesson[] = Array.from({ length: 36 }, (_, index) => {
    const source = readingSource[index % readingSource.length];
    const symbols = Array.from({ length: 5 }, (_, offset) => ({
      ...readingSymbols[(index * 7 + offset) % readingSymbols.length],
    }));
    return {
      ...source,
      id: `read.${course.id}.advanced.${index + 1}`,
      title: `${source.title} · ${copy.advancedReadingSuffix}`,
      latin: "Advanced · reading extension",
      intro: "Longer, denser sound strings from the same script.",
      symbols,
      stage: "advanced",
    };
  });

  return {
    ...course,
    units: [...labelledUnits, ...intermediateUnits, ...advancedUnits],
    reading: [...normalizeIntermediateReading(course), ...intermediateReading, ...advancedReading],
  };
}
