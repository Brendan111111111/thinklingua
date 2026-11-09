"use client";

import { useState } from "react";
import { Icon, cn } from "./ui";
import { speak } from "@/lib/speech";

type Props = {
  text: string;
  locale: string;
  rate?: number;
  size?: "sm" | "md" | "lg";
  variant?: "orb" | "ghost" | "plain";
  className?: string;
  label?: string;
};

const SIZES = {
  sm: { box: "h-9 w-9", icon: "h-4 w-4" },
  md: { box: "h-12 w-12", icon: "h-5 w-5" },
  lg: { box: "h-[74px] w-[74px]", icon: "h-7 w-7" },
} as const;

export function SpeakButton({ text, locale, rate = 1, size = "md", variant = "orb", className, label }: Props) {
  const [playing, setPlaying] = useState(false);

  async function play() {
    if (playing) return;
    setPlaying(true);
    try {
      await speak(text, { locale, rate });
    } finally {
      setPlaying(false);
    }
  }

  return (
    <button
      type="button"
      onClick={play}
      aria-label={label ?? `Play pronunciation: ${text}`}
      className={cn(
        variant === "orb" && "orb",
        variant === "ghost" && "btn btn-ghost",
        variant === "plain" && "text-muted transition hover:text-cream",
        variant !== "plain" && SIZES[size].box,
        playing && "playing",
        className,
      )}
    >
      {playing ? (
        <span className="soundbar" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </span>
      ) : (
        <Icon name={variant === "plain" ? "speaker" : "play"} className={SIZES[size].icon} />
      )}
    </button>
  );
}
