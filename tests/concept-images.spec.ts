import { expect, test, type Locator, type Page } from "@playwright/test";

const DENSITIES = [
  { scale: 2, mapVariant: 56, lessonVariant: 96 },
  { scale: 3, mapVariant: 96, lessonVariant: 144 },
] as const;

type ConceptRequestLog = {
  paths: string[];
  violations: string[];
};

function trackConceptRequests(page: Page): ConceptRequestLog {
  const paths: string[] = [];
  const violations: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/_next/image")) {
      violations.push(`optimizer request: ${url.pathname}`);
      return;
    }
    if (!url.pathname.startsWith("/concepts/")) return;

    paths.push(url.pathname);
    if (url.pathname.includes("512")) violations.push(`512px request: ${url.pathname}`);
    if (!/^\/concepts\/opt\/[a-z0-9-]+-(56|96|144|240)\.webp$/.test(url.pathname)) {
      violations.push(`non-variant concept request: ${url.pathname}`);
    }
  });

  return { paths, violations };
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

async function expectVariant(images: Locator, width: number, scale: number, renderSize: number) {
  const details = await images.evaluateAll((nodes) =>
    nodes.map((node) => {
      const image = node as HTMLImageElement;
      return {
        currentSrc: image.currentSrc,
        naturalWidth: image.naturalWidth,
        srcSet: image.getAttribute("srcset") ?? "",
        cssWidth: getComputedStyle(image).width,
      };
    }),
  );

  expect(details.length).toBeGreaterThan(0);
  for (const detail of details) {
    expect(new URL(detail.currentSrc).pathname).toMatch(new RegExp(`-${width}\\.webp$`));
    expect(detail.naturalWidth).toBe(width / scale);
    expect(detail.srcSet).toContain(`-${width}.webp ${scale}x`);
    expect(detail.cssWidth).toBe(`${renderSize}px`);
  }
}

async function expectConceptRequestSet(log: ConceptRequestLog, width: number) {
  expect(log.violations).toEqual([]);
  expect(log.paths.length).toBeGreaterThan(0);
  for (const path of log.paths) {
    expect(path).toMatch(new RegExp(`-${width}\\.webp$`));
  }
}

for (const { scale, mapVariant, lessonVariant } of DENSITIES) {
  test.describe(`at ${scale}x`, () => {
    test.use({ deviceScaleFactor: scale });

    test(`course map serves ${mapVariant}px variants for 28px thumbnails`, async ({ page }) => {
      const requests = trackConceptRequests(page);
      const response = await page.goto("/learn/th");
      expect(response?.ok()).toBe(true);

      const images = page.locator('img[data-concept][width="28"]');
      await expect(images.first()).toBeVisible();
      await loadAllLazyImages(page, images);
      await expectVariant(images, mapVariant, scale, 28);
      await expectConceptRequestSet(requests, mapVariant);
    });

    test(`lesson serves ${lessonVariant}px variants for 48px choices`, async ({ page }) => {
      const requests = trackConceptRequests(page);
      const response = await page.goto("/learn/th/th.u1.l1");
      expect(response?.ok()).toBe(true);

      const images = page.locator('img[data-concept][width="48"]');
      await expect(images.first()).toBeVisible();
      await loadAllLazyImages(page, images);
      await expectVariant(images, lessonVariant, scale, 48);
      await expectConceptRequestSet(requests, lessonVariant);
    });
  });
}
