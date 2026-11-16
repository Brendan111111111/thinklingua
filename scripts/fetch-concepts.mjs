import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { generateConceptVariants } from "./concept-variants.mjs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

const concepts = [
  ["↩️", "return", "U-turn sign"],
  ["⌛", "time", "hourglass"],
  ["⏫", "too-much", "overflowing basket"],
  ["⏰", "what-time", "alarm clock"],
  ["⏱️", "now", "clock face"],
  ["⏳", "time", "hourglass"],
  ["▫️", "small", "small plant in hands"],
  ["☀️", "sun", "sun in blue sky"],
  ["☕", "coffee", "coffee cup"],
  ["⚡", "fast", "race car"],
  ["✅", "yes", "thumbs up"],
  ["✋", "want-take", "hand reaching out"],
  ["✔️", "already", "checklist"],
  ["❌", "no", "thumbs down"],
  ["❓", "what", "question mark"],
  ["❤️", "love", "couple holding hands"],
  ["➕", "also", "two coffee cups"],
  ["➡️", "go", "open road"],
  ["⬆️", "very", "mountain peak"],
  ["⬛", "big", "elephant"],
  ["🌄", "morning", "sunrise landscape"],
  ["🌅", "tomorrow", "wall calendar"],
  ["🌆", "evening", "city sunset"],
  ["🌙", "night", "full moon"],
  ["🌶️", "spicy", "red chili peppers"],
  ["🍎", "apple", "red apple"],
  ["🍗", "chicken", "roast chicken"],
  ["🍚", "rice", "bowl of rice"],
  ["🍞", "bread", "bread loaf"],
  ["🍬", "sweet", "colorful candy"],
  ["🍵", "tea", "green tea cup"],
  ["🍽️", "eat", "person eating"],
  ["🎁", "gift", "gift box"],
  ["🎓", "student", "student backpack"],
  ["🎚️", "audio-mixer", "audio mixer"],
  ["🏙️", "city", "city skyline"],
  ["🏠", "house", "traditional Japanese house"],
  ["🏡", "home", "living room"],
  ["🏪", "shop", "storefront"],
  ["🏫", "school", "school building"],
  ["🏷️", "sell", "price tag"],
  ["🐟", "fish", "fish"],
  ["🐢", "turtle", "turtle"],
  ["👉", "this", "hand pointing"],
  ["👋", "hello", "person waving"],
  ["👍", "good", "thumbs up"],
  ["👦", "older-brother", "young man portrait"],
  ["👧", "older-sister", "young woman portrait"],
  ["👨", "father", "father and child"],
  ["👨‍👩‍👧", "family", "family portrait"],
  ["👩", "mother", "mother and child"],
  ["👴", "grandfather", "elderly man portrait"],
  ["👵", "grandmother", "elderly woman portrait"],
  ["👶", "baby", "baby"],
  ["💧", "water", "glass of water"],
  ["💰", "how-much", "price tag"],
  ["💵", "money", "money banknotes"],
  ["💸", "expensive", "luxury watch"],
  ["💼", "work", "person working laptop"],
  ["📅", "day", "calendar"],
  ["📌", "be-at", "map pin"],
  ["📍", "here", "location pin"],
  ["📚", "study", "student studying"],
  ["📛", "name", "name tag"],
  ["🔀", "sometimes", "crossroads"],
  ["🔁", "every-day", "daily planner"],
  ["🔖", "thing", "everyday objects"],
  ["🔗", "of", "chain link"],
  ["🔢", "how-many", "counting coins"],
  ["🔥", "campfire", "campfire"],
  ["🔨", "hammer", "hammer and nails"],
  ["🕐", "hour", "clock face"],
  ["🕰️", "yesterday", "antique clock"],
  ["🗓️", "today", "calendar"],
  ["🗣️", "speak", "woman speaking microphone"],
  ["🗺️", "map", "world map"],
  ["🤏", "a-little", "hand pinching"],
  ["🤝", "nice-to-meet", "handshake"],
  ["🥚", "egg", "eggs"],
  ["🥤", "drink", "person drinking water"],
  ["🧀", "cheese", "cheese"],
  ["🧊", "cold", "ice cubes"],
  ["🧍", "person", "person standing"],
  ["🧑", "i", "woman selfie"],
  ["🧑‍🏫", "teacher", "teacher classroom"],
  ["🧑‍🤝‍🧑", "friend", "friends laughing"],
  ["🧒", "younger-sibling", "child portrait"],
  ["🧠", "brain", "brain model"],
  ["🧰", "toolbox", "toolbox"],
  ["🪑", "chair", "wooden chair"],
  ["🪙", "coin", "coins"],
  ["🫱", "have", "hand holding apple"],
  ["🫵", "you", "man pointing"],
  ["😋", "delicious", "woman eating"],
  ["😍", "want", "child reaching toy"],
  ["😴", "sleep", "person sleeping"],
  ["🙂", "yoroshiku", "business bow"],
  ["🙇", "polite-particle", "Japanese bow"],
  ["🙏", "thank-you", "praying hands"],
  ["🚆", "train", "Japanese train"],
  ["🚉", "station", "train station"],
  ["🚫", "not", "no entry sign"],
  ["🚲", "bicycle", "bicycle"],
  ["🚶", "walk", "person walking"],
  ["🛏️", "wake-up", "person waking up in bed"],
  ["🛒", "buy", "shopping cart"],
  ["🛣️", "far", "long road"],
  ["🛫", "leave", "airplane takeoff"],
  ["🛬", "come", "airplane landing"],
  ["🟰", "to-be", "identity card"],
  ["1️⃣", "one", "one finger"],
  ["2️⃣", "two", "two fingers"],
  ["3️⃣", "three", "three fingers"],
  ["🏁", "finish", "finish line"],
  ["👂", "ear", "ear"],
  ["👥", "group", "group of people"],
  ["💯", "hundred", "hundred percent"],
  ["💬", "speech", "people talking"],
  ["💎", "diamond", "diamond"],
  ["📘", "blue-book", "blue book"],
  ["📖", "open-book", "open book"],
  ["📰", "newspaper", "newspaper"],
  ["🏅", "medal", "medal"],
  ["🏆", "trophy", "trophy"],
  ["🏛️", "government", "government building"],
  ["🌱", "seedling", "seedling"],
  ["🌍", "globe", "globe"],
  ["🎯", "target", "target"],
  ["🎭", "theater", "theater masks"],
  ["🔮", "crystal-ball", "crystal ball"],
  ["🧭", "compass", "compass"],
  ["⚙️", "gears", "gears"],
  ["🎨", "palette", "paint palette"],
  ["🧩", "puzzle", "puzzle pieces"],
  ["🎤", "microphone", "microphone"],
  ["👑", "crown", "crown"],
  ["🇯🇵", "japanese-person", "japanese woman portrait"],
  ["table", "table", "wooden table"],
  ["chair", "chair", "wooden chair"],
  ["sit", "sit", "person sitting"],
];

