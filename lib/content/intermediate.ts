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

/* ── Spanish intermediate phrases ─────────────────────────────────────── */
export const spanishIntermediatePhrases: Phrase[] = [
  P("es.p15", "☕", "hoy quiero café", "oy kiero kafé", "today I want coffee", ["hoy", "quiero", "café"], ["agua", "pan"]),
  P("es.p16", "🍎", "quiero una manzana", "kiero una mansana", "I want an apple", ["quiero", "una", "manzana"], ["mesa", "café"]),
  P("es.p17", "🏠", "mi casa es grande", "mi kasa es grande", "my house is big", ["mi", "casa", "es", "grande"], ["pequeña", "mesa"]),
  P("es.p18", "🪑", "la mesa es pequeña", "la mesa es pekenya", "the table is small", ["la", "mesa", "es", "pequeña"], ["grande", "silla"]),
  P("es.p19", "💧", "ahora bebo agua", "aora bebo agua", "now I drink water", ["ahora", "bebo", "agua"], ["café", "como"]),
  P("es.p20", "🏠", "mañana trabajo en casa", "manyana trabajo en kasa", "tomorrow I work at home", ["mañana", "trabajo", "en", "casa"], ["hoy", "noche"]),
  P("es.p21", "☕", "mañana quiero café", "manyana kiero kafé", "tomorrow I want coffee", ["mañana", "quiero", "café"], ["hoy", "agua"]),
  P("es.p22", "🪑", "quiero una silla grande", "kiero una siya grande", "I want a big chair", ["quiero", "una", "silla", "grande"], ["mesa", "pequeña"]),
  P("es.p23", "🍗", "como pollo y pan", "como poyo i pan", "I eat chicken and bread", ["como", "pollo", "y", "pan"], ["queso", "agua"]),
  P("es.p24", "🧀", "el queso es rico", "el keso es riko", "the cheese is delicious", ["el", "queso", "es", "rico"], ["pollo", "no"]),
  P("es.p25", "🌙", "esta noche bebo café", "esta noche bebo kafé", "tonight I drink coffee", ["esta", "noche", "bebo", "café"], ["mañana", "agua"]),
  P("es.p26", "🏠", "mañana como en casa", "manyana como en kasa", "tomorrow I eat at home", ["mañana", "como", "en", "casa"], ["hoy", "noche"]),
  P("es.p27", "🍞", "quiero pan y queso", "kiero pan i keso", "I want bread and cheese", ["quiero", "pan", "y", "queso"], ["café", "manzana"]),
  P("es.p28", "🍎", "la manzana es grande", "la mansana es grande", "the apple is big", ["la", "manzana", "es", "grande"], ["pequeña", "mesa"]),
];

/* ── French intermediate phrases ──────────────────────────────────────── */
export const frenchIntermediatePhrases: Phrase[] = [
  P("fr.p15", "☕", "aujourd'hui je veux du café", "ozhur-dwi zhuh vuh du kafe", "today I want coffee", ["aujourd'hui", "je", "veux", "du", "café"], ["pain", "eau"]),
  P("fr.p16", "🍎", "je veux une pomme", "zhuh vuh ün pom", "I want an apple", ["je", "veux", "une", "pomme"], ["table", "café"]),
  P("fr.p17", "🏠", "ma maison est grande", "ma mezon e grand", "my house is big", ["ma", "maison", "est", "grande"], ["petite", "table"]),
  P("fr.p18", "🪑", "la table est petite", "la tabl e puhtit", "the table is small", ["la", "table", "est", "petite"], ["grande", "chaise"]),
  P("fr.p19", "💧", "maintenant je bois de l'eau", "ment-nan zhuh bwa duh lo", "now I drink water", ["maintenant", "je", "bois", "de", "l'eau"], ["café", "mange"]),
  P("fr.p20", "💼", "demain je travaille", "duh-man zhuh travai", "tomorrow I work", ["demain", "je", "travaille"], ["aujourd'hui", "nuit"]),
  P("fr.p21", "☕", "demain je veux du café", "duh-man zhuh vuh du kafe", "tomorrow I want coffee", ["demain", "je", "veux", "du", "café"], ["aujourd'hui", "eau"]),
  P("fr.p22", "🪑", "je veux une grande chaise", "zhuh vuh ün grand shez", "I want a big chair", ["je", "veux", "une", "grande", "chaise"], ["table", "petite"]),
  P("fr.p23", "🍗", "je mange du poulet et du pain", "zhuh manzh du pule e du pan", "I eat chicken and bread", ["je", "mange", "du", "poulet", "et", "du", "pain"], ["fromage", "eau"]),
  P("fr.p24", "🧀", "le fromage est très bon", "luh fromazh e tre bon", "the cheese is very good", ["le", "fromage", "est", "très", "bon"], ["poulet", "non"]),
  P("fr.p25", "☕", "maintenant je bois du café", "ment-nan zhuh bwa du kafe", "now I drink coffee", ["maintenant", "je", "bois", "du", "café"], ["demain", "eau"]),
  P("fr.p26", "🏠", "demain je mange à la maison", "duh-man zhuh manzh a la mezon", "tomorrow I eat at home", ["demain", "je", "mange", "à", "la", "maison"], ["aujourd'hui", "nuit"]),
  P("fr.p27", "🍞", "je veux du pain et du fromage", "zhuh vuh du pan e du fromazh", "I want bread and cheese", ["je", "veux", "du", "pain", "et", "du", "fromage"], ["café", "pomme"]),
  P("fr.p28", "🍎", "la pomme est grande", "la pom e grand", "the apple is big", ["la", "pomme", "est", "grande"], ["petite", "table"]),
];

