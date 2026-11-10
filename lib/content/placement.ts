import type { LangId } from "./types";

export type PlacementQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
};

export type PlacementTest = {
  questions: PlacementQuestion[];
  passScore: number;
};

const spanish: PlacementTest = {
  passScore: 8,
  questions: [
    {
      id: "es.place.1",
      prompt: "¿Cómo se dice “hello”?",
      options: ["Gracias", "Hola", "Adiós", "Por favor"],
      answer: 1,
    },
    {
      id: "es.place.2",
      prompt: "“Gracias” means:",
      options: ["Thank you", "Please", "Hello", "Goodbye"],
      answer: 0,
    },
    {
      id: "es.place.3",
      prompt: "Which sentence means “I want water”?",
      options: ["Bebo agua", "Quiero agua", "Como agua", "Es agua"],
      answer: 1,
    },
    {
      id: "es.place.4",
      prompt: "“La manzana es rica” means:",
      options: ["The apple is big", "The apple is delicious", "I want an apple", "The table is small"],
      answer: 1,
    },
    {
      id: "es.place.5",
      prompt: "Complete: “Mi ___ es grande.”",
      options: ["casa", "mesa", "silla", "agua"],
      answer: 0,
    },
    {
      id: "es.place.6",
      prompt: "“Mañana trabajo en casa” means:",
      options: ["Today I work at home", "Tomorrow I work at home", "Now I drink water", "I want a small chair"],
      answer: 1,
    },
    {
      id: "es.place.7",
      prompt: "Which word means “cheese”?",
      options: ["pollo", "pan", "queso", "café"],
      answer: 2,
    },
    {
      id: "es.place.8",
      prompt: "Which sentence means “I drink coffee”?",
      options: ["Como café", "Quiero café", "Bebo café", "Es café"],
      answer: 2,
    },
    {
      id: "es.place.9",
      prompt: "“La mesa es pequeña” means:",
      options: ["The table is big", "The chair is small", "The house is small", "The table is small"],
      answer: 3,
    },
    {
      id: "es.place.10",
      prompt: "Complete: “Yo ___ estudiante.”",
      options: ["es", "soy", "eres", "está"],
      answer: 1,
    },
  ],
};

const japanese: PlacementTest = {
  passScore: 8,
  questions: [
    {
      id: "ja.place.1",
      prompt: "How do you say “hello”?",
      options: ["こんにちは", "ありがとう", "すみません", "おはよう"],
      answer: 0,
    },
    {
      id: "ja.place.2",
      prompt: "“ありがとう” means:",
      options: ["Hello", "Thank you", "Excuse me", "Yes"],
      answer: 1,
    },
    {
      id: "ja.place.3",
      prompt: "Which sentence means “I am a student”?",
      options: ["ともだちです", "せんせいじゃないです", "わたしはがくせいです", "みずをください"],
      answer: 2,
    },
    {
      id: "ja.place.4",
      prompt: "“みずをください” means:",
      options: ["Water, please", "I eat fish", "This is delicious", "Where is the station?"],
      answer: 0,
    },
    {
      id: "ja.place.5",
      prompt: "Complete: “わたしは ___ です。”",
      options: ["みず", "えき", "がくせい", "あした"],
      answer: 2,
    },
    {
      id: "ja.place.6",
      prompt: "“あしたがっこうにいきます” means:",
      options: ["Yesterday I was at home", "Tomorrow I go to school", "I go home by train", "I get up early"],
      answer: 1,
    },
    {
      id: "ja.place.7",
      prompt: "Which word means “station”?",
      options: ["みせ", "えき", "いえ", "でんしゃ"],
      answer: 1,
    },
    {
      id: "ja.place.8",
      prompt: "Which sentence means “I drink coffee”?",
      options: ["さかなをたべます", "おちゃがほしいです", "コーヒーをのみます", "みずをください"],
      answer: 2,
    },
    {
      id: "ja.place.9",
      prompt: "“いえはえきにちかいです” means:",
      options: ["The station is far", "This is a shop", "I go to school", "The house is near the station"],
      answer: 3,
    },
    {
      id: "ja.place.10",
      prompt: "Complete: “わたしは にほんじん ___。”",
      options: ["じゃない", "か", "です", "を"],
      answer: 2,
    },
  ],
};

