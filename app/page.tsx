import Link from "next/link";
import { courses, getCourse, scriptClass } from "@/lib/content";
import { SpeakButton } from "@/components/SpeakButton";
import { Badge, Icon, cn } from "@/components/ui";

const thai = getCourse("th");
const japanese = getCourse("ja");

function ConceptCard({
  locale,
  glyph,
  word,
  latin,
  meaning,
  script,
  tone,
}: {
  locale: string;
  glyph: string;
  word: string;
  latin: string;
  meaning: string;
  script: string;
  tone: string;
}) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-start justify-between">
        <span className="text-3xl">{glyph}</span>
        <SpeakButton text={word} locale={locale} size="md" />
      </div>
      <p className={cn("mt-4 text-2xl font-semibold", script)}>{word}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">{latin}</p>
      <details className="group mt-3">
        <summary className={cn("cursor-pointer list-none text-[11px] font-semibold uppercase tracking-wide", tone)}>
          peek the meaning
        </summary>
        <p className="mt-1 text-sm text-cream/90">{meaning}</p>
      </details>
    </div>
  );
}

export default function LandingPage() {
  const thaiFish = thai?.lexemes["th.plaa"];
  const thaiWater = thai?.lexemes["th.nam"];
  const jaWater = japanese?.lexemes["ja.mizu"];
  const jaTea = japanese?.lexemes["ja.ocha"];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-jade/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-24 h-[26rem] w-[26rem] rounded-full bg-gold/10 blur-[120px]" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-jade via-emerald-300 to-gold text-lg font-bold text-ink">
            あ
          </span>
          <div className="leading-tight">
            <p className="font-display text-[17px] font-semibold">ThinkLingua</p>
            <p className="text-[11px] text-muted">no translation, ever</p>
          </div>
        </div>
        <nav className="hidden items-center gap-7 text-sm text-muted sm:flex">
          <a href="#method" className="transition hover:text-cream">
            Method
          </a>
          <a href="#voices" className="transition hover:text-cream">
            Voices
          </a>
          <a href="#courses" className="transition hover:text-cream">
            Courses
          </a>
        </nav>
        <Link href="/learn" className="btn btn-primary px-5 py-2.5 text-sm">
          Start free
        </Link>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-5 pb-24">
        {/* hero */}
        <section className="grid items-center gap-12 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="jade">Thai</Badge>
              <Badge tone="sakura">Japanese</Badge>
              <Badge tone="muted">Spanish · French</Badge>
            </div>
            <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,4.3rem)] font-semibold leading-[0.98] tracking-tight">
              Stop translating.
              <br />
              <span className="bg-gradient-to-r from-jade via-emerald-200 to-gold bg-clip-text text-transparent">Start thinking.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
              You did not learn your first language by matching words to another one. You saw a thing, heard a sound, and the
              meaning stuck. ThinkLingua gives you that again — a picture, a native voice, and a meaning that never passes through
              English.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/learn/th" className="btn btn-primary px-6 py-3.5">
                เริ่มเรียนภาษาไทย
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link href="/learn/ja" className="btn btn-ghost px-6 py-3.5">
                日本語をはじめる
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted">
              No sign-up. Progress lives on your device. English is one tap away — and it costs you the streak.
            </p>
          </div>

          <div className="relative">
            <div className="card p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-jade">What a lesson feels like</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line/70 bg-ink/40 text-3xl">🐟</span>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-muted">concept</p>
                    <p className="text-sm text-cream">a fish, not the word &ldquo;fish&rdquo;</p>
                  </div>
                </div>
                <div className="ml-6 h-6 w-px bg-gradient-to-b from-jade/70 to-transparent" />
                <div className="flex items-center gap-4">
                  <SpeakButton text={thaiFish?.text ?? "ปลา"} locale="th-TH" size="md" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-muted">sound</p>
                    <p className="text-sm text-cream">a Thai speaker, not a synthesiser guessing</p>
                  </div>
                </div>
                <div className="ml-6 h-6 w-px bg-gradient-to-b from-jade/70 to-transparent" />
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line/70 bg-ink/40 text-2xl script-th text-gold">
                    {thaiFish?.text ?? "ปลา"}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-muted">word</p>
                    <p className="text-sm text-cream">the label arrives last, attached to meaning</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-line/60 bg-panel2/50 px-4 py-3">
                <span className="text-xs text-muted">Your first sentence</span>
                <span className="text-sm text-cream/90 script-th">&ldquo;ปลาอร่อยมาก&rdquo;</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 hidden rotate-2 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-2 text-xs text-gold shadow-lg sm:block">
              🔥 no-English multiplier ×1.4
            </div>
          </div>
        </section>

        {/* concept cards */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {thaiFish && <ConceptCard locale="th-TH" glyph="🐟" word={thaiFish.text} latin={thaiFish.latin} meaning={thaiFish.gloss} script="script-th" tone="text-gold" />}
          {thaiWater && <ConceptCard locale="th-TH" glyph="💧" word={thaiWater.text} latin={thaiWater.latin} meaning={thaiWater.gloss} script="script-th" tone="text-gold" />}
          {jaWater && <ConceptCard locale="ja-JP" glyph="💧" word={jaWater.text} latin={jaWater.latin} meaning={jaWater.gloss} script="script-ja" tone="text-sakura" />}
          {jaTea && <ConceptCard locale="ja-JP" glyph="🍵" word={jaTea.text} latin={jaTea.latin} meaning={jaTea.gloss} script="script-ja" tone="text-sakura" />}
        </section>

        {/* method */}
        <section id="method" className="py-20">
          <p className="text-[11px] uppercase tracking-[0.2em] text-jade">The method</p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Four steps that build an inner voice, not a lookup table
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Picture it",
                body: "A word is introduced with an image and a scene. The meaning is felt, so the English label never gets a foothold.",
              },
              {
                step: "02",
                title: "Hear it",
                body: "Native neural voices speak at natural speed. Tone and mora drills train the ear before the mouth has to move.",
              },
              {
                step: "03",
                title: "Build it",
                body: "You assemble sentences from target-script tiles. Grammar is learned as shape and rhythm, not as a rule list.",
              },
              {
                step: "04",
                title: "Think it",
                body: "Picture-only prompts ask for the sentence directly. No English in, no English out — the shortcut is gone.",
              },
            ].map((item) => (
              <div key={item.step} className="card p-5">
                <p className="font-display text-xs text-jade">{item.step}</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* voices */}
        <section id="voices" className="card overflow-hidden p-7 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-jade">The voices</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">An accent, not an approximation</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Most apps read Thai with an English voice and hope for the best. ThinkLingua routes every word through a native
                neural voice for that language, then keeps the browser&apos;s best locale-matched voice as a fallback so audio never
                goes robotic.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="pill">Azure neural · th-TH-Premwadee</span>
                <span className="pill">Azure neural · ja-JP-Nanami</span>
                <span className="pill">Google Neural2</span>
                <span className="pill">ElevenLabs v2</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl border border-gold/25 bg-gold/[0.06] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold">Thai · five tones</p>
                <p className="mt-1 text-sm text-muted">
                  ไหม / ไม่ / ใหม่ are the same syllable with different tones and different meanings. The app drills the contrast
                  before it ever asks you to produce it.
                </p>
              </div>
              <div className="rounded-2xl border border-sakura/25 bg-sakura/[0.06] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sakura">Japanese · mora timing</p>
                <p className="mt-1 text-sm text-muted">
                  きて and きって are not the same word on a different day. Long vowels, doubled consonants and pitch get their own
                  listening drills.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* gamification */}
        <section className="grid gap-3 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { glyph: "🔥", title: "Streaks", body: "A calendar that only moves forward when you show up." },
            { glyph: "⚡", title: "XP & ranks", body: "Rank names come from the language itself, not from English." },
            { glyph: "🧠", title: "No-English multiplier", body: "Every lesson without a peek raises the XP you earn." },
            { glyph: "🎚️", title: "Ear badges", body: "Tone and mora wins are their own trophy shelf." },
          ].map((item) => (
            <div key={item.title} className="card p-5">
              <span className="text-2xl">{item.glyph}</span>
              <h3 className="mt-3 font-display text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </section>

        {/* courses */}
        <section id="courses">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-jade">Courses</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">Pick the language, keep the method</h2>
            </div>
            <Link href="/learn" className="btn btn-ghost px-5 py-2.5 text-sm">
              See every unit
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {courses.map((course) => (
              <Link key={course.id} href={`/learn/${course.id}`} className="card group p-5 transition hover:-translate-y-0.5 hover:border-jade/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{course.flag}</span>
                    <span className={cn("font-display text-lg font-semibold", scriptClass[course.id])}>{course.name}</span>
                  </div>
                  {course.primary ? <Badge tone="jade">flagship</Badge> : <Badge tone="muted">same method</Badge>}
                </div>
                <p className={cn("mt-2 text-sm text-cream/80", scriptClass[course.id])}>{course.tagline}</p>
                <p className="mt-3 text-[11px] text-muted">
                  {course.units.length} units · {course.scriptLabel}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-jade/25 bg-gradient-to-br from-jade/[0.09] via-panel/60 to-gold/[0.06] p-8 text-center">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">The first lesson takes three minutes.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            You will not see a single translation. You will end it able to say a sentence you have never said before.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/learn/th" className="btn btn-primary px-6 py-3.5">
              Learn Thai
            </Link>
            <Link href="/learn/ja" className="btn btn-primary px-6 py-3.5">
              Learn Japanese
            </Link>
            <Link href="/tutor" className="btn btn-ghost px-6 py-3.5">
              Meet the AI partner
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-line/60 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-muted sm:flex-row">
          <p>ThinkLingua · learn to think it, not translate it.</p>
          <p>
            Next.js · native neural voices · progress stored on device
          </p>
        </div>
      </footer>
    </div>
  );
}
