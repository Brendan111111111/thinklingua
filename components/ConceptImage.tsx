import { CONCEPT_PHOTOS, FALLBACK_CONCEPT_PHOTO } from "./conceptPhotos";
import { cn } from "./ui";

// Preserve the original variant ladder for the larger prompt, build and
// speaking images. Only the 96px answer choices use the new density variants.
const VARIANT_WIDTHS = [56, 96, 144, 240] as const;
const ANSWER_CHOICE_VARIANT_WIDTHS = [192, 288] as const;

function variantFor(src: string, requestedWidth: number, widths: readonly number[]): string {
  const filename = src.split("/").pop() ?? "";
  const base = filename.replace(/\.[^.]+$/, "");
  const width = widths.find((candidate) => candidate >= requestedWidth) ?? widths[widths.length - 1];
  return `/concepts/opt/${base}-${width}.webp`;
}

export function ConceptImage({
  glyph,
  renderSize,
  className,
  label,
}: {
  glyph: string;
  /** Display size in CSS pixels; controls the box and the responsive density hints. */
  renderSize: number;
  className?: string;
  label?: string;
}) {
  const photo = CONCEPT_PHOTOS[glyph] ?? FALLBACK_CONCEPT_PHOTO;
  const widths = renderSize === 96 ? ANSWER_CHOICE_VARIANT_WIDTHS : VARIANT_WIDTHS;
  const twoX = variantFor(photo.src, renderSize * 2, widths);
  const threeX = variantFor(photo.src, renderSize * 3, widths);
  const srcSet = twoX === threeX ? `${twoX} 2x` : `${twoX} 2x, ${threeX} 3x`;

  return (
    <img
      src={twoX}
      srcSet={srcSet}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      width={renderSize}
      height={renderSize}
      style={{ width: renderSize, height: renderSize }}
      loading="lazy"
      decoding="async"
      draggable={false}
      data-concept={glyph}
      className={cn("shrink-0 rounded-xl bg-panel object-cover", className)}
    />
  );
}