const outDir = path.join(process.cwd(), "public", "concepts");
const componentPath = path.join(process.cwd(), "components", "conceptPhotos.ts");
const creditsPath = path.join(outDir, "CREDITS.md");
fs.mkdirSync(outDir, { recursive: true });

const fetched = new Map();

function curl(url, maxBuffer = 30 * 1024 * 1024) {
  return execFileSync(
    "curl",
    ["-sS", "-L", "-A", UA, "-H", "Accept-Language: en-US,en;q=0.9", "--max-time", "35", url],
    { encoding: "utf8", maxBuffer },
  );
}

function firstPhoto(html) {
  for (const match of html.matchAll(/<img[^>]+>/g)) {
    const tag = match[0];
    const src = tag.match(/src="(https:\/\/images\.pexels\.com\/photos\/[^"]+)"/)?.[1];
    const alt = tag.match(/alt="([^"]*)"/)?.[1];
    if (!src) continue;
    const base = src.split("?")[0];
    const id = base.match(/\/photos\/(\d+)\//)?.[1];
    if (!id) continue;
    return { base, id, alt: (alt ?? "").replaceAll("&amp;", "&") };
  }
  return null;
}

function download(url, destination) {
  execFileSync("curl", ["-sS", "-L", "-A", UA, "--max-time", "60", "-o", destination, url], {
    stdio: "pipe",
    maxBuffer: 30 * 1024 * 1024,
  });
}

