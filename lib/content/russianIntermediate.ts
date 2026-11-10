import type { EarDrill, Phrase, Unit } from "./types";

const P = (
  id: string,
  glyph: string,
  text: string,
  latin: string,
  gloss: string,
  tiles: string[],
  extraTiles: string[] = [],
): Phrase => ({ id, glyph, text, latin, gloss, tiles, extraTiles });

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

/* ── Russian intermediate phrases ─────────────────────────────────────── */
export const russianIntermediatePhrases: Phrase[] = [
  P("ru.p15", "☕", "сего́дня я хочу́ ко́фе", "segódnya ya khochú kófe", "today I want coffee", ["сего́дня", "я", "хочу́", "ко́фе"], ["вода́", "хлеб"]),
  P("ru.p16", "🍎", "я хочу́ я́блоко", "ya khochú yábloko", "I want an apple", ["я", "хочу́", "я́блоко"], ["стол", "ко́фе"]),
  P("ru.p17", "🏠", "мой дом большо́й", "moy dom bolshóy", "my house is big", ["мой", "дом", "большо́й"], ["ма́ленький", "стол"]),
  P("ru.p18", "🪑", "стол ма́ленький", "stol málenkiy", "the table is small", ["стол", "ма́ленький"], ["большо́й", "стул"]),
  P("ru.p19", "💧", "сейча́с я пью во́ду", "seychás ya pyu vódu", "now I drink water", ["сейча́с", "я", "пью", "во́ду"], ["ко́фе", "ем"]),
  P("ru.p20", "💼", "за́втра я рабо́таю до́ма", "závtra ya rabótayu dóma", "tomorrow I work at home", ["за́втра", "я", "рабо́таю", "до́ма"], ["сего́дня", "ночь"]),
  P("ru.p21", "☕", "за́втра я хочу́ ко́фе", "závtra ya khochú kófe", "tomorrow I want coffee", ["за́втра", "я", "хочу́", "ко́фе"], ["сего́дня", "вода́"]),
  P("ru.p22", "🪑", "я хочу́ большо́й стул", "ya khochú bolshóy stul", "I want a big chair", ["я", "хочу́", "большо́й", "стул"], ["стол", "ма́ленький"]),
  P("ru.p23", "🍗", "я ем ку́рицу и хлеб", "ya yem kúritsu i khleb", "I eat chicken and bread", ["я", "ем", "ку́рицу", "и", "хлеб"], ["сыр", "вода́"]),
  P("ru.p24", "🧀", "сыр о́чень вку́сный", "syr óchen vkúsnyy", "the cheese is very tasty", ["сыр", "о́чень", "вку́сный"], ["ку́рица", "нет"]),
  P("ru.p25", "☕", "сего́дня ве́чером я пью ко́фе", "segódnya vécherom ya pyu kófe", "tonight I drink coffee", ["сего́дня", "ве́чером", "я", "пью", "ко́фе"], ["за́втра", "вода́"]),
  P("ru.p26", "🏠", "за́втра я ем до́ма", "závtra ya yem dóma", "tomorrow I eat at home", ["за́втра", "я", "ем", "до́ма"], ["сего́дня", "ночь"]),
  P("ru.p27", "🍞", "я хочу́ хлеб и сыр", "ya khochú khleb i syr", "I want bread and cheese", ["я", "хочу́", "хлеб", "и", "сыр"], ["ко́фе", "я́блоко"]),
  P("ru.p28", "🍎", "я́блоко большо́е", "yábloko bolshóye", "the apple is big", ["я́блоко", "большо́е"], ["ма́ленький", "стол"]),
];

