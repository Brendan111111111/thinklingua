import type { ReactNode } from "react";

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export type IconName =
  | "book"
  | "review"
  | "chat"
  | "chart"
  | "gear"
  | "play"
  | "arrow"
  | "check"
  | "x"
  | "flame"
  | "heart"
  | "bolt"
  | "mic"
  | "eye"
  | "lock"
  | "speaker"
  | "globe";

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = {
    className: cn("h-5 w-5", className),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
          <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
          <path d="M8 7h7" />
        </svg>
      );
    case "review":
      return (
        <svg {...common}>
          <path d="M20 12a8 8 0 1 1-2.6-5.9" />
          <path d="M20 4v4h-4" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 5.5h16v10H9.5L4 19V5.5Z" />
          <path d="M8 9.5h8M8 12.5h5" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5M4 19h16" />
          <path d="M8 16v-4M12 16V8M16 16v-6" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3v2.4M12 18.6V21M4.2 7.5l2 1.2M17.8 15.3l2 1.2M4.2 16.5l2-1.2M17.8 8.7l2-1.2" />
        </svg>
      );
    case "play":
      return (
        <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.2c0-.8.9-1.3 1.6-.9l9 6.8c.6.4.6 1.4 0 1.8l-9 6.8c-.7.4-1.6-.1-1.6-.9V5.2Z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 13l4 4L19 7" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case "flame":
      return (
        <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.5s5.6 4.8 5.6 9.6a5.6 5.6 0 0 1-11.2 0c0-2.4 1.2-3.9 2.4-4.9.1 2.2 1 3.3 2.1 3.3 1.2 0 1.4-2.4 1.1-8Z" />
        </svg>
      );
    case "heart":
      return (
        <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 20.4S4 15.6 4 10.4A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8 2.8c0 5.2-8 10-8 10Z" />
        </svg>
      );
    case "bolt":
      return (
        <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 2 5 13.2h5.2L9 22l8.8-11.4h-5.3L13.5 2Z" />
        </svg>
      );
    case "mic":
      return (
        <svg {...common}>
          <rect x="9" y="3" width="6" height="10" rx="3" />
          <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
        </svg>
      );
    case "speaker":
      return (
        <svg {...common}>
          <path d="M4 9.5v5h3.4L12 18.5v-13L7.4 9.5H4Z" />
          <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
          <path d="M18 6.5a7.6 7.6 0 0 1 0 11" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.8 9.5h16.4M3.8 14.5h16.4M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5Z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Stat({
  icon,
  value,
  tone = "cream",
  label,
}: {
  icon: IconName;
  value: ReactNode;
  tone?: "cream" | "gold" | "jade" | "sakura";
  label?: string;
}) {
  const tones = {
    cream: "text-cream",
    gold: "text-gold",
    jade: "text-jade",
    sakura: "text-sakura",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", tones[tone])} title={label}>
      <Icon name={icon} className="h-4 w-4" />
      {value}
    </span>
  );
}

export function ProgressBar({ value, className, tone = "jade" }: { value: number; className?: string; tone?: string }) {
  const tones: Record<string, string> = {
    jade: "from-jade to-emerald-300",
    gold: "from-gold to-amber-200",
    sakura: "from-sakura to-rose-300",
    sky: "from-sky to-cyan-200",
    violet: "from-violet to-indigo-300",
  };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-line/70", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-500", tones[tone] ?? tones.jade)}
        style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
      />
    </div>
  );
}

export function Ring({
  value,
  size = 56,
  stroke = 5,
  tone = "#3de0ae",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: string;
  children?: ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,189,0.18)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          style={{ transition: "stroke-dashoffset 500ms ease" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{children}</span>
    </div>
  );
}

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "jade" | "gold" | "sakura" | "violet" }) {
  const tones = {
    muted: "border-line bg-panel/60 text-muted",
    jade: "border-jade/30 bg-jade/10 text-jade",
    gold: "border-gold/30 bg-gold/10 text-gold",
    sakura: "border-sakura/30 bg-sakura/10 text-sakura",
    violet: "border-violet/30 bg-violet/10 text-violet",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}