for (const [glyph, slug, query] of concepts) {
  if (fetched.has(slug)) continue;
  const existing = fs
    .readdirSync(outDir)
    .find((file) => file.startsWith(`${slug}.`) && /\.(jpe?g|png)$/i.test(file));
  if (existing) {
    const src = `/concepts/${existing}`;
    fetched.set(slug, { src, alt: query });
    console.log(`keep ${slug} ${src}`);
    continue;
  }

  let found = null;
  for (let attempt = 0; attempt < 3 && !found; attempt += 1) {
    if (attempt > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500);
    try {
      const html = curl(`https://www.pexels.com/search/${encodeURIComponent(query)}/`);
      found = firstPhoto(html);
    } catch (error) {
      console.warn(`search failed ${slug} (${query}): ${error.message}`);
    }
  }
  if (!found) {
    console.warn(`NO RESULT ${slug} (${query})`);
    continue;
  }

  const extension = path.extname(new URL(found.base).pathname).toLowerCase() || ".jpg";
  const filename = `${slug}${extension}`;
  const destination = path.join(outDir, filename);
  const imageUrl = `${found.base}?auto=compress&cs=tinysrgb&w=512&h=512&fit=crop`;
  try {
    download(imageUrl, destination);
    const bytes = fs.statSync(destination).size;
    if (bytes < 1000) throw new Error(`too small: ${bytes} bytes`);
    const src = `/concepts/${filename}`;
    fetched.set(slug, {
      src,
      alt: found.alt || query,
      source: `https://www.pexels.com/photo/${found.id}/`,
      query,
    });
    console.log(`ok ${slug} ${src} (${bytes} bytes)`);
  } catch (error) {
    console.warn(`download failed ${slug}: ${error.message}`);
  }
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 900);
}

const missing = concepts.filter(([, slug]) => !fetched.has(slug));
if (missing.length) {
  console.error(`MISSING ${missing.length}: ${missing.map(([, slug]) => slug).join(", ")}`);
}

const entries = concepts.map(([glyph, slug, query]) => {
  const art = fetched.get(slug);
  return [
    `  ${JSON.stringify(glyph)}: { src: ${JSON.stringify(art?.src ?? "/concepts/what.jpg")}, alt: ${JSON.stringify(art?.alt ?? query)} },`,
  ].join("\n");
});

const generated = `// Generated by scripts/fetch-concepts.mjs. Photos are free-license Pexels assets.\nexport type ConceptPhoto = { src: string; alt: string };\n\nexport const CONCEPT_PHOTOS: Record<string, ConceptPhoto> = {\n${entries.join("\n")}\n};\n\nexport const FALLBACK_CONCEPT_PHOTO: ConceptPhoto = CONCEPT_PHOTOS["❓"];\n`;
fs.writeFileSync(componentPath, generated);

const creditLines = [
  "# Concept photo credits",
  "",
  "Concept photos are sourced from [Pexels](https://www.pexels.com/) under the [Pexels license](https://www.pexels.com/license/).",
  "The Pexels license does not require attribution. The search terms used to source the images are recorded in `scripts/fetch-concepts.mjs`.",
  "",
  "The individual photos were cropped to a square at download time. No other alterations were made.",
  "",
];
fs.writeFileSync(creditsPath, creditLines.join("\n"));

const variants = await generateConceptVariants();
console.log(
  `\nWrote ${fetched.size} photos, ${componentPath}, ${creditsPath}; generated ${variants.generated} concept variants.`,
);
