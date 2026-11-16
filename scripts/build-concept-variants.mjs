import { generateConceptVariants } from "./concept-variants.mjs";

const force = process.argv.includes("--force");
const result = await generateConceptVariants({ force });

console.log(
  `${result.sources} concept photos: ${result.refreshedSources} source(s) refreshed, ${result.generated} variants generated, ${result.skipped} unchanged.`,
);

if (result.sources === 0) {
  console.error("No concept photos found in public/concepts.");
  process.exitCode = 1;
}
