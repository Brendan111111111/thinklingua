import { join } from "node:path";
import { expect, test } from "@playwright/test";

const NATIVE_FIXTURE = join(process.cwd(), "public", "fixtures", "th-raakhaa-native.mp3");

test("both bundled tone fixtures produce their expected feedback", async ({ page }) => {
  // Stub the voice provider with the committed native line so the reference is
  // identical in CI and no external TTS service is needed. Decode, F0
  // extraction, DTW, syllable splitting and the feedback copy still run.
  await page.route("**/api/tts", (route) =>
    route.fulfill({
      status: 200,
      contentType: "audio/mpeg",
      path: NATIVE_FIXTURE,
    }),
  );

  await page.goto("/dev/tone");
  await expect(page.getByRole("heading", { name: "Tone harness" })).toBeVisible();

  // The button is server rendered; wait for the harness's hydration marker so
  // the click cannot land before React attaches its handler.
  await page.locator('[data-tone-hydrated="true"]').waitFor();
  await page.getByRole("button", { name: "Run both fixture checks" }).click();

  const banner = page.getByRole("status");
  await expect(banner.getByText("Fixture checks passed", { exact: true })).toBeVisible();

  const rows = banner.locator("li");
  await expect(rows).toHaveCount(2);

  await expect(rows.nth(0)).toContainText("PASS");
  await expect(rows.nth(0)).toContainText("native line");
  await expect(rows.nth(0)).toContainText("no syllable named");

  await expect(rows.nth(1)).toContainText("PASS");
  await expect(rows.nth(1)).toContainText("flat 220 Hz");
  await expect(rows.nth(1)).toContainText("Syllable 2 · คา");

  await expect(page.getByText("Syllable 2 · คา is the one to fix.", { exact: true })).toBeVisible();
});
