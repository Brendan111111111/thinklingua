import type { Course, EarDrill, Lexeme, Phrase } from "./types";
import { russianReading } from "./russianReading";
import { russianIntermediatePhrases, russianIntermediateUnits } from "./russianIntermediate";

const L = (
  id: string,
  glyph: string,
  text: string,
  latin: string,
  gloss: string,
): Lexeme => ({ id, glyph, text, latin, gloss });

const P = (
  id: string,
  glyph: string,
  text: string,
  latin: string,
  gloss: string,
  tiles: string[],
  extraTiles: string[] = [],
): Phrase => ({ id, glyph, text, latin, gloss, tiles, extraTiles });

const map = <T extends { id: string }>(items: T[]): Record<string, T> =>
  Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;

const lexemeList: Lexeme[] = [
  L("ru.privet", "👋", "приве́т", "privét", "hello"),
  L("ru.spasibo", "🙏", "спаси́бо", "spasíbo", "thank you"),
  L("ru.da", "✅", "да", "da", "yes"),
  L("ru.net", "❌", "нет", "net", "no"),
  L("ru.ya", "🧑", "я", "ya", "I"),
  L("ru.ty", "🫵", "ты", "ty", "you"),
  L("ru.eto", "👉", "э́то", "éto", "this"),
  L("ru.student", "🎓", "студе́нт", "studént", "student"),
  L("ru.voda", "💧", "вода́", "vodá", "water"),
  L("ru.khleb", "🍞", "хлеб", "khleb", "bread"),
  L("ru.kofe", "☕", "ко́фе", "kófe", "coffee"),
  L("ru.yabloko", "🍎", "я́блоко", "yábloko", "apple"),
  L("ru.em", "🍽️", "ем", "yem", "I eat"),
  L("ru.pyu", "🥤", "пью", "pyu", "I drink"),
  L("ru.khochu", "✋", "хочу́", "khochú", "I want"),
  L("ru.vkusny", "😋", "вку́сный", "vkúsnyy", "delicious"),
  L("ru.syr", "🧀", "сыр", "syr", "cheese"),
  L("ru.kuritsa", "🍗", "ку́рица", "kúritsa", "chicken"),
  L("ru.dom", "🏠", "дом", "dom", "house, home"),
  L("ru.stol", "🪑", "стол", "stol", "table"),
  L("ru.stul", "🪑", "стул", "stul", "chair"),
  L("ru.bolshoy", "⬛", "большо́й", "bolshóy", "big"),
  L("ru.malenky", "▫️", "ма́ленький", "málenkiy", "small"),
  L("ru.moy", "🔗", "мой", "moy", "my"),
  L("ru.doma", "🏡", "до́ма", "dóma", "at home"),
  L("ru.segodnya", "🗓️", "сего́дня", "segódnya", "today"),
  L("ru.zavtra", "🌅", "за́втра", "závtra", "tomorrow"),
  L("ru.noch", "🌙", "ночь", "noch", "night"),
  L("ru.seychas", "⏱️", "сейча́с", "seychás", "now"),
  L("ru.pozdno", "⌛", "по́здно", "pózdno", "late"),
  L("ru.rabotayu", "💼", "рабо́таю", "rabótayu", "I work"),
  L("ru.ochen", "⬆️", "о́чень", "óchen", "very"),
  L("ru.khorosho", "👍", "хорошо́", "khoroshó", "good, well"),
];

