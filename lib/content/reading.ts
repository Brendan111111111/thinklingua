import type { LangId, ReadingLesson, ReadingSymbol } from "./types";

/**
 * Reading is taught separately from vocabulary.
 *
 * Every symbol carries the sound it makes and a real word it appears in, so a
 * reading drill always ends in language the learner has heard before rather
 * than in an abstract alphabet chart.
 */

const S = (
  glyph: string,
  sound: string,
  pronounce: string,
  example?: { text: string; latin: string; gloss: string },
): ReadingSymbol => ({ glyph, sound, pronounce, example });

/* ── Thai ──────────────────────────────────────────────────────────────── */
export const thaiReading: ReadingLesson[] = [
  {
    id: "read.th.mid",
    title: "อักษรกลาง",
    latin: "Mid-class consonants",
    intro: "The seven middle letters. Their names are said with a middle tone — start here.",
    symbols: [
      S("ก", "g", "กอ", { text: "กิน", latin: "kin", gloss: "eat" }),
      S("จ", "j", "จอ", { text: "จาน", latin: "jaan", gloss: "plate" }),
      S("ด", "d", "ดอ", { text: "ดาว", latin: "daao", gloss: "star" }),
      S("ต", "dt", "ตอ", { text: "ตา", latin: "taa", gloss: "eye" }),
      S("บ", "b", "บอ", { text: "บ้าน", latin: "baan", gloss: "house" }),
      S("ป", "bp", "ปอ", { text: "ปลา", latin: "bplaa", gloss: "fish" }),
      S("อ", "o", "ออ", { text: "อร่อย", latin: "aroi", gloss: "delicious" }),
    ],
  },
  {
    id: "read.th.high",
    title: "อักษรสูง",
    latin: "High-class consonants",
    intro: "High letters push the tone up. Hear the breath behind ข and ผ.",
    symbols: [
      S("ข", "kh", "ขอ", { text: "ข้าว", latin: "khaao", gloss: "rice" }),
      S("ฉ", "ch", "ฉอ", { text: "ฉัน", latin: "chan", gloss: "I" }),
      S("ถ", "th", "ถอ", { text: "ถนน", latin: "thanon", gloss: "road" }),
      S("ผ", "ph", "ผอ", { text: "ผม", latin: "phom", gloss: "hair" }),
      S("ฝ", "f", "ฝอ", { text: "ฝน", latin: "fon", gloss: "rain" }),
      S("ส", "s", "สอ", { text: "สวัสดี", latin: "sawatdi", gloss: "hello" }),
      S("ห", "h", "หอ", { text: "ห้า", latin: "haa", gloss: "five" }),
    ],
  },
  {
    id: "read.th.low1",
    title: "อักษรต่ำ ๑",
    latin: "Low-class consonants, part one",
    intro: "Low letters are the other half of the alphabet. They carry a flat, low sound.",
    symbols: [
      S("ค", "kh", "คอ", { text: "ครู", latin: "khru", gloss: "teacher" }),
      S("ง", "ng", "งอ", { text: "งาน", latin: "ngaan", gloss: "work" }),
      S("ช", "ch", "ชอ", { text: "ชา", latin: "chaa", gloss: "tea" }),
      S("ท", "th", "ทอ", { text: "ทำ", latin: "tham", gloss: "do" }),
      S("น", "n", "นอ", { text: "น้ำ", latin: "nam", gloss: "water" }),
      S("พ", "ph", "พอ", { text: "พ่อ", latin: "pho", gloss: "father" }),
    ],
  },
  {
    id: "read.th.low2",
    title: "อักษรต่ำ ๒",
    latin: "Low-class consonants, part two",
    intro: "The remaining low letters — the ones that hum, roll and glide.",
    symbols: [
      S("ฟ", "f", "ฟอ", { text: "ฟ้า", latin: "faa", gloss: "sky" }),
      S("ม", "m", "มอ", { text: "แม่", latin: "mae", gloss: "mother" }),
      S("ย", "y", "ยอ", { text: "ยา", latin: "yaa", gloss: "medicine" }),
      S("ร", "r", "รอ", { text: "รถ", latin: "rot", gloss: "car" }),
      S("ล", "l", "ลอ", { text: "ลม", latin: "lom", gloss: "wind" }),
      S("ว", "w", "วอ", { text: "วัน", latin: "wan", gloss: "day" }),
    ],
  },
  {
    id: "read.th.vowels",
    title: "สระเสียงยาว",
    latin: "Long vowels",
    intro: "Thai vowel signs attach above, below or beside the consonant. These are the long ones.",
    symbols: [
      S("า", "aa", "อา", { text: "ตา", latin: "taa", gloss: "eye" }),
      S("ี", "ii", "อี", { text: "ดี", latin: "dii", gloss: "good" }),
      S("ู", "uu", "อู", { text: "ดู", latin: "duu", gloss: "look" }),
      S("เ", "ee", "เอ", { text: "เรา", latin: "rao", gloss: "we" }),
      S("แ", "ae", "แอ", { text: "แม่", latin: "mae", gloss: "mother" }),
      S("โ", "oo", "โอ", { text: "โต", latin: "dtoo", gloss: "big" }),
      S("ไ", "ai", "ไอ", { text: "ไป", latin: "bpai", gloss: "go" }),
    ],
  },
  {
    id: "read.th.short",
    title: "สระเสียงสั้น",
    latin: "Short vowels",
    intro: "Short vowels are clipped. Hold them and the word turns into a different one.",
    symbols: [
      S("ะ", "a", "อะ", { text: "จะ", latin: "ja", gloss: "will" }),
      S("ิ", "i", "อิ", { text: "กิน", latin: "kin", gloss: "eat" }),
      S("ึ", "ue", "อึ", { text: "หนึ่ง", latin: "nueng", gloss: "one" }),
      S("ุ", "u", "อุ", { text: "ดุ", latin: "du", gloss: "fierce" }),
    ],
  },
  {
    id: "read.th.tones",
    title: "วรรณยุกต์",
    latin: "Tone marks",
    intro: "Four marks, five tones. The mark sits above the letter and bends the voice.",
    symbols: [
      S("่", "mai ek", "ไม้เอก", { text: "ไม่", latin: "mai", gloss: "not" }),
      S("้", "mai tho", "ไม้โท", { text: "น้ำ", latin: "nam", gloss: "water" }),
      S("๊", "mai tri", "ไม้ตรี", { text: "โต๊ะ", latin: "dto", gloss: "table" }),
      S("๋", "mai chattawa", "ไม้จัตวา", { text: "จ๋า", latin: "jaa", gloss: "dear" }),
    ],
  },
  {
    id: "read.th.finals",
    title: "เสียงท้าย",
    latin: "Final consonants",
    intro: "Thai closes a syllable with a small set of sounds. The spelling is wider than the sound.",
    symbols: [
      S("น", "n (final)", "นอ", { text: "บ้าน", latin: "baan", gloss: "house" }),
      S("ก", "k (final)", "กอ", { text: "จาก", latin: "jaak", gloss: "from" }),
      S("ด", "t (final)", "ดอ", { text: "ปิด", latin: "bpit", gloss: "close" }),
      S("บ", "p (final)", "บอ", { text: "ครับ", latin: "khrap", gloss: "polite particle" }),
      S("ม", "m (final)", "มอ", { text: "ลม", latin: "lom", gloss: "wind" }),
      S("ง", "ng (final)", "งอ", { text: "ทาง", latin: "thaang", gloss: "way" }),
    ],
  },
];

