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
  L("es.casa", "🏠", "casa", "kasa", "house, home"),
  L("es.mesa", "🪑", "mesa", "mesa", "table"),
  L("es.silla", "🪑", "silla", "siya", "chair"),
  L("es.grande", "⬛", "grande", "grande", "big"),
  L("es.pequeno", "▫️", "pequeño", "pekenyo", "small"),
  L("es.mi", "🔗", "mi", "mi", "my"),
  L("es.una", "1️⃣", "una", "una", "a (feminine)"),
  L("es.hoy", "🗓️", "hoy", "oy", "today"),
  L("es.manana", "🌅", "mañana", "manyana", "tomorrow; morning"),
  L("es.noche", "🌙", "noche", "noche", "night"),
  L("es.ahora", "⏱️", "ahora", "aora", "now"),
  L("es.tarde", "⌛", "tarde", "tarde", "late; afternoon"),
  L("es.trabajo", "💼", "trabajo", "trabakho", "I work; work"),
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
  P("es.p9", "🏠", "esta es mi casa", "esta es mi kasa", "this is my house", ["esta", "es", "mi", "casa"], ["mesa", "no"]),
  P("es.p10", "🪑", "la mesa es grande", "la mesa es grande", "the table is big", ["la", "mesa", "es", "grande"], ["silla", "pequeña"]),
  P("es.p11", "🪑", "quiero una silla pequeña", "kiero una siya pekenya", "I want a small chair", ["quiero", "una", "silla", "pequeña"], ["mesa", "grande"]),
  P("es.p12", "💼", "hoy trabajo en casa", "oy trabajo en kasa", "today I work at home", ["hoy", "trabajo", "en", "casa"], ["mañana", "noche"]),
  P("es.p13", "🌅", "mañana bebo café", "manyana bebo kafé", "tomorrow I drink coffee", ["mañana", "bebo", "café"], ["hoy", "agua"]),
  P("es.p14", "🌙", "ahora es de noche", "aora es de noche", "now it is night", ["ahora", "es", "de", "noche"], ["tarde", "hoy"]),
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
    {
      id: "es.u3",
      title: "La casa",
      latin: "At home",
      glyph: "🏠",
      tint: "sky",
      lessons: [
        {
          id: "es.u3.l1",
          title: "Mi casa",
          latin: "My house",
          intro: "Habla de tu casa.",
          kind: "lesson",
          newLexemes: ["es.casa", "es.mesa", "es.silla", "es.grande", "es.pequeno", "es.mi", "es.una"],
          phrases: ["es.p9", "es.p10", "es.p11"],
          ear: [
            ear("es.e9", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "b"),
            ear("es.e10", "ll sound", ["pollo", "poyo", "chicken"], ["polo", "polo", "pole"], "a"),
          ],
        },
        {
          id: "es.u3.l2",
          title: "En casa",
          latin: "At home",
          intro: "Lo que hay en casa.",
          kind: "lesson",
          newLexemes: ["es.casa", "es.mesa"],
          phrases: ["es.p9", "es.p11"],
          ear: [
            ear("es.e11", "s ↔ z", ["casa", "kasa", "house"], ["caza", "kasa", "hunting"], "b"),
            ear("es.e12", "rolled r", ["pero", "pero", "but"], ["perro", "perro", "dog"], "a"),
          ],
        },
      ],
    },
    {
      id: "es.u4",
      title: "El día",
      latin: "The day",
      glyph: "🌅",
      tint: "gold",
      lessons: [
        {
          id: "es.u4.l1",
          title: "Hoy",
          latin: "Today",
          intro: "El día empieza aquí.",
          kind: "lesson",
          newLexemes: ["es.hoy", "es.manana", "es.noche", "es.ahora", "es.tarde", "es.trabajo"],
          phrases: ["es.p12", "es.p13", "es.p14"],
          ear: [
            ear("es.e13", "ll sound", ["polo", "polo", "pole"], ["pollo", "poyo", "chicken"], "b"),
            ear("es.e14", "s ↔ z", ["caza", "kasa", "hunting"], ["casa", "kasa", "house"], "a"),
          ],
        },
        {
          id: "es.u4.l2",
          title: "Mañana",
          latin: "Tomorrow",
          intro: "Mañana y ahora.",
          kind: "lesson",
          newLexemes: ["es.hoy", "es.manana", "es.ahora"],
          phrases: ["es.p12", "es.p13", "es.p14"],
          ear: [
            ear("es.e15", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "a"),
            ear("es.e16", "ll sound", ["pollo", "poyo", "chicken"], ["polo", "polo", "pole"], "b"),
          ],
        },
      ],
    },
  ],
};
