import { expect, test, type Locator, type Page } from "@playwright/test";

const DENSITIES = [
  { scale: 2, mapVariant: 56, mapNaturalWidth: 28, lessonVariant: 192, lessonNaturalWidth: 96 },
  { scale: 3, mapVariant: 96, mapNaturalWidth: 32, lessonVariant: 288, lessonNaturalWidth: 96 },
] as const;

type ConceptRequestLog = {
  count: number;
  violations: string[];
};

function trackConceptRequests(page: Page, expectedWidth: number): ConceptRequestLog {
  const log: ConceptRequestLog = { count: 0, violations: [] };
  const expectedPath = new RegExp(`^/concepts/opt/[a-z0-9-]+-${expectedWidth}\\.webp$`);

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

for (const { scale, mapVariant, mapNaturalWidth, lessonVariant, lessonNaturalWidth } of DENSITIES) {
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
  });
}