const phraseList: Phrase[] = [
  P("ru.p1", "🎓", "я студе́нт", "ya studént", "I am a student", ["я", "студе́нт"], ["ты", "э́то"]),
  P("ru.p2", "📛", "как тебя́ зову́т?", "kak tebyá zovút?", "what is your name?", ["как", "тебя́", "зову́т"], ["я", "студе́нт"]),
  P("ru.p3", "💧", "э́то вода́", "éto vodá", "this is water", ["э́то", "вода́"], ["хлеб", "нет"]),
  P("ru.p4", "🍞", "э́то не хлеб", "éto ne khleb", "this is not bread", ["э́то", "не", "хлеб"], ["вода́", "да"]),
  P("ru.p5", "💧", "я хочу́ во́ду", "ya khochú vódu", "I want water", ["я", "хочу́", "во́ду"], ["хлеб", "ем"]),
  P("ru.p6", "🍎", "я́блоко вку́сное", "yábloko vkúsnoye", "the apple is delicious", ["я́блоко", "вку́сное"], ["сыр", "нет"]),
  P("ru.p7", "☕", "я пью ко́фе", "ya pyu kófe", "I drink coffee", ["я", "пью", "ко́фе"], ["ем", "вода́"]),
  P("ru.p8", "🤝", "о́чень прия́тно", "óchen priyátno", "pleased to meet you", ["о́чень", "прия́тно"], ["спаси́бо", "приве́т"]),
  P("ru.p9", "🏠", "э́то мой дом", "éto moy dom", "this is my house", ["э́то", "мой", "дом"], ["стол", "нет"]),
  P("ru.p10", "🪑", "стол большо́й", "stol bolshóy", "the table is big", ["стол", "большо́й"], ["стул", "ма́ленький"]),
  P("ru.p11", "🪑", "я хочу́ ма́ленький стул", "ya khochú málenkiy stul", "I want a small chair", ["я", "хочу́", "ма́ленький", "стул"], ["стол", "большо́й"]),
  P("ru.p12", "💼", "сего́дня я рабо́таю до́ма", "segódnya ya rabótayu dóma", "today I work at home", ["сего́дня", "я", "рабо́таю", "до́ма"], ["за́втра", "ночь"]),
  P("ru.p13", "🌅", "за́втра я пью ко́фе", "závtra ya pyu kófe", "tomorrow I drink coffee", ["за́втра", "я", "пью", "ко́фе"], ["сего́дня", "вода́"]),
  P("ru.p14", "🌙", "сейча́с ночь", "seychás noch", "now it is night", ["сейча́с", "ночь"], ["по́здно", "за́втра"]),
  ...russianIntermediatePhrases,
];

const ear = (
  id: string,
  hint: string,
  a: [string, string, string],
  b: [string, string, string],
  target: "a" | "b",
): EarDrill => ({
  id,
  hint,
  a: { text: a[0], latin: a[1], gloss: a[2] },
  b: { text: b[0], latin: b[1], gloss: b[2] },
  target,
});

