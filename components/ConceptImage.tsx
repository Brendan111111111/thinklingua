import { CONCEPT_PHOTOS, FALLBACK_CONCEPT_PHOTO } from "./conceptPhotos";
import { cn } from "./ui";

// Covers each rendered size at 2x/3x: 28→56, 48→96/144, 64→144/240, 80→240.
const VARIANT_WIDTHS = [56, 96, 144, 240] as const;

function variantFor(src: string, requestedWidth: number): string {
  const filename = src.split("/").pop() ?? "";
  const base = filename.replace(/\.[^.]+$/, "");
  const width = VARIANT_WIDTHS.find((candidate) => candidate >= requestedWidth) ?? VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
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
  const twoX = variantFor(photo.src, renderSize * 2);
  const threeX = variantFor(photo.src, renderSize * 3);
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