/* ── Japanese ──────────────────────────────────────────────────────────── */
export const japaneseReading: ReadingLesson[] = [
  {
    id: "read.ja.a",
    title: "あ行",
    latin: "Hiragana · the five vowels",
    intro: "Japanese runs on five vowels. Every other kana is a consonant plus one of these.",
    symbols: [
      S("あ", "a", "あ", { text: "あめ", latin: "ame", gloss: "rain" }),
      S("い", "i", "い", { text: "いぬ", latin: "inu", gloss: "dog" }),
      S("う", "u", "う", { text: "うみ", latin: "umi", gloss: "sea" }),
      S("え", "e", "え", { text: "えき", latin: "eki", gloss: "station" }),
      S("お", "o", "お", { text: "おちゃ", latin: "ocha", gloss: "tea" }),
    ],
  },
  {
    id: "read.ja.ka",
    title: "か行",
    latin: "Hiragana · k row",
    intro: "Add k to each vowel: ka, ki, ku, ke, ko.",
    symbols: [
      S("か", "ka", "か", { text: "かさ", latin: "kasa", gloss: "umbrella" }),
      S("き", "ki", "き", { text: "き", latin: "ki", gloss: "tree" }),
      S("く", "ku", "く", { text: "くつ", latin: "kutsu", gloss: "shoes" }),
      S("け", "ke", "け", { text: "けさ", latin: "kesa", gloss: "this morning" }),
      S("こ", "ko", "こ", { text: "ここ", latin: "koko", gloss: "here" }),
    ],
  },
  {
    id: "read.ja.sa",
    title: "さ行",
    latin: "Hiragana · s row",
    intro: "さ し す せ そ. Note し is shi, not si.",
    symbols: [
      S("さ", "sa", "さ", { text: "さかな", latin: "sakana", gloss: "fish" }),
      S("し", "shi", "し", { text: "しお", latin: "shio", gloss: "salt" }),
      S("す", "su", "す", { text: "すし", latin: "sushi", gloss: "sushi" }),
      S("せ", "se", "せ", { text: "せんせい", latin: "sensei", gloss: "teacher" }),
      S("そ", "so", "そ", { text: "そら", latin: "sora", gloss: "sky" }),
    ],
  },
  {
    id: "read.ja.ta",
    title: "た行",
    latin: "Hiragana · t row",
    intro: "た ち つ て と. ち is chi and つ is tsu — both surprises.",
    symbols: [
      S("た", "ta", "た", { text: "たまご", latin: "tamago", gloss: "egg" }),
      S("ち", "chi", "ち", { text: "ちず", latin: "chizu", gloss: "map" }),
      S("つ", "tsu", "つ", { text: "つくえ", latin: "tsukue", gloss: "desk" }),
      S("て", "te", "て", { text: "て", latin: "te", gloss: "hand" }),
      S("と", "to", "と", { text: "とり", latin: "tori", gloss: "bird" }),
    ],
  },
  {
    id: "read.ja.na",
    title: "な行",
    latin: "Hiragana · n row",
    intro: "な に ぬ ね の — the row that ends in の, the possessive particle.",
    symbols: [
      S("な", "na", "な", { text: "なつ", latin: "natsu", gloss: "summer" }),
      S("に", "ni", "に", { text: "にく", latin: "niku", gloss: "meat" }),
      S("ぬ", "nu", "ぬ", { text: "ぬの", latin: "nuno", gloss: "cloth" }),
      S("ね", "ne", "ね", { text: "ねこ", latin: "neko", gloss: "cat" }),
      S("の", "no", "の", { text: "のり", latin: "nori", gloss: "seaweed" }),
    ],
  },
  {
    id: "read.ja.ha",
    title: "は行",
    latin: "Hiragana · h row",
    intro: "は ひ ふ へ ほ. ふ is fu, but the lips barely touch.",
    symbols: [
      S("は", "ha", "は", { text: "はな", latin: "hana", gloss: "flower" }),
      S("ひ", "hi", "ひ", { text: "ひと", latin: "hito", gloss: "person" }),
      S("ふ", "fu", "ふ", { text: "ふゆ", latin: "fuyu", gloss: "winter" }),
      S("へ", "he", "へ", { text: "へや", latin: "heya", gloss: "room" }),
      S("ほ", "ho", "ほ", { text: "ほん", latin: "hon", gloss: "book" }),
    ],
  },
  {
    id: "read.ja.ma",
    title: "ま行",
    latin: "Hiragana · m row",
    intro: "ま み む め も. Your first full row of hums.",
    symbols: [
      S("ま", "ma", "ま", { text: "まど", latin: "mado", gloss: "window" }),
      S("み", "mi", "み", { text: "みず", latin: "mizu", gloss: "water" }),
      S("む", "mu", "む", { text: "むし", latin: "mushi", gloss: "insect" }),
      S("め", "me", "め", { text: "め", latin: "me", gloss: "eye" }),
      S("も", "mo", "も", { text: "もり", latin: "mori", gloss: "forest" }),
    ],
  },
  {
    id: "read.ja.ya",
    title: "や・ら行",
    latin: "Hiragana · y and r rows",
    intro: "や ゆ よ are the last vowels on their own; ら り る れ ろ are a single tongue tap.",
    symbols: [
      S("や", "ya", "や", { text: "やま", latin: "yama", gloss: "mountain" }),
      S("ゆ", "yu", "ゆ", { text: "ゆき", latin: "yuki", gloss: "snow" }),
      S("よ", "yo", "よ", { text: "よる", latin: "yoru", gloss: "night" }),
      S("ら", "ra", "ら", { text: "らーめん", latin: "raamen", gloss: "ramen" }),
      S("り", "ri", "り", { text: "りんご", latin: "ringo", gloss: "apple" }),
      S("る", "ru", "る", { text: "るす", latin: "rusu", gloss: "absent" }),
      S("れ", "re", "れ", { text: "れきし", latin: "rekishi", gloss: "history" }),
      S("ろ", "ro", "ろ", { text: "ろく", latin: "roku", gloss: "six" }),
    ],
  },
  {
    id: "read.ja.wa",
    title: "わ・を・ん",
    latin: "Hiragana · the last three",
    intro: "わ is wa, を is the object particle said o, and ん is the only consonant that ends a word.",
    symbols: [
      S("わ", "wa", "わ", { text: "わたし", latin: "watashi", gloss: "I" }),
      S("を", "o", "を", { text: "ほんを", latin: "hon o", gloss: "a book (object)" }),
      S("ん", "n", "ん", { text: "ほん", latin: "hon", gloss: "book" }),
    ],
  },
  {
    id: "read.ja.dakuten1",
    title: "が・ざ行",
    latin: "Hiragana · voiced k and s",
    intro: "Two small marks (゛) voice the letter: k becomes g, s becomes z.",
    symbols: [
      S("が", "ga", "が", { text: "がくせい", latin: "gakusei", gloss: "student" }),
      S("ぎ", "gi", "ぎ", { text: "ぎん", latin: "gin", gloss: "silver" }),
      S("ぐ", "gu", "ぐ", { text: "ぐあい", latin: "guai", gloss: "condition" }),
      S("げ", "ge", "げ", { text: "げんき", latin: "genki", gloss: "healthy" }),
      S("ご", "go", "ご", { text: "ごはん", latin: "gohan", gloss: "rice" }),
      S("ざ", "za", "ざ", { text: "ざっし", latin: "zasshi", gloss: "magazine" }),
      S("じ", "ji", "じ", { text: "じかん", latin: "jikan", gloss: "time" }),
      S("ず", "zu", "ず", { text: "ずつ", latin: "zutsu", gloss: "apiece" }),
      S("ぜ", "ze", "ぜ", { text: "ぜんぶ", latin: "zenbu", gloss: "all" }),
      S("ぞ", "zo", "ぞ", { text: "ぞう", latin: "zou", gloss: "elephant" }),
    ],
  },
  {
    id: "read.ja.dakuten2",
    title: "だ・ば・ぱ行",
    latin: "Hiragana · voiced t, b and p",
    intro: "゛ voices t and b. A small circle (゜) turns h into p.",
    symbols: [
      S("だ", "da", "だ", { text: "だいがく", latin: "daigaku", gloss: "university" }),
      S("で", "de", "で", { text: "でんしゃ", latin: "densha", gloss: "train" }),
      S("ど", "do", "ど", { text: "どあ", latin: "doa", gloss: "door" }),
      S("ば", "ba", "ば", { text: "ばんごう", latin: "bangou", gloss: "number" }),
      S("び", "bi", "び", { text: "びょういん", latin: "byouin", gloss: "hospital" }),
      S("ぶ", "bu", "ぶ", { text: "ぶた", latin: "buta", gloss: "pig" }),
      S("べ", "be", "べ", { text: "べんきょう", latin: "benkyou", gloss: "study" }),
      S("ぼ", "bo", "ぼ", { text: "ぼうし", latin: "boushi", gloss: "hat" }),
      S("ぱ", "pa", "ぱ", { text: "ぱん", latin: "pan", gloss: "bread" }),
      S("ぽ", "po", "ぽ", { text: "ぽけっと", latin: "poketto", gloss: "pocket" }),
    ],
  },
  {
    id: "read.ja.small",
    title: "小さいかな",
    latin: "Hiragana · small ゃ ゅ ょ",
    intro: "A small ゃ ゅ ょ glides into the vowel before it: ki + ya becomes kya.",
    symbols: [
      S("きゃ", "kya", "きゃ", { text: "きゃく", latin: "kyaku", gloss: "guest" }),
      S("きゅ", "kyu", "きゅ", { text: "きゅう", latin: "kyuu", gloss: "nine" }),
      S("きょ", "kyo", "きょ", { text: "きょう", latin: "kyou", gloss: "today" }),
      S("しゃ", "sha", "しゃ", { text: "しゃしん", latin: "shashin", gloss: "photograph" }),
      S("しゅ", "shu", "しゅ", { text: "しゅくだい", latin: "shukudai", gloss: "homework" }),
      S("しょ", "sho", "しょ", { text: "しょくじ", latin: "shokuji", gloss: "meal" }),
      S("ちゃ", "cha", "ちゃ", { text: "おちゃ", latin: "ocha", gloss: "tea" }),
      S("ちょ", "cho", "ちょ", { text: "ちょっと", latin: "chotto", gloss: "a little" }),
    ],
  },
];

