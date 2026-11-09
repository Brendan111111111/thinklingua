import type { Course, EarDrill, Lexeme, Phrase } from "./types";

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
  L("es.hola", "👋", "hola", "ola", "hello"),
  L("es.gracias", "🙏", "gracias", "grasias", "thank you"),
  L("es.si", "✅", "sí", "si", "yes"),
  L("es.no", "❌", "no", "no", "no"),
  L("es.yo", "🧑", "yo", "yo", "I"),
  L("es.tu", "🫵", "tú", "tu", "you"),
  L("es.soy", "🟰", "soy", "soy", "I am"),
  L("es.estudiante", "🎓", "estudiante", "estudiante", "student"),
  L("es.agua", "💧", "agua", "agua", "water"),
  L("es.pan", "🍞", "pan", "pan", "bread"),
  L("es.cafe", "☕", "café", "kafé", "coffee"),
  L("es.manzana", "🍎", "manzana", "mansana", "apple"),
  L("es.esto", "👉", "esto", "esto", "this"),
  L("es.es", "🟰", "es", "es", "is"),
  L("es.como", "🍽️", "como", "como", "I eat"),
  L("es.bebo", "🥤", "bebo", "bebo", "I drink"),
  L("es.quiero", "✋", "quiero", "kiero", "I want"),
  L("es.rico", "😋", "rico", "riko", "delicious"),
  L("es.mucho", "⬆️", "mucho", "mucho", "a lot"),
  L("es.queso", "🧀", "queso", "keso", "cheese"),
  L("es.pollo", "🍗", "pollo", "poyo", "chicken"),
];

const phraseList: Phrase[] = [
  P("es.p1", "🎓", "yo soy estudiante", "yo soy estudiante", "I am a student", ["yo", "soy", "estudiante"], ["tú", "es"]),
  P("es.p2", "📛", "¿cómo te llamas?", "komo te lyamas", "what is your name?", ["cómo", "te", "llamas"], ["yo", "soy"]),
  P("es.p3", "💧", "esto es agua", "esto es agua", "this is water", ["esto", "es", "agua"], ["pan", "no"]),
  P("es.p4", "🍞", "no es pan", "no es pan", "it is not bread", ["no", "es", "pan"], ["agua", "sí"]),
  P("es.p5", "💧", "quiero agua", "kiero agua", "I want water", ["quiero", "agua"], ["pan", "como"]),
  P("es.p6", "🍎", "la manzana es rica", "la mansana es rika", "the apple is delicious", ["la", "manzana", "es", "rica"], ["pollo", "no"]),
  P("es.p7", "☕", "bebo café", "bebo kafé", "I drink coffee", ["bebo", "café"], ["como", "agua"]),
  P("es.p8", "🤝", "mucho gusto", "mucho gusto", "pleased to meet you", ["mucho", "gusto"], ["gracias", "hola"]),
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

export const spanish: Course = {
  id: "es",
  name: "Español",
  english: "Spanish",
  flag: "🇪🇸",
  locale: "es-ES",
  scriptLabel: "alfabeto latino",
  tagline: "Piensa en español desde la primera palabra.",
  accent: "violet",
  accentTip:
    "Spanish rhythm is syllable-timed and the rolled r and clean vowels carry the accent. Say every vowel the same length and let the consonants do the work.",
  primary: false,
  ranks: ["Principiante", "Aprendiz", "Oyente", "Hablante", "Pensador", "Maestro"],
  lexemes: map(lexemeList),
  phrases: map(phraseList),
  units: [
    {
      id: "es.u1",
      title: "Primeros pasos",
      latin: "First steps",
      glyph: "👋",
      tint: "violet",
      lessons: [
        {
          id: "es.u1.l1",
          title: "Hola",
          latin: "Hello",
          intro: "Escucha y elige la imagen.",
          kind: "lesson",
          newLexemes: ["es.hola", "es.gracias", "es.si", "es.no", "es.yo", "es.tu", "es.soy", "es.estudiante"],
          phrases: ["es.p1", "es.p2"],
          ear: [
            ear("es.e1", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "a"),
            ear("es.e2", "rolled r", ["pero", "pero", "but"], ["perro", "perro", "dog"], "b"),
          ],
        },
        {
          id: "es.u1.l2",
          title: "La mesa",
          latin: "The table",
          intro: "Lo que hay en la mesa.",
          kind: "lesson",
          newLexemes: ["es.agua", "es.pan", "es.cafe", "es.manzana", "es.esto", "es.es"],
          phrases: ["es.p3", "es.p4"],
          ear: [
            ear("es.e3", "ll sound", ["pollo", "poyo", "chicken"], ["polo", "polo", "pole"], "a"),
            ear("es.e4", "ll sound", ["polo", "polo", "pole"], ["pollo", "poyo", "chicken"], "b"),
          ],
        },
      ],
    },
    {
      id: "es.u2",
      title: "La comida",
      latin: "Food",
      glyph: "🍽️",
      tint: "jade",
      lessons: [
        {
          id: "es.u2.l1",
          title: "Quiero",
          latin: "I want",
          intro: "Pide lo que quieres.",
          kind: "lesson",
          newLexemes: ["es.como", "es.bebo", "es.quiero", "es.rico"],
          phrases: ["es.p5", "es.p7"],
          ear: [
            ear("es.e5", "s ↔ z", ["casa", "kasa", "house"], ["caza", "kasa", "hunting"], "a"),
            ear("es.e6", "s ↔ z", ["caza", "kasa", "hunting"], ["casa", "kasa", "house"], "b"),
          ],
        },
        {
          id: "es.u2.l2",
          title: "Mucho gusto",
          latin: "Nice to meet you",
          intro: "Comida y cortesía.",
          kind: "lesson",
          newLexemes: ["es.mucho", "es.queso", "es.pollo"],
          phrases: ["es.p6", "es.p8"],
          ear: [
            ear("es.e7", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "a"),
            ear("es.e8", "ll sound", ["pollo", "poyo", "chicken"], ["polo", "polo", "pole"], "b"),
          ],
        },
      ],
    },
  ],
};