/* ── Spanish intermediate units ───────────────────────────────────────── */
export const spanishIntermediateUnits: Unit[] = [
  {
    id: "es.u5",
    title: "Vida diaria",
    latin: "Intermediate · daily life",
    glyph: "☀️",
    tint: "jade",
    lessons: [
      {
        id: "es.u5.l1",
        title: "Lo que quiero",
        latin: "What I want",
        intro: "Pide lo que quieres con las palabras que ya conoces.",
        kind: "lesson",
        newLexemes: ["es.quiero", "es.agua", "es.cafe", "es.manzana", "es.pan"],
        phrases: ["es.p15", "es.p16"],
        ear: [
          ear("es.e17", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "a"),
          ear("es.e18", "s ↔ z", ["casa", "kasa", "house"], ["caza", "kasa", "hunting"], "a"),
        ],
      },
      {
        id: "es.u5.l2",
        title: "En casa",
        latin: "At home",
        intro: "Describe tu casa con frases completas.",
        kind: "lesson",
        newLexemes: ["es.casa", "es.mesa", "es.silla", "es.grande", "es.pequeno"],
        phrases: ["es.p17", "es.p18"],
        ear: [
          ear("es.e19", "ll sound", ["pollo", "poyo", "chicken"], ["polo", "polo", "pole"], "a"),
          ear("es.e20", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "b"),
        ],
      },
      {
        id: "es.u5.l3",
        title: "El día",
        latin: "The day",
        intro: "Cuenta lo que haces hoy y mañana.",
        kind: "lesson",
        newLexemes: ["es.hoy", "es.manana", "es.noche", "es.ahora", "es.tarde"],
        phrases: ["es.p19", "es.p20"],
        ear: [
          ear("es.e21", "s ↔ z", ["casa", "kasa", "house"], ["caza", "kasa", "hunting"], "b"),
          ear("es.e22", "ll sound", ["pollo", "poyo", "chicken"], ["polo", "polo", "pole"], "b"),
        ],
      },
      {
        id: "es.u5.l4",
        title: "Repaso",
        latin: "Checkpoint",
        intro: "Repasa este capítulo.",
        kind: "checkpoint",
        newLexemes: [],
        phrases: ["es.p15", "es.p16", "es.p17", "es.p18", "es.p19", "es.p20"],
        ear: [
          ear("es.e23", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "a"),
          ear("es.e24", "s ↔ z", ["casa", "kasa", "house"], ["caza", "kasa", "hunting"], "a"),
        ],
      },
    ],
  },
  {
    id: "es.u6",
    title: "Planes",
    latin: "Intermediate · plans",
    glyph: "🗺️",
    tint: "violet",
    lessons: [
      {
        id: "es.u6.l1",
        title: "Mañana",
        latin: "Tomorrow",
        intro: "Habla de tus planes para mañana.",
        kind: "lesson",
        newLexemes: ["es.manana", "es.trabajo", "es.casa", "es.quiero"],
        phrases: ["es.p21", "es.p22"],
        ear: [
          ear("es.e25", "ll sound", ["pollo", "poyo", "chicken"], ["polo", "polo", "pole"], "a"),
          ear("es.e26", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "b"),
        ],
      },
      {
        id: "es.u6.l2",
        title: "Comer fuera",
        latin: "Eating out",
        intro: "Combina comida y opiniones en una frase.",
        kind: "lesson",
        newLexemes: ["es.como", "es.bebo", "es.pollo", "es.queso", "es.rico"],
        phrases: ["es.p23", "es.p24"],
        ear: [
          ear("es.e27", "s ↔ z", ["casa", "kasa", "house"], ["caza", "kasa", "hunting"], "b"),
          ear("es.e28", "ll sound", ["pollo", "poyo", "chicken"], ["polo", "polo", "pole"], "b"),
        ],
      },
      {
        id: "es.u6.l3",
        title: "Una semana",
        latin: "A week",
        intro: "Ordena tus días con el vocabulario que ya tienes.",
        kind: "lesson",
        newLexemes: ["es.hoy", "es.manana", "es.noche", "es.trabajo"],
        phrases: ["es.p25", "es.p26"],
        ear: [
          ear("es.e29", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "a"),
          ear("es.e30", "s ↔ z", ["casa", "kasa", "house"], ["caza", "kasa", "hunting"], "a"),
        ],
      },
      {
        id: "es.u6.l4",
        title: "En marcha",
        latin: "On the move",
        intro: "Lleva lo que sabes a una conversación cotidiana.",
        kind: "lesson",
        newLexemes: ["es.agua", "es.cafe", "es.manzana", "es.pan"],
        phrases: ["es.p27", "es.p28"],
        ear: [
          ear("es.e17", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "a"),
          ear("es.e18", "s ↔ z", ["casa", "kasa", "house"], ["caza", "kasa", "hunting"], "a"),
        ],
      },
      {
        id: "es.u6.l5",
        title: "Repaso final",
        latin: "Final checkpoint",
        intro: "Repasa todo lo que practicaste en este nivel.",
        kind: "checkpoint",
        newLexemes: [],
        phrases: ["es.p21", "es.p22", "es.p23", "es.p24", "es.p25", "es.p26", "es.p27", "es.p28"],
        ear: [
          ear("es.e19", "ll sound", ["pollo", "poyo", "chicken"], ["polo", "polo", "pole"], "a"),
          ear("es.e20", "rolled r", ["perro", "perro", "dog"], ["pero", "pero", "but"], "b"),
        ],
      },
    ],
  },
];

