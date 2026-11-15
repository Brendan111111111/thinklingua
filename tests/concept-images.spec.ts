import { expect, test, type Locator, type Page } from "@playwright/test";

const DENSITIES = [
  {
    scale: 2,
    mapVariant: 56,
    mapNaturalWidth: 28,
    lessonVariant: 192,
    lessonNaturalWidth: 96,
    compactVariant: 144,
    compactNaturalWidth: 72,
    promptVariant: 240,
    promptNaturalWidth: 120,
  },
  {
    scale: 3,
    mapVariant: 96,
    mapNaturalWidth: 32,
    lessonVariant: 288,
    lessonNaturalWidth: 96,
    compactVariant: 240,
    compactNaturalWidth: 80,
    promptVariant: 240,
    promptNaturalWidth: 120,
  },
] as const;

type ConceptRequestLog = {
  count: number;
  violations: string[];
};

function trackConceptRequests(page: Page, expectedWidths: number | number[]): ConceptRequestLog {
  const log: ConceptRequestLog = { count: 0, violations: [] };
  const widths = Array.isArray(expectedWidths) ? expectedWidths : [expectedWidths];
  const expectedPath = new RegExp(`^/concepts/opt/[a-z0-9-]+-(?:${widths.join("|")})\\.webp$`);

  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.startsWith("/_next/image")) {
      log.violations.push(`image optimizer request: ${pathname}`);
      return;
    }
    if (!pathname.startsWith("/concepts/")) return;

    log.count += 1;
    if (pathname.includes("512")) log.violations.push(`512px concept request: ${pathname}`);
    if (!expectedPath.test(pathname)) log.violations.push(`unexpected concept request: ${pathname}`);
  });

  return log;
}

async function loadAllLazyImages(page: Page, images: Locator) {
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 75));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });

  await expect
    .poll(
      () =>
        images.evaluateAll((nodes) =>
          nodes.every((node) => {
            const image = node as HTMLImageElement;
            return image.complete && image.naturalWidth > 0;
          }),
        ),
      { message: "all concept images should finish loading" },
    )
    .toBe(true);
}

async function advanceToImage(page: Page, target: Locator, maxQuestions = 12) {
  for (let question = 0; question < maxQuestions; question += 1) {
    if (await target.count()) return;

    const answer = page.locator("button.answer:not([disabled])").first();
    if (await answer.count()) {
      await answer.click();
    } else {
      const tile = page.locator('button.tile[data-used="false"]').first();
      if (await tile.count()) await tile.click();
    }

    const check = page.getByRole("button", { name: "Check", exact: true });
    await expect(check).toBeEnabled();
    await check.click();

    const next = page.getByRole("button", { name: "Continue", exact: true });
    await next.click();
    await expect(next).toBeHidden();
  }
  throw new Error("reached the question cap before the target image appeared");
}

async function expectSelectedVariant(images: Locator, width: number, naturalWidth: number) {
  const details = await images.evaluateAll((nodes) =>
    nodes.map((node) => {
      const image = node as HTMLImageElement;
      return { currentSrc: image.currentSrc, naturalWidth: image.naturalWidth };
    }),
  );

  expect(details.length).toBeGreaterThan(0);
  const expectedPath = new RegExp(`^/concepts/opt/[a-z0-9-]+-${width}\\.webp$`);
  for (const detail of details) {
    expect(new URL(detail.currentSrc).pathname).toMatch(expectedPath);
    expect(detail.naturalWidth).toBe(naturalWidth);
  }
}

function expectOnlyExpectedRequests(log: ConceptRequestLog) {
  expect(log.violations).toEqual([]);
  expect(log.count).toBeGreaterThan(0);
}

for (const {
  scale,
  mapVariant,
  mapNaturalWidth,
  lessonVariant,
  lessonNaturalWidth,
  compactVariant,
  compactNaturalWidth,
  promptVariant,
  promptNaturalWidth,
} of DENSITIES) {
  test.describe(`at ${scale}x`, () => {
    test.use({ deviceScaleFactor: scale });

    test(`course map serves ${mapVariant}px variants for 28px thumbnails`, async ({ page }) => {
      const requests = trackConceptRequests(page, mapVariant);
      await page.goto("/learn/th");

      const images = page.locator('img[data-concept][width="28"]');
      await loadAllLazyImages(page, images);
      await expectSelectedVariant(images, mapVariant, mapNaturalWidth);
      expectOnlyExpectedRequests(requests);
    });

    test(`lesson serves ${lessonVariant}px variants for 96px choices`, async ({ page }) => {
      const requests = trackConceptRequests(page, lessonVariant);
      await page.goto("/learn/th/th.u1.l1");

      const images = page.locator('img[data-concept][width="96"]');
      await loadAllLazyImages(page, images);
      await expectSelectedVariant(images, lessonVariant, lessonNaturalWidth);
      expectOnlyExpectedRequests(requests);
    });

    test(`lesson serves ${compactVariant}px variants for 64px build images`, async ({ page }) => {
      const requests = trackConceptRequests(page, [lessonVariant, compactVariant]);
      await page.goto("/learn/th/th.u1.l1");

      const images = page.locator('img[data-concept][width="64"]');
      await advanceToImage(page, images);
      await loadAllLazyImages(page, images);
      await expectSelectedVariant(images, compactVariant, compactNaturalWidth);
      expectOnlyExpectedRequests(requests);
    });

    test(`lesson serves ${promptVariant}px variants for 80px prompt images`, async ({ page }) => {
      const requests = trackConceptRequests(page, [lessonVariant, compactVariant, promptVariant]);
      await page.goto("/learn/th/th.u1.l1");

      const images = page.locator('img[data-concept][width="80"]');
      await advanceToImage(page, images);
      await loadAllLazyImages(page, images);
      await expectSelectedVariant(images, promptVariant, promptNaturalWidth);
      expectOnlyExpectedRequests(requests);
    });

    test(`speaking serves ${compactVariant}px variants for 64px images`, async ({ page }) => {
      const requests = trackConceptRequests(page, compactVariant);
      await page.goto("/learn/th/speak.th.u1");

      const images = page.locator('img[data-concept][width="64"]');
      await loadAllLazyImages(page, images);
      await expectSelectedVariant(images, compactVariant, compactNaturalWidth);
      expectOnlyExpectedRequests(requests);
    });
  });
}
