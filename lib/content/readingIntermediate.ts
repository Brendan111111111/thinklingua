import type { LangId, ReadingLesson, ReadingSymbol } from "./types";
import { russianIntermediateReading } from "./russianReading";

const S = (
  glyph: string,
  sound: string,
  pronounce: string,
  example?: { text: string; latin: string; gloss: string },
): ReadingSymbol => ({ glyph, sound, pronounce, example });

/* ── Thai ──────────────────────────────────────────────────────────────── */
export const thaiIntermediateReading: ReadingLesson[] = [
  {
    id: "read.th.compound",
    title: "สระประสม",
    latin: "Intermediate · compound vowels",
    intro: "Two vowel sounds glide together in one syllable. Read them as a single beat.",
    symbols: [
      S("ใ", "ai", "ใอ", { text: "ใจ", latin: "jai", gloss: "heart" }),
      S("ำ", "am", "อำ", { text: "น้ำ", latin: "nam", gloss: "water" }),
      S("ัว", "ua", "อัว", { text: "ตัว", latin: "dtua", gloss: "body" }),
      S("เ-ีย", "ia", "เอีย", { text: "เมีย", latin: "mia", gloss: "wife" }),
    ],
  },
  {
    id: "read.th.leading",
    title: "อักษรนำ",
    latin: "Intermediate · leading consonants",
    intro: "A small leading letter changes the sound at the start of the syllable.",
    symbols: [
      S("หน", "n", "หนอ", { text: "หนู", latin: "nu", gloss: "mouse" }),
      S("หม", "m", "หมอ", { text: "หมา", latin: "maa", gloss: "dog" }),
      S("หล", "l", "หลอ", { text: "หลาน", latin: "laan", gloss: "grandchild" }),
      S("หว", "w", "หวอ", { text: "หวาน", latin: "waan", gloss: "sweet" }),
    ],
  },
  {
    id: "read.th.common",
    title: "คำที่ใช้บ่อย",
    latin: "Intermediate · common words",
    intro: "These short words appear in nearly every conversation. Read them at sight.",
    symbols: [
      S("ไป", "bpai", "ไป", { text: "ไป", latin: "bpai", gloss: "go" }),
      S("มา", "maa", "มา", { text: "มา", latin: "maa", gloss: "come" }),
      S("กิน", "kin", "กิน", { text: "กิน", latin: "kin", gloss: "eat" }),
      S("ดี", "dii", "ดี", { text: "ดี", latin: "dii", gloss: "good" }),
    ],
  },
  {
    id: "read.th.phrases",
    title: "ประโยคสั้น",
    latin: "Intermediate · short phrases",
    intro: "Read whole phrases now: the spaces between words are not where you expect.",
    symbols: [
      S("ไปไหน", "bpai nai", "ไปไหน", { text: "ไปไหน", latin: "bpai nai", gloss: "where are you going?" }),
      S("ไม่เป็นไร", "mai bpen rai", "ไม่เป็นไร", { text: "ไม่เป็นไร", latin: "mai bpen rai", gloss: "never mind" }),
      S("ขอบคุณ", "khop khun", "ขอบคุณ", { text: "ขอบคุณ", latin: "khop khun", gloss: "thank you" }),
      S("สวัสดี", "sawatdi", "สวัสดี", { text: "สวัสดี", latin: "sawatdi", gloss: "hello" }),
    ],
  },
];