/* ── French intermediate units ────────────────────────────────────────── */
export const frenchIntermediateUnits: Unit[] = [
  {
    id: "fr.u5",
    title: "La vie quotidienne",
    latin: "Intermediate · daily life",
    glyph: "☀️",
    tint: "jade",
    lessons: [
      {
        id: "fr.u5.l1",
        title: "Ce que je veux",
        latin: "What I want",
        intro: "Demande ce que tu veux avec les mots que tu connais.",
        kind: "lesson",
        newLexemes: ["fr.veux", "fr.eau", "fr.cafe", "fr.pomme", "fr.pain"],
        phrases: ["fr.p15", "fr.p16"],
        ear: [
          ear("fr.e17", "u ↔ ou", ["dessus", "dusü", "on top"], ["dessous", "dusu", "underneath"], "a"),
          ear("fr.e18", "s ↔ z", ["poisson", "pwason", "fish"], ["poison", "pwazon", "poison"], "a"),
        ],
      },
      {
        id: "fr.u5.l2",
        title: "À la maison",
        latin: "At home",
        intro: "Décris ta maison avec des phrases complètes.",
        kind: "lesson",
        newLexemes: ["fr.maison", "fr.table", "fr.chaise", "fr.grand", "fr.petit"],
        phrases: ["fr.p17", "fr.p18"],
        ear: [
          ear("fr.e19", "nasal", ["pain", "pan", "bread"], ["pan", "pan", "pan"], "a"),
          ear("fr.e20", "u ↔ ou", ["tu", "tü", "you"], ["tout", "tu", "all"], "b"),
        ],
      },
      {
        id: "fr.u5.l3",
        title: "La journée",
        latin: "The day",
        intro: "Raconte ce que tu fais aujourd'hui et demain.",
        kind: "lesson",
        newLexemes: ["fr.aujourdhui", "fr.demain", "fr.nuit", "fr.maintenant"],
        phrases: ["fr.p19", "fr.p20"],
        ear: [
          ear("fr.e21", "s ↔ z", ["poison", "pwazon", "poison"], ["poisson", "pwason", "fish"], "b"),
          ear("fr.e22", "nasal", ["pain", "pan", "bread"], ["pan", "pan", "pan"], "b"),
        ],
      },
      {
        id: "fr.u5.l4",
        title: "Révision",
        latin: "Checkpoint",
        intro: "Révise ce chapitre.",
        kind: "checkpoint",
        newLexemes: [],
        phrases: ["fr.p15", "fr.p16", "fr.p17", "fr.p18", "fr.p19", "fr.p20"],
        ear: [
          ear("fr.e23", "u ↔ ou", ["dessus", "dusü", "on top"], ["dessous", "dusu", "underneath"], "b"),
          ear("fr.e24", "s ↔ z", ["poisson", "pwason", "fish"], ["poison", "pwazon", "poison"], "b"),
        ],
      },
    ],
  },
  {
    id: "fr.u6",
    title: "Projets",
    latin: "Intermediate · plans",
    glyph: "🗺️",
    tint: "violet",
    lessons: [
      {
        id: "fr.u6.l1",
        title: "Demain",
        latin: "Tomorrow",
        intro: "Parle de tes projets pour demain.",
        kind: "lesson",
        newLexemes: ["fr.demain", "fr.travaille", "fr.maison", "fr.veux"],
        phrases: ["fr.p21", "fr.p22"],
        ear: [
          ear("fr.e25", "nasal", ["pain", "pan", "bread"], ["pan", "pan", "pan"], "a"),
          ear("fr.e26", "u ↔ ou", ["tu", "tü", "you"], ["tout", "tu", "all"], "a"),
        ],
      },
      {
        id: "fr.u6.l2",
        title: "Manger dehors",
        latin: "Eating out",
        intro: "Combine la nourriture et les opinions.",
        kind: "lesson",
        newLexemes: ["fr.mange", "fr.bois", "fr.poulet", "fr.fromage", "fr.delicieux"],
        phrases: ["fr.p23", "fr.p24"],
        ear: [
          ear("fr.e27", "s ↔ z", ["poison", "pwazon", "poison"], ["poisson", "pwason", "fish"], "a"),
          ear("fr.e28", "nasal", ["pain", "pan", "bread"], ["pan", "pan", "pan"], "b"),
        ],
      },
      {
        id: "fr.u6.l3",
        title: "Une semaine",
        latin: "A week",
        intro: "Organise tes journées avec le vocabulaire connu.",
        kind: "lesson",
        newLexemes: ["fr.aujourdhui", "fr.demain", "fr.nuit", "fr.travaille"],
        phrases: ["fr.p25", "fr.p26"],
        ear: [
          ear("fr.e29", "u ↔ ou", ["dessus", "dusü", "on top"], ["dessous", "dusu", "underneath"], "b"),
          ear("fr.e30", "s ↔ z", ["poisson", "pwason", "fish"], ["poison", "pwazon", "poison"], "a"),
        ],
      },
      {
        id: "fr.u6.l4",
        title: "En route",
        latin: "On the move",
        intro: "Utilise ce que tu sais dans une conversation quotidienne.",
        kind: "lesson",
        newLexemes: ["fr.eau", "fr.cafe", "fr.pomme", "fr.pain"],
        phrases: ["fr.p27", "fr.p28"],
        ear: [
          ear("fr.e17", "u ↔ ou", ["dessus", "dusü", "on top"], ["dessous", "dusu", "underneath"], "a"),
          ear("fr.e18", "s ↔ z", ["poisson", "pwason", "fish"], ["poison", "pwazon", "poison"], "a"),
        ],
      },
      {
        id: "fr.u6.l5",
        title: "Révision finale",
        latin: "Final checkpoint",
        intro: "Revois tout ce que tu as pratiqué à ce niveau.",
        kind: "checkpoint",
        newLexemes: [],
        phrases: ["fr.p21", "fr.p22", "fr.p23", "fr.p24", "fr.p25", "fr.p26", "fr.p27", "fr.p28"],
        ear: [
          ear("fr.e19", "nasal", ["pain", "pan", "bread"], ["pan", "pan", "pan"], "a"),
          ear("fr.e20", "u ↔ ou", ["tu", "tü", "you"], ["tout", "tu", "all"], "b"),
        ],
      },
    ],
  },
];