/* ── Spanish ───────────────────────────────────────────────────────────── */
export const spanishReading: ReadingLesson[] = [
  {
    id: "read.es.vowels",
    title: "Las vocales",
    latin: "Spanish · five clean vowels",
    intro: "Spanish keeps every vowel short and pure. Five letters, five sounds, no exceptions.",
    symbols: [
      S("a", "ah", "a", { text: "casa", latin: "casa", gloss: "house" }),
      S("e", "eh", "e", { text: "mesa", latin: "mesa", gloss: "table" }),
      S("i", "ee", "i", { text: "isla", latin: "isla", gloss: "island" }),
      S("o", "oh", "o", { text: "oso", latin: "oso", gloss: "bear" }),
      S("u", "oo", "u", { text: "uva", latin: "uva", gloss: "grape" }),
    ],
  },
  {
    id: "read.es.tricky",
    title: "Letras con carácter",
    latin: "Spanish · letters that surprise",
    intro: "ll sounds like y, ñ is ny, j is a hard h, and h is silent.",
    symbols: [
      S("ll", "y", "ll", { text: "llave", latin: "llave", gloss: "key" }),
      S("ñ", "ny", "ñ", { text: "niño", latin: "niño", gloss: "child" }),
      S("j", "h", "j", { text: "jamón", latin: "jamón", gloss: "ham" }),
      S("h", "silent", "h", { text: "hola", latin: "hola", gloss: "hello" }),
      S("rr", "rolled r", "rr", { text: "perro", latin: "perro", gloss: "dog" }),
    ],
  },
  {
    id: "read.es.stress",
    title: "El acento",
    latin: "Spanish · stress marks",
    intro: "The written accent tells you which syllable to lean on — and changes the meaning.",
    symbols: [
      S("á", "stressed a", "a", { text: "café", latin: "café", gloss: "coffee" }),
      S("é", "stressed e", "e", { text: "bebé", latin: "bebé", gloss: "baby" }),
      S("í", "stressed i", "i", { text: "música", latin: "música", gloss: "music" }),
      S("ó", "stressed o", "o", { text: "teléfono", latin: "teléfono", gloss: "telephone" }),
      S("ú", "stressed u", "u", { text: "menú", latin: "menú", gloss: "menu" }),
    ],
  },
];

