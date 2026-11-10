import type { Course, EarDrill, Lexeme, Phrase } from "./types";
import { frenchReading } from "./reading";
import { frenchIntermediatePhrases, frenchIntermediateUnits } from "./intermediate";

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
  L("fr.bonjour", "👋", "bonjour", "bonzhur", "hello"),
  L("fr.merci", "🙏", "merci", "mersi", "thank you"),
  L("fr.oui", "✅", "oui", "wi", "yes"),
  L("fr.non", "❌", "non", "non", "no"),
  L("fr.je", "🧑", "je", "zhuh", "I"),
  L("fr.tu", "🫵", "tu", "tu", "you"),
  L("fr.suis", "🟰", "suis", "swi", "am"),
  L("fr.etudiant", "🎓", "étudiant", "etudyan", "student"),
  L("fr.eau", "💧", "eau", "o", "water"),
  L("fr.pain", "🍞", "pain", "pan", "bread"),
  L("fr.cafe", "☕", "café", "kafe", "coffee"),
  L("fr.pomme", "🍎", "pomme", "pom", "apple"),
  L("fr.est", "🟰", "est", "e", "is"),
  L("fr.mange", "🍽️", "mange", "manzh", "I eat"),
  L("fr.bois", "🥤", "bois", "bwa", "I drink"),
  L("fr.veux", "✋", "veux", "vuh", "I want"),
  L("fr.delicieux", "😋", "délicieux", "delisyeu", "delicious"),
  L("fr.tres", "⬆️", "très", "tre", "very"),
  L("fr.fromage", "🧀", "fromage", "fromazh", "cheese"),
  L("fr.poulet", "🍗", "poulet", "pule", "chicken"),
  L("fr.bon", "😋", "bon", "bon", "good"),
  L("fr.maison", "🏠", "maison", "mezon", "house, home"),
  L("fr.table", "🪑", "table", "tabl", "table"),
  L("fr.chaise", "🪑", "chaise", "shez", "chair"),
  L("fr.grand", "⬛", "grand", "gran", "big"),
  L("fr.petit", "▫️", "petit", "puh-ti", "small"),
  L("fr.mon", "🔗", "mon", "mon", "my"),
  L("fr.aujourdhui", "🗓️", "aujourd'hui", "ozhur-dwi", "today"),
  L("fr.demain", "🌅", "demain", "duh-man", "tomorrow"),
  L("fr.nuit", "🌙", "nuit", "nwi", "night"),
  L("fr.maintenant", "⏱️", "maintenant", "ment-nan", "now"),
  L("fr.tard", "⌛", "tard", "tar", "late"),
  L("fr.travaille", "💼", "travaille", "travai", "work (I work)"),
];

