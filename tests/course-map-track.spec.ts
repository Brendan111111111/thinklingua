import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const TRACKS = [
  { label: "Reading", track: "read" },
  { label: "Speaking", track: "speak" },
  { label: "Words", track: "words" },
] as const;

for (const { label, track } of TRACKS) {
  test(`${label} tab updates the URL and survives reload plus back/forward`, async ({ page }) => {
    const activeTrack = page.locator('button[aria-pressed="true"]');
    const mapUrl = `/learn/th\\?source=test&track=${track}$`;

    await page.goto("/learn/th?source=test");
    await page.getByRole("button", { name: new RegExp(label) }).click();

    await expect(page).toHaveURL(new RegExp(mapUrl));
    await expect(activeTrack).toContainText(label);

    await page.reload();
    await expect(page).toHaveURL(new RegExp(mapUrl));
    await expect(activeTrack).toContainText(label);

    await page.goto("/learn/th/th.u1.l1");
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(mapUrl));
    await expect(activeTrack).toContainText(label);

    await page.goForward();
    await expect(page).toHaveURL(/\/learn\/th\/th\.u1\.l1$/);
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(mapUrl));
    await expect(activeTrack).toContainText(label);
  });
}
