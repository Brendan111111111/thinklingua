import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST_PATH = path.join(ROOT, "scripts", "concept-variants.json");

export const CONCEPT_VARIANT_WIDTHS = [56, 96, 144, 192, 240, 288, 360];

function readManifest(file) {
  try {
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    return manifest && typeof manifest === "object" ? manifest : {};
  } catch {
    return {};
  }
}

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function writeManifest(file, manifest) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

export async function generateConceptVariants({
  sourceDir = path.join(ROOT, "public", "concepts"),
  outputDir = path.join(ROOT, "public", "concepts", "opt"),
  manifestPath = DEFAULT_MANIFEST_PATH,
  force = false,
  log = () => {},
} = {}) {
  fs.mkdirSync(outputDir, { recursive: true });

  const sources = fs
    .readdirSync(sourceDir)
    .filter((file) => /\.(jpe?g|png)$/i.test(file))
    .sort();
  const previous = readManifest(manifestPath);
  const next = {};

  let refreshedSources = 0;
  let generated = 0;
  let skipped = 0;

  for (const file of sources) {
    const sourcePath = path.join(sourceDir, file);
    const sourceHash = hashFile(sourcePath);
    const changed = force || previous[file] !== sourceHash;
    if (changed) refreshedSources += 1;

    for (const width of CONCEPT_VARIANT_WIDTHS) {
      const destination = path.join(outputDir, `${path.parse(file).name}-${width}.webp`);
      if (!changed && fs.existsSync(destination)) {
        skipped += 1;
        continue;
      }

      await sharp(sourcePath)
        .resize(width, width, { fit: "cover" })
        .webp({ quality: 82, effort: 6 })
        .toFile(destination);

      generated += 1;
      log(`generated ${path.relative(ROOT, destination)}`);
    }

    next[file] = sourceHash;
  }

  writeManifest(manifestPath, next);

  return { sources: sources.length, refreshedSources, generated, skipped };
}