const phraseList: Phrase[] = [
  P("fr.p1", "🎓", "je suis étudiant", "zhuh swi etudyan", "I am a student", ["je", "suis", "étudiant"], ["tu", "est"]),
  P("fr.p2", "📛", "comment tu t'appelles ?", "koman tu tapel", "what is your name?", ["comment", "tu", "t'appelles"], ["je", "suis"]),
  P("fr.p3", "💧", "c'est de l'eau", "se duh lo", "it is water", ["c'est", "de", "l'eau"], ["pain", "non"]),
  P("fr.p4", "🍞", "ce n'est pas du pain", "suh ne pa du pan", "it is not bread", ["ce", "n'est", "pas", "du", "pain"], ["eau", "oui"]),
  P("fr.p5", "💧", "je veux de l'eau", "zhuh vuh duh lo", "I want water", ["je", "veux", "de", "l'eau"], ["pain", "bois"]),
  P("fr.p6", "🍎", "la pomme est délicieuse", "la pom e delisyeuz", "the apple is delicious", ["la", "pomme", "est", "délicieuse"], ["fromage", "très"]),
  P("fr.p7", "☕", "je bois du café", "zhuh bwa du kafe", "I drink coffee", ["je", "bois", "du", "café"], ["mange", "eau"]),
  P("fr.p8", "😋", "très bon", "tre bon", "very good", ["très", "bon"], ["merci", "oui"]),
  P("fr.p9", "🏠", "c'est ma maison", "se ma mezon", "this is my house", ["c'est", "ma", "maison"], ["table", "non"]),
  P("fr.p10", "🪑", "la table est grande", "la tabl e grand", "the table is big", ["la", "table", "est", "grande"], ["chaise", "petite"]),
  P("fr.p11", "🪑", "je veux une petite chaise", "zhuh vuh ün puhtit shez", "I want a small chair", ["je", "veux", "une", "petite", "chaise"], ["table", "grande"]),
  P("fr.p12", "💼", "aujourd'hui je travaille", "ozhur-dwi zhuh travai", "today I work", ["aujourd'hui", "je", "travaille"], ["demain", "nuit"]),
  P("fr.p13", "🌅", "demain je bois du café", "duh-man zhuh bwa du kafe", "tomorrow I drink coffee", ["demain", "je", "bois", "du", "café"], ["aujourd'hui", "eau"]),
  P("fr.p14", "🌙", "maintenant il fait nuit", "ment-nan il fe nwi", "now it is night", ["maintenant", "il", "fait", "nuit"], ["tard", "demain"]),
  ...frenchIntermediatePhrases,
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

export const french: Course = {
  id: "fr",
  name: "Français",
  english: "French",
  flag: "🇫🇷",
  locale: "fr-FR",
  scriptLabel: "alphabet latin",
  tagline: "Penser en français, dès le premier mot.",
  accent: "sky",
  accentTip:
    "French accent is nasal vowels and the way words join. Hear the whole phrase as one sound, not as separate words.",
  primary: false,
  ranks: ["Débutant", "Apprenti", "Auditeur", "Locuteur", "Penseur", "Maître"],
  lexemes: map(lexemeList),
  phrases: map(phraseList),
  units: [
    {
      id: "fr.u1",
      title: "Pour commencer",
      latin: "Starting out",
      glyph: "👋",
      tint: "sky",
      lessons: [
        {
          id: "fr.u1.l1",
          title: "Bonjour",
          latin: "Hello",
          intro: "Écoute, puis choisis l'image.",
          kind: "lesson",
          newLexemes: ["fr.bonjour", "fr.merci", "fr.oui", "fr.non", "fr.je", "fr.tu", "fr.suis", "fr.etudiant"],
          phrases: ["fr.p1", "fr.p2"],
          ear: [
            ear("fr.e1", "u ↔ ou", ["dessus", "dusü", "on top"], ["dessous", "dusu", "underneath"], "a"),
            ear("fr.e2", "u ↔ ou", ["dessous", "dusu", "underneath"], ["dessus", "dusü", "on top"], "b"),
          ],
        },
        {
          id: "fr.u1.l2",
          title: "À table",
          latin: "At the table",
          intro: "Ce qu'il y a sur la table.",
          kind: "lesson",
          newLexemes: ["fr.eau", "fr.pain", "fr.cafe", "fr.pomme", "fr.est"],
          phrases: ["fr.p3", "fr.p4"],
          ear: [
            ear("fr.e3", "s ↔ z", ["poisson", "pwason", "fish"], ["poison", "pwazon", "poison"], "a"),
            ear("fr.e4", "s ↔ z", ["poison", "pwazon", "poison"], ["poisson", "pwason", "fish"], "b"),
          ],
        },
      ],
    },
    {
      id: "fr.u2",
      title: "À table",
      latin: "Food",
      glyph: "🍽️",
      tint: "gold",
      lessons: [
        {
          id: "fr.u2.l1",
          title: "Je veux",
          latin: "I want",
          intro: "Demande ce que tu veux.",
          kind: "lesson",
          newLexemes: ["fr.mange", "fr.bois", "fr.veux", "fr.delicieux"],
          phrases: ["fr.p5", "fr.p7"],
          ear: [
            ear("fr.e5", "nasal vowel", ["beau", "bo", "beautiful"], ["bu", "bü", "drunk"], "a"),
            ear("fr.e6", "u ↔ ou", ["tu", "tü", "you"], ["tout", "tu", "all"], "a"),
          ],
        },
        {
          id: "fr.u2.l2",
          title: "Très bon",
          latin: "Very good",
          intro: "Goûter, et le dire.",
          kind: "lesson",
          newLexemes: ["fr.tres", "fr.fromage", "fr.poulet", "fr.bon"],
          phrases: ["fr.p6", "fr.p8"],
          ear: [
            ear("fr.e7", "s ↔ z", ["poisson", "pwason", "fish"], ["poison", "pwazon", "poison"], "b"),
            ear("fr.e8", "nasal vowel", ["beau", "bo", "beautiful"], ["bu", "bü", "drunk"], "b"),
          ],
        },
      ],
    },
    {
      id: "fr.u3",
      title: "Chez moi",
      latin: "At home",
      glyph: "🏠",
      tint: "violet",
      lessons: [
        {
          id: "fr.u3.l1",
          title: "Ma maison",
          latin: "My house",
          intro: "Décris chez toi.",
          kind: "lesson",
          newLexemes: ["fr.maison", "fr.table", "fr.chaise", "fr.grand", "fr.petit", "fr.mon"],
          phrases: ["fr.p9", "fr.p10", "fr.p11"],
          ear: [
            ear("fr.e9", "u ↔ ou", ["tu", "tü", "you"], ["tout", "tu", "all"], "b"),
            ear("fr.e10", "nasal vowel", ["beau", "bo", "beautiful"], ["bu", "bü", "drunk"], "a"),
          ],
        },
        {
          id: "fr.u3.l2",
          title: "À la maison",
          latin: "Around the house",
          intro: "Les choses de la maison.",
          kind: "lesson",
          newLexemes: ["fr.maison", "fr.chaise"],
          phrases: ["fr.p9", "fr.p11"],
          ear: [
            ear("fr.e11", "s ↔ z", ["poison", "pwazon", "poison"], ["poisson", "pwason", "fish"], "a"),
            ear("fr.e12", "u ↔ ou", ["tout", "tu", "all"], ["tu", "tü", "you"], "a"),
          ],
        },
      ],
    },
    {
      id: "fr.u4",
      title: "Le jour",
      latin: "The day",
      glyph: "🌅",
      tint: "jade",
      lessons: [
        {
          id: "fr.u4.l1",
          title: "Aujourd'hui",
          latin: "Today",
          intro: "Le temps qui passe.",
          kind: "lesson",
          newLexemes: ["fr.aujourdhui", "fr.demain", "fr.nuit", "fr.maintenant", "fr.tard", "fr.travaille"],
          phrases: ["fr.p12", "fr.p13", "fr.p14"],
          ear: [
            ear("fr.e13", "nasal vowel", ["bu", "bü", "drunk"], ["beau", "bo", "beautiful"], "b"),
            ear("fr.e14", "s ↔ z", ["poisson", "pwason", "fish"], ["poison", "pwazon", "poison"], "b"),
          ],
        },
        {
          id: "fr.u4.l2",
          title: "Demain",
          latin: "Tomorrow",
          intro: "Demain et maintenant.",
          kind: "lesson",
          newLexemes: ["fr.aujourdhui", "fr.demain", "fr.maintenant"],
          phrases: ["fr.p12", "fr.p13", "fr.p14"],
          ear: [
            ear("fr.e15", "u ↔ ou", ["dessus", "dusü", "on top"], ["dessous", "dusu", "underneath"], "b"),
            ear("fr.e16", "nasal vowel", ["beau", "bo", "beautiful"], ["bu", "bü", "drunk"], "a"),
          ],
        },
      ],
    },
    ...frenchIntermediateUnits,
  ],
  reading: frenchReading,
};
