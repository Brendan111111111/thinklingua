import { cn, withDefaultSize } from "./ui";

/** Local SVG flags from the MIT-licensed flag-icons set. */
export function CourseFlag({ code, className }: { code: string; className?: string }) {
  return (
    <img
      src={`/flags/${code}.svg`}
      alt=""
      aria-hidden="true"
      data-flag={code}
      className={cn(
        "inline-block shrink-0 rounded-[2px] object-cover ring-1 ring-line/40",
        withDefaultSize(className, "h-4 w-6"),
      )}
    />
  );
}
