"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { courses, getCourse, scriptClass } from "@/lib/content";
import { HEART_MAX, heartsNow, levelFor, levelProgress, rankFor, setActiveLanguage, useProgress } from "@/lib/progress";
import { loadEngine, type EngineInfo } from "@/lib/speech";
import { Icon, ProgressBar, Ring, cn, type IconName } from "./ui";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/learn", label: "Learn", icon: "book" },
  { href: "/review", label: "Review", icon: "review" },
  { href: "/tutor", label: "AI partner", icon: "chat" },
  { href: "/progress", label: "Progress", icon: "chart" },
  { href: "/settings", label: "Settings", icon: "gear" },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { progress, ready } = useProgress();
  const [engine, setEngine] = useState<EngineInfo | null>(null);

  useEffect(() => {
    let active = true;
    loadEngine().then((info) => {
      if (active) setEngine(info);
    });
    return () => {
      active = false;
    };
  }, []);

  const course = getCourse(progress.active) ?? courses[0];
  const level = levelFor(progress.xp);
  const hearts = heartsNow(progress);

  function switchTo(id: string) {
    setActiveLanguage(id as typeof progress.active);
    router.push(`/learn/${id}`);
  }

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col border-r border-line/60 bg-ink2/80 px-5 py-6 backdrop-blur-xl lg:flex">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-jade via-emerald-300 to-gold text-lg font-bold text-ink shadow-[0_10px_30px_-14px_rgba(61,224,174,0.8)]">
            <span className={scriptClass[course.id]}>{course.id === "ja" ? "あ" : course.id === "th" ? "ก" : "A"}</span>
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-semibold tracking-tight">ThinkLingua</span>
            <span className="block text-[11px] text-muted">no translation, ever</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-panel text-cream shadow-[inset_0_0_0_1px_rgba(61,224,174,0.22)]" : "text-muted hover:bg-panel/60 hover:text-cream",
                )}
              >
                <Icon name={item.icon} className={cn("h-[18px] w-[18px]", active && "text-jade")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-line/70 bg-panel/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Goal</span>
            <span className="text-[11px] text-muted">{Math.round(levelProgress(progress.xp) * 100)}%</span>
          </div>
          <p className="mt-1 font-display text-lg text-cream">
            Level {level} · <span className={scriptClass[course.id]}>{rankFor(course, progress.xp)}</span>
          </p>
          <ProgressBar value={levelProgress(progress.xp)} className="mt-2" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {courses.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => switchTo(option.id)}
                title={`${option.english}${option.primary ? " · primary" : ""}`}
                className={cn(
                  "grid h-8 w-9 place-items-center rounded-lg border text-sm transition",
                  option.id === course.id
                    ? "border-jade/50 bg-jade/10"
                    : "border-line/70 bg-panel/40 opacity-70 hover:opacity-100",
                )}
              >
                {option.flag}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-2 pt-6">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <span className={cn("h-2 w-2 rounded-full", engine?.native ? "bg-jade" : "bg-gold")} />
            <span className="truncate">{engine ? engine.label : "checking voice…"}</span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: HEART_MAX }).map((_, index) => (
              <Icon
                key={index}
                name="heart"
                className={cn("h-4 w-4", index < hearts ? "text-sakura" : "text-line")}
              />
            ))}
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-line/60 bg-ink/85 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-jade to-gold text-sm font-bold text-ink">
              <span className={scriptClass[course.id]}>{course.id === "ja" ? "あ" : course.id === "th" ? "ก" : "A"}</span>
            </span>
            <span className="font-display text-[15px] font-semibold">ThinkLingua</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold">
              <Icon name="flame" className="h-4 w-4" />
              {progress.streak}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-jade">
              <Icon name="bolt" className="h-4 w-4" />
              {progress.xp}
            </span>
            <Ring value={hearts / HEART_MAX} size={34} stroke={3.5} tone="#ff7ea0">
              <span className="text-[10px] font-bold">{hearts}</span>
            </Ring>
          </div>
        </div>
      </header>

      <main className="pb-24 lg:pb-12 lg:pl-[258px]">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-ink2/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition",
                  active ? "text-jade" : "text-muted",
                )}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