/* ── Spanish ───────────────────────────────────────────────────────────── */
export const spanishIntermediateReading: ReadingLesson[] = [
  {
    id: "read.es.syllables",
    title: "Sílabas",
    latin: "Intermediate · consonant + vowel",
    intro: "Spanish syllables are steady. Keep every vowel short and clear.",
    symbols: [
      S("ba", "ba", "ba", { text: "bebo", latin: "bebo", gloss: "I drink" }),
      S("be", "be", "be", { text: "bebé", latin: "bebé", gloss: "baby" }),
      S("bi", "bi", "bi", { text: "biblioteca", latin: "biblioteca", gloss: "library" }),
      S("bo", "bo", "bo", { text: "boca", latin: "boca", gloss: "mouth" }),
    ],
  },
  {
    id: "read.es.diphthongs",
    title: "Diptongos",
    latin: "Intermediate · gliding vowels",
    intro: "Two vowels in one syllable glide together. Do not split them apart.",
    symbols: [
      S("ai", "ai", "ai", { text: "aire", latin: "aire", gloss: "air" }),
      S("ie", "ie", "ie", { text: "quiero", latin: "quiero", gloss: "I want" }),
      S("ue", "ue", "ue", { text: "bueno", latin: "bueno", gloss: "good" }),
      S("ua", "ua", "ua", { text: "agua", latin: "agua", gloss: "water" }),
    ],
  },
  {
    id: "read.es.h",
    title: "La h muda",
    latin: "Intermediate · silent h",
    intro: "The letter h is silent. Read the vowel that follows it.",
    symbols: [
      S("ha", "a", "a", { text: "hola", latin: "ola", gloss: "hello" }),
      S("he", "e", "e", { text: "helado", latin: "elado", gloss: "ice cream" }),
      S("hi", "i", "i", { text: "hielo", latin: "ielo", gloss: "ice" }),
      S("ho", "o", "o", { text: "hotel", latin: "otel", gloss: "hotel" }),
    ],
  },
  {
    id: "read.es.bv",
    title: "B y V",
    latin: "Intermediate · b and v",
    intro: "In Spanish, b and v are pronounced almost the same. Let the word decide.",
    symbols: [
      S("ba", "ba", "ba", { text: "bebo", latin: "bebo", gloss: "I drink" }),
      S("va", "va", "va", { text: "vaca", latin: "vaca", gloss: "cow" }),
      S("be", "be", "be", { text: "bebé", latin: "bebé", gloss: "baby" }),
      S("ve", "ve", "ve", { text: "verano", latin: "verano", gloss: "summer" }),
    ],
  },
  {
    id: "read.es.cg",
    title: "C y G suaves",
    latin: "Intermediate · soft c and g",
    intro: "Before e or i, c sounds like s and g sounds like a soft h.",
    symbols: [
      S("ce", "se", "se", { text: "cena", latin: "sena", gloss: "dinner" }),
      S("ci", "si", "si", { text: "cine", latin: "sine", gloss: "cinema" }),
      S("ge", "he", "he", { text: "gente", latin: "hente", gloss: "people" }),
      S("gi", "hi", "hi", { text: "girasol", latin: "hirasol", gloss: "sunflower" }),
    ],
  },
  {
    id: "read.es.n",
    title: "La ñ",
    latin: "Intermediate · the ñ sound",
    intro: "The tilde makes a new letter: ny, as in canyon.",
    symbols: [
      S("ña", "nya", "nya", { text: "mañana", latin: "manyana", gloss: "tomorrow" }),
      S("ñe", "nye", "nye", { text: "pequeño", latin: "pekenyo", gloss: "small" }),
      S("ñi", "nyi", "nyi", { text: "niño", latin: "ninyo", gloss: "child" }),
      S("ño", "nyo", "nyo", { text: "año", latin: "anyo", gloss: "year" }),
    ],
  },
  {
    id: "read.es.r",
    title: "R y RR",
    latin: "Intermediate · rolled r",
    intro: "A single r taps; rr rolls. Listen for the extra beat.",
    symbols: [
      S("ra", "ra", "ra", { text: "rato", latin: "rato", gloss: "while" }),
      S("re", "re", "re", { text: "risa", latin: "risa", gloss: "laughter" }),
      S("ri", "ri", "ri", { text: "rico", latin: "riko", gloss: "delicious" }),
      S("rra", "rra", "rra", { text: "perro", latin: "perro", gloss: "dog" }),
    ],
  },
  {
    id: "read.es.blends",
    title: "Sílabas trabadas",
    latin: "Intermediate · consonant clusters",
    intro: "A consonant plus r stays in one syllable. Do not add a vowel between them.",
    symbols: [
      S("bra", "bra", "bra", { text: "brazo", latin: "braso", gloss: "arm" }),
      S("bre", "bre", "bre", { text: "libro", latin: "libro", gloss: "book" }),
      S("bri", "bri", "bri", { text: "breve", latin: "breve", gloss: "brief" }),
      S("bro", "bro", "bro", { text: "broche", latin: "broche", gloss: "brooch" }),
    ],
  },
  {
    id: "read.es.linking",
    title: "Enlaces",
    latin: "Intermediate · reading in chunks",
    intro: "Read these chunks as one thought, not one word at a time.",
    symbols: [
      S("mi casa", "mi casa", "mi casa", { text: "mi casa", latin: "mi casa", gloss: "my house" }),
      S("es grande", "es grande", "es grande", { text: "es grande", latin: "es grande", gloss: "is big" }),
      S("hoy trabajo", "oy trabajo", "hoy trabajo", { text: "hoy trabajo", latin: "oy trabajo", gloss: "today I work" }),
      S("quiero agua", "kiero agua", "quiero agua", { text: "quiero agua", latin: "kiero agua", gloss: "I want water" }),
    ],
  },
];