/* ── French ────────────────────────────────────────────────────────────── */
export const frenchReading: ReadingLesson[] = [
  {
    id: "read.fr.nasal",
    title: "Les nasales",
    latin: "French · nasal vowels",
    intro: "French lets air out through the nose on an, en, in, on and un. The n is not said.",
    symbols: [
      S("an", "nasal a (an)", "an", { text: "enfant", latin: "enfant", gloss: "child" }),
      S("en", "nasal a (en)", "en", { text: "temps", latin: "temps", gloss: "time, weather" }),
      S("in", "nasal i (in)", "in", { text: "pain", latin: "pain", gloss: "bread" }),
      S("on", "nasal o (on)", "on", { text: "bonbon", latin: "bonbon", gloss: "sweet" }),
      S("un", "nasal u (un)", "un", { text: "lundi", latin: "lundi", gloss: "Monday" }),
    ],
  },
  {
    id: "read.fr.vowels",
    title: "Les voyelles",
    latin: "French · vowels that are not English",
    intro: "ou is oo, u is tight, é is ay, è is eh, and oi is wah.",
    symbols: [
      S("ou", "oo", "ou", { text: "rouge", latin: "rouge", gloss: "red" }),
      S("u", "tight u", "u", { text: "lune", latin: "lune", gloss: "moon" }),
      S("é", "ay", "é", { text: "café", latin: "café", gloss: "coffee" }),
      S("è", "eh", "è", { text: "père", latin: "père", gloss: "father" }),
      S("oi", "wah", "oi", { text: "voiture", latin: "voiture", gloss: "car" }),
    ],
  },
  {
    id: "read.fr.silent",
    title: "Les lettres muettes",
    latin: "French · silent endings",
    intro: "The last letter is often silent. The word is shorter than it looks.",
    symbols: [
      S("e", "silent e", "", { text: "petite", latin: "petite", gloss: "small" }),
      S("s", "silent s", "", { text: "mais", latin: "mais", gloss: "but" }),
      S("t", "silent t", "", { text: "chat", latin: "chat", gloss: "cat" }),
      S("h", "silent h", "", { text: "heure", latin: "heure", gloss: "hour" }),
    ],
  },
];

export const readingByLanguage: Record<LangId, ReadingLesson[]> = {
  th: thaiReading,
  ja: japaneseReading,
  es: spanishReading,
  fr: frenchReading,
};