const thai: PlacementTest = {
  passScore: 8,
  questions: [
    {
      id: "th.place.1",
      prompt: "How do you say “hello”?",
      options: ["ขอบคุณ", "สวัสดี", "ขอโทษ", "ลาก่อน"],
      answer: 1,
    },
    {
      id: "th.place.2",
      prompt: "“ขอบคุณ” means:",
      options: ["Hello", "Thank you", "Sorry", "Goodbye"],
      answer: 1,
    },
    {
      id: "th.place.3",
      prompt: "Which sentence means “I am a student”?",
      options: ["ฉันเป็นครู", "ฉันกินข้าว", "ฉันเป็นนักเรียน", "ฉันไปโรงเรียน"],
      answer: 2,
    },
    {
      id: "th.place.4",
      prompt: "“ขอน้ำหน่อย” means:",
      options: ["The fish is delicious", "May I have some water?", "I ride the train", "Where is the station?"],
      answer: 1,
    },
    {
      id: "th.place.5",
      prompt: "Complete: “ฉัน ___ นักเรียน”",
      options: ["ไป", "เป็น", "กิน", "อยู่"],
      answer: 1,
    },
    {
      id: "th.place.6",
      prompt: "“พรุ่งนี้ฉันไปโรงเรียน” means:",
      options: ["Yesterday I was at home", "Tomorrow I go to school", "I drink water", "I walk home"],
      answer: 1,
    },
    {
      id: "th.place.7",
      prompt: "Which word means “station”?",
      options: ["บ้าน", "สถานี", "โรงเรียน", "ร้านค้า"],
      answer: 1,
    },
    {
      id: "th.place.8",
      prompt: "Which sentence means “I eat rice”?",
      options: ["ฉันดื่มน้ำ", "ฉันกินข้าว", "ฉันไปโรงเรียน", "ฉันมาสาย"],
      answer: 1,
    },
    {
      id: "th.place.9",
      prompt: "“บ้านอยู่ใกล้สถานี” means:",
      options: ["The station is far", "This is a shop", "I walk home", "The house is near the station"],
      answer: 3,
    },
    {
      id: "th.place.10",
      prompt: "Complete: “ฉัน ___ ครู”",
      options: ["ไป", "มี", "เป็น", "กิน"],
      answer: 2,
    },
  ],
};

const french: PlacementTest = {
  passScore: 8,
  questions: [
    {
      id: "fr.place.1",
      prompt: "Comment dit-on “hello”?",
      options: ["Merci", "Bonjour", "Au revoir", "S'il vous plaît"],
      answer: 1,
    },
    {
      id: "fr.place.2",
      prompt: "“Merci” means:",
      options: ["Thank you", "Please", "Hello", "Goodbye"],
      answer: 0,
    },
    {
      id: "fr.place.3",
      prompt: "Which sentence means “I want water”?",
      options: ["Je bois de l'eau", "Je veux de l'eau", "Je mange de l'eau", "C'est de l'eau"],
      answer: 1,
    },
    {
      id: "fr.place.4",
      prompt: "“La pomme est délicieuse” means:",
      options: ["The apple is big", "The apple is delicious", "I want an apple", "The table is small"],
      answer: 1,
    },
    {
      id: "fr.place.5",
      prompt: "Complete: “Ma ___ est grande.”",
      options: ["maison", "table", "chaise", "eau"],
      answer: 0,
    },
    {
      id: "fr.place.6",
      prompt: "“Demain je travaille” means:",
      options: ["Today I work", "Tomorrow I work", "Now I drink coffee", "I want a small chair"],
      answer: 1,
    },
    {
      id: "fr.place.7",
      prompt: "Which word means “cheese”?",
      options: ["poulet", "pain", "fromage", "café"],
      answer: 2,
    },
    {
      id: "fr.place.8",
      prompt: "Which sentence means “I drink coffee”?",
      options: ["Je mange du café", "Je veux du café", "Je bois du café", "C'est du café"],
      answer: 2,
    },
    {
      id: "fr.place.9",
      prompt: "“La table est petite” means:",
      options: ["The table is big", "The chair is small", "The house is small", "The table is small"],
      answer: 3,
    },
    {
      id: "fr.place.10",
      prompt: "Complete: “Je ___ étudiant.”",
      options: ["es", "suis", "est", "sommes"],
      answer: 1,
    },
  ],
};

const russian: PlacementTest = {
  passScore: 8,
  questions: [
    {
      id: "ru.place.1",
      prompt: "Как сказать «hello»?",
      options: ["Спасибо", "Привет", "До свидания", "Пожалуйста"],
      answer: 1,
    },
    {
      id: "ru.place.2",
      prompt: "«Спасибо» means:",
      options: ["Thank you", "Please", "Hello", "Goodbye"],
      answer: 0,
    },
    {
      id: "ru.place.3",
      prompt: "Which sentence means “I want water”?",
      options: ["Я пью воду", "Я хочу воду", "Я ем воду", "Это вода"],
      answer: 1,
    },
    {
      id: "ru.place.4",
      prompt: "«Яблоко вкусное» means:",
      options: ["The apple is big", "The apple is delicious", "I want an apple", "The table is small"],
      answer: 1,
    },
    {
      id: "ru.place.5",
      prompt: "Complete: «Мой ___ большой.»",
      options: ["дом", "стол", "стул", "вода"],
      answer: 0,
    },
    {
      id: "ru.place.6",
      prompt: "«Завтра я работаю дома» means:",
      options: ["Today I work at home", "Tomorrow I work at home", "Now I drink coffee", "I want a small chair"],
      answer: 1,
    },
    {
      id: "ru.place.7",
      prompt: "Which word means “cheese”?",
      options: ["курица", "хлеб", "сыр", "кофе"],
      answer: 2,
    },
    {
      id: "ru.place.8",
      prompt: "Which sentence means “I drink coffee”?",
      options: ["Я ем кофе", "Я хочу кофе", "Я пью кофе", "Это кофе"],
      answer: 2,
    },
    {
      id: "ru.place.9",
      prompt: "«Стол маленький» means:",
      options: ["The table is big", "The chair is small", "The house is small", "The table is small"],
      answer: 3,
    },
    {
      id: "ru.place.10",
      prompt: "Complete: «Я ___ кофе.»",
      options: ["пью", "ем", "это", "и"],
      answer: 0,
    },
  ],
};

export const placementTests: Partial<Record<LangId, PlacementTest>> = { th: thai, ja: japanese, es: spanish, fr: french, ru: russian };