/* ── French ────────────────────────────────────────────────────────────── */
export const frenchIntermediateReading: ReadingLesson[] = [
  {
    id: "read.fr.syllables",
    title: "Les syllabes",
    latin: "Intermediate · consonant + vowel",
    intro: "Keep each syllable even. French does not stress one syllable the way English does.",
    symbols: [
      S("ba", "ba", "ba", { text: "bateau", latin: "bato", gloss: "boat" }),
      S("be", "be", "be", { text: "bel", latin: "bel", gloss: "beautiful" }),
      S("bi", "bi", "bi", { text: "billet", latin: "biye", gloss: "ticket" }),
      S("bo", "bo", "bo", { text: "bon", latin: "bon", gloss: "good" }),
    ],
  },
  {
    id: "read.fr.diphthongs",
    title: "Les diphtongues",
    latin: "Intermediate · gliding vowels",
    intro: "These vowel pairs move from one sound to another inside a syllable.",
    symbols: [
      S("oi", "wa", "oi", { text: "voiture", latin: "vwatur", gloss: "car" }),
      S("ui", "wi", "ui", { text: "nuit", latin: "nwi", gloss: "night" }),
      S("eau", "o", "eau", { text: "beau", latin: "bo", gloss: "beautiful" }),
      S("au", "o", "au", { text: "aujourd'hui", latin: "ozhur-dwi", gloss: "today" }),
    ],
  },
  {
    id: "read.fr.r",
    title: "Le r français",
    latin: "Intermediate · the French r",
    intro: "The French r comes from the back of the throat, soft and light.",
    symbols: [
      S("ra", "ra", "ra", { text: "rare", latin: "rar", gloss: "rare" }),
      S("re", "re", "re", { text: "merci", latin: "mersi", gloss: "thank you" }),
      S("ri", "ri", "ri", { text: "rire", latin: "rir", gloss: "to laugh" }),
      S("ro", "ro", "ro", { text: "rose", latin: "roz", gloss: "rose" }),
    ],
  },
  {
    id: "read.fr.gn",
    title: "Le gn",
    latin: "Intermediate · the gn sound",
    intro: "gn sounds like the ny in canyon, never like a hard g plus n.",
    symbols: [
      S("gna", "nya", "gna", { text: "campagne", latin: "kampany", gloss: "countryside" }),
      S("gne", "nye", "gne", { text: "agneau", latin: "anyo", gloss: "lamb" }),
      S("gni", "nyi", "gni", { text: "gagné", latin: "ganye", gloss: "won" }),
      S("gno", "nyo", "gno", { text: "gnon", latin: "nyon", gloss: "blow" }),
    ],
  },
  {
    id: "read.fr.accents2",
    title: "Les accents",
    latin: "Intermediate · written accents",
    intro: "Accents change the vowel, and sometimes the meaning. Read them, do not skip them.",
    symbols: [
      S("é", "ay", "é", { text: "café", latin: "kafe", gloss: "coffee" }),
      S("è", "eh", "è", { text: "père", latin: "per", gloss: "father" }),
      S("ê", "eh", "ê", { text: "être", latin: "etr", gloss: "to be" }),
      S("à", "a", "à", { text: "là", latin: "la", gloss: "there" }),
    ],
  },
  {
    id: "read.fr.groups",
    title: "Les groupes de consonnes",
    latin: "Intermediate · consonant clusters",
    intro: "Two consonants before a vowel stay together. Keep the syllable short.",
    symbols: [
      S("br", "br", "br", { text: "arbre", latin: "arbr", gloss: "tree" }),
      S("cr", "kr", "cr", { text: "crier", latin: "kriye", gloss: "to shout" }),
      S("dr", "dr", "dr", { text: "drap", latin: "dra", gloss: "sheet" }),
      S("fr", "fr", "fr", { text: "froid", latin: "frwa", gloss: "cold" }),
    ],
  },
  {
    id: "read.fr.liaison",
    title: "La liaison",
    latin: "Intermediate · linking words",
    intro: "A silent final consonant can wake up before a vowel. Link the words smoothly.",
    symbols: [
      S("les amis", "lez ami", "les amis", { text: "les amis", latin: "lez ami", gloss: "the friends" }),
      S("vous avez", "vouz ave", "vous avez", { text: "vous avez", latin: "vouz ave", gloss: "you have" }),
      S("nous avons", "nouz avon", "nous avons", { text: "nous avons", latin: "nouz avon", gloss: "we have" }),
      S("c'est un", "se tun", "c'est un", { text: "c'est un", latin: "se tun", gloss: "it is a" }),
    ],
  },
  {
    id: "read.fr.nasals2",
    title: "Les nasales en contexte",
    latin: "Intermediate · nasal vowels in words",
    intro: "Hear the nasal vowel inside a whole word, not as a separate letter.",
    symbols: [
      S("an", "an", "an", { text: "enfant", latin: "anfan", gloss: "child" }),
      S("en", "en", "en", { text: "temps", latin: "tan", gloss: "time, weather" }),
      S("in", "in", "in", { text: "pain", latin: "pan", gloss: "bread" }),
      S("on", "on", "on", { text: "bonbon", latin: "bonbon", gloss: "sweet" }),
    ],
  },
  {
    id: "read.fr.rhythm",
    title: "Le rythme",
    latin: "Intermediate · reading in chunks",
    intro: "Read each group as one thought, with a gentle rise and fall.",
    symbols: [
      S("je veux", "zhuh vuh", "je veux", { text: "je veux", latin: "zhuh vuh", gloss: "I want" }),
      S("tu bois", "tu bwa", "tu bois", { text: "tu bois", latin: "tu bwa", gloss: "you drink" }),
      S("il fait", "il fe", "il fait", { text: "il fait", latin: "il fe", gloss: "he makes" }),
      S("c'est bon", "se bon", "c'est bon", { text: "c'est bon", latin: "se bon", gloss: "it is good" }),
    ],
  },
];

export const intermediateReadingByLanguage: Record<LangId, ReadingLesson[]> = {
  th: thaiIntermediateReading,
  ja: [],
  es: spanishIntermediateReading,
  fr: frenchIntermediateReading,
  ru: russianIntermediateReading,
};