/* ── Russian intermediate units ──────────────────────────────────────── */
export const russianIntermediateUnits: Unit[] = [
  {
    id: "ru.u5",
    title: "Повседневная жизнь",
    latin: "Intermediate · daily life",
    glyph: "☀️",
    tint: "jade",
    lessons: [
      {
        id: "ru.u5.l1",
        title: "Что я хочу",
        latin: "What I want",
        intro: "Попроси то, что хочешь, словами, которые уже знаешь.",
        kind: "lesson",
        newLexemes: ["ru.khochu", "ru.voda", "ru.kofe", "ru.yabloko", "ru.khleb"],
        phrases: ["ru.p15", "ru.p16"],
        ear: [
          ear("ru.e17", "ы ↔ и", ["мы́шка", "mýshka", "mouse"], ["ми́шка", "míshka", "bear"], "a"),
          ear("ru.e18", "hard ↔ soft", ["быть", "byt’", "to be"], ["бить", "bit’", "to beat"], "a"),
        ],
      },
      {
        id: "ru.u5.l2",
        title: "Дома",
        latin: "At home",
        intro: "Опиши свой дом полными фразами.",
        kind: "lesson",
        newLexemes: ["ru.dom", "ru.stol", "ru.stul", "ru.bolshoy", "ru.malenky"],
        phrases: ["ru.p17", "ru.p18"],
        ear: [
          ear("ru.e19", "ш ↔ ж", ["шар", "shar", "ball"], ["жар", "zhar", "heat"], "a"),
          ear("ru.e20", "д ↔ т", ["дом", "dom", "house"], ["том", "tom", "volume"], "b"),
        ],
      },
      {
        id: "ru.u5.l3",
        title: "День",
        latin: "The day",
        intro: "Расскажи, что делаешь сегодня и завтра.",
        kind: "lesson",
        newLexemes: ["ru.segodnya", "ru.zavtra", "ru.noch", "ru.seychas", "ru.pozdno"],
        phrases: ["ru.p19", "ru.p20"],
        ear: [
          ear("ru.e21", "з ↔ с", ["зуб", "zub", "tooth"], ["суп", "sup", "soup"], "b"),
          ear("ru.e22", "о ↔ ё", ["нос", "nos", "nose"], ["нёс", "nyos", "carried"], "b"),
        ],
      },
      {
        id: "ru.u5.l4",
        title: "Повторение",
        latin: "Checkpoint",
        intro: "Повтори этот раздел.",
        kind: "checkpoint",
        newLexemes: [],
        phrases: ["ru.p15", "ru.p16", "ru.p17", "ru.p18", "ru.p19", "ru.p20"],
        ear: [
          ear("ru.e23", "hard ↔ soft sign", ["ел", "yel", "ate"], ["ель", "yel’", "spruce"], "a"),
          ear("ru.e24", "hard л ↔ soft ль", ["у́гол", "úgol", "corner"], ["у́голь", "úgol’", "coal"], "a"),
        ],
      },
    ],
  },
  {
    id: "ru.u6",
    title: "Планы",
    latin: "Intermediate · plans",
    glyph: "🗺️",
    tint: "violet",
    lessons: [
      {
        id: "ru.u6.l1",
        title: "Завтра",
        latin: "Tomorrow",
        intro: "Говори о планах на завтра.",
        kind: "lesson",
        newLexemes: ["ru.zavtra", "ru.rabotayu", "ru.dom", "ru.khochu"],
        phrases: ["ru.p21", "ru.p22"],
        ear: [
          ear("ru.e25", "ы ↔ и", ["мы́шка", "mýshka", "mouse"], ["ми́шка", "míshka", "bear"], "b"),
          ear("ru.e26", "hard ↔ soft", ["быть", "byt’", "to be"], ["бить", "bit’", "to beat"], "b"),
        ],
      },
      {
        id: "ru.u6.l2",
        title: "Еда вне дома",
        latin: "Eating out",
        intro: "Соедини еду и мнение в одной фразе.",
        kind: "lesson",
        newLexemes: ["ru.em", "ru.pyu", "ru.kuritsa", "ru.syr", "ru.vkusny"],
        phrases: ["ru.p23", "ru.p24"],
        ear: [
          ear("ru.e27", "ш ↔ ж", ["шар", "shar", "ball"], ["жар", "zhar", "heat"], "b"),
          ear("ru.e28", "д ↔ т", ["дом", "dom", "house"], ["том", "tom", "volume"], "a"),
        ],
      },
      {
        id: "ru.u6.l3",
        title: "Неделя",
        latin: "A week",
        intro: "Организуй свои дни знакомыми словами.",
        kind: "lesson",
        newLexemes: ["ru.segodnya", "ru.zavtra", "ru.noch", "ru.rabotayu"],
        phrases: ["ru.p25", "ru.p26"],
        ear: [
          ear("ru.e29", "з ↔ с", ["зуб", "zub", "tooth"], ["суп", "sup", "soup"], "a"),
          ear("ru.e30", "о ↔ ё", ["нос", "nos", "nose"], ["нёс", "nyos", "carried"], "a"),
        ],
      },
      {
        id: "ru.u6.l4",
        title: "В пути",
        latin: "On the move",
        intro: "Используй знакомые фразы в повседневном разговоре.",
        kind: "lesson",
        newLexemes: ["ru.voda", "ru.kofe", "ru.yabloko", "ru.khleb"],
        phrases: ["ru.p27", "ru.p28"],
        ear: [
          ear("ru.e17", "ы ↔ и", ["мы́шка", "mýshka", "mouse"], ["ми́шка", "míshka", "bear"], "a"),
          ear("ru.e18", "hard ↔ soft", ["быть", "byt’", "to be"], ["бить", "bit’", "to beat"], "a"),
        ],
      },
      {
        id: "ru.u6.l5",
        title: "Итоговое повторение",
        latin: "Final checkpoint",
        intro: "Повтори всё, что практиковал на этом уровне.",
        kind: "checkpoint",
        newLexemes: [],
        phrases: ["ru.p21", "ru.p22", "ru.p23", "ru.p24", "ru.p25", "ru.p26", "ru.p27", "ru.p28"],
        ear: [
          ear("ru.e19", "ш ↔ ж", ["шар", "shar", "ball"], ["жар", "zhar", "heat"], "a"),
          ear("ru.e20", "д ↔ т", ["дом", "dom", "house"], ["том", "tom", "volume"], "b"),
        ],
      },
    ],
  },
];