export const russian: Course = {
  id: "ru",
  name: "Русский",
  english: "Russian",
  flag: "🇷🇺",
  locale: "ru-RU",
  scriptLabel: "кириллица",
  tagline: "Думай по-русски с первого слова.",
  accent: "sky",
  accentTip:
    "Russian stress can fall on any syllable, and the unstressed vowels change around it. Learn every word with its stress — the written accent marks in this course are there to help you hear it.",
  primary: false,
  ranks: ["Новичок", "Ученик", "Слушатель", "Говорящий", "Мыслитель", "Мастер"],
  lexemes: map(lexemeList),
  phrases: map(phraseList),
  units: [
    {
      id: "ru.u1",
      title: "Первые шаги",
      latin: "First steps",
      glyph: "👋",
      tint: "sakura",
      lessons: [
        {
          id: "ru.u1.l1",
          title: "Привет",
          latin: "Hello",
          intro: "Слушай и выбирай картинку.",
          kind: "lesson",
          newLexemes: ["ru.privet", "ru.spasibo", "ru.da", "ru.net", "ru.ya", "ru.ty", "ru.eto", "ru.student"],
          phrases: ["ru.p1", "ru.p2"],
          ear: [
            ear("ru.e1", "ы ↔ и", ["мы́шка", "mýshka", "mouse"], ["ми́шка", "míshka", "bear"], "a"),
            ear("ru.e2", "ы ↔ и", ["мы́шка", "mýshka", "mouse"], ["ми́шка", "míshka", "bear"], "b"),
          ],
        },
        {
          id: "ru.u1.l2",
          title: "За столом",
          latin: "At the table",
          intro: "Что стоит на столе.",
          kind: "lesson",
          newLexemes: ["ru.voda", "ru.khleb", "ru.kofe", "ru.yabloko", "ru.em"],
          phrases: ["ru.p3", "ru.p4"],
          ear: [
            ear("ru.e3", "hard ↔ soft", ["быть", "byt’", "to be"], ["бить", "bit’", "to beat"], "a"),
            ear("ru.e4", "hard ↔ soft", ["быть", "byt’", "to be"], ["бить", "bit’", "to beat"], "b"),
          ],
        },
      ],
    },
    {
      id: "ru.u2",
      title: "Еда",
      latin: "Food",
      glyph: "🍽️",
      tint: "jade",
      lessons: [
        {
          id: "ru.u2.l1",
          title: "Я хочу",
          latin: "I want",
          intro: "Попроси то, что хочешь.",
          kind: "lesson",
          newLexemes: ["ru.pyu", "ru.khochu", "ru.vkusny", "ru.syr"],
          phrases: ["ru.p5", "ru.p7"],
          ear: [
            ear("ru.e5", "ш ↔ ж", ["шар", "shar", "ball"], ["жар", "zhar", "heat"], "a"),
            ear("ru.e6", "ш ↔ ж", ["шар", "shar", "ball"], ["жар", "zhar", "heat"], "b"),
          ],
        },
        {
          id: "ru.u2.l2",
          title: "Очень вкусно",
          latin: "Very tasty",
          intro: "Еда и вежливость.",
          kind: "lesson",
          newLexemes: ["ru.kuritsa", "ru.ochen", "ru.khorosho"],
          phrases: ["ru.p6", "ru.p8"],
          ear: [
            ear("ru.e7", "д ↔ т", ["дом", "dom", "house"], ["том", "tom", "volume"], "a"),
            ear("ru.e8", "д ↔ т", ["дом", "dom", "house"], ["том", "tom", "volume"], "b"),
          ],
        },
      ],
    },
    {
      id: "ru.u3",
      title: "Дом",
      latin: "At home",
      glyph: "🏠",
      tint: "gold",
      lessons: [
        {
          id: "ru.u3.l1",
          title: "Мой дом",
          latin: "My house",
          intro: "Опиши свой дом.",
          kind: "lesson",
          newLexemes: ["ru.dom", "ru.stol", "ru.stul", "ru.bolshoy", "ru.malenky", "ru.moy"],
          phrases: ["ru.p9", "ru.p10", "ru.p11"],
          ear: [
            ear("ru.e9", "з ↔ с", ["зуб", "zub", "tooth"], ["суп", "sup", "soup"], "a"),
            ear("ru.e10", "з ↔ с", ["зуб", "zub", "tooth"], ["суп", "sup", "soup"], "b"),
          ],
        },
        {
          id: "ru.u3.l2",
          title: "Дома",
          latin: "At home",
          intro: "Вещи, которые окружают тебя дома.",
          kind: "lesson",
          newLexemes: ["ru.doma"],
          phrases: ["ru.p9", "ru.p11"],
          ear: [
            ear("ru.e11", "о ↔ ё", ["нос", "nos", "nose"], ["нёс", "nyos", "carried"], "a"),
            ear("ru.e12", "о ↔ ё", ["нос", "nos", "nose"], ["нёс", "nyos", "carried"], "b"),
          ],
        },
      ],
    },
    {
      id: "ru.u4",
      title: "День",
      latin: "The day",
      glyph: "🌅",
      tint: "sky",
      lessons: [
        {
          id: "ru.u4.l1",
          title: "Сегодня",
          latin: "Today",
          intro: "День начинается здесь.",
          kind: "lesson",
          newLexemes: ["ru.segodnya", "ru.zavtra", "ru.noch", "ru.seychas", "ru.pozdno", "ru.rabotayu"],
          phrases: ["ru.p12", "ru.p13", "ru.p14"],
          ear: [
            ear("ru.e13", "hard ↔ soft sign", ["ел", "yel", "ate"], ["ель", "yel’", "spruce"], "a"),
            ear("ru.e14", "hard ↔ soft sign", ["ел", "yel", "ate"], ["ель", "yel’", "spruce"], "b"),
          ],
        },
        {
          id: "ru.u4.l2",
          title: "Завтра",
          latin: "Tomorrow",
          intro: "Завтра и сейчас.",
          kind: "lesson",
          newLexemes: ["ru.segodnya", "ru.zavtra", "ru.seychas"],
          phrases: ["ru.p12", "ru.p13", "ru.p14"],
          ear: [
            ear("ru.e15", "hard л ↔ soft ль", ["у́гол", "úgol", "corner"], ["у́голь", "úgol’", "coal"], "a"),
            ear("ru.e16", "hard л ↔ soft ль", ["у́гол", "úgol", "corner"], ["у́голь", "úgol’", "coal"], "b"),
          ],
        },
      ],
    },
    ...russianIntermediateUnits,
  ],
  reading: russianReading,
};
