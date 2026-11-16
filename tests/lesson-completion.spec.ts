import { expect, test, type Page } from "@playwright/test";

async function finishLesson(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });

  for (let step = 0; step < 60; step += 1) {
    if (await page.getByRole("link", { name: "Back to the map" }).count()) return;

    const check = page.getByRole("button", { name: "Check", exact: true });
    if (await check.count()) {
      if (await check.isDisabled()) {
        const answer = page.locator("button.answer:not([disabled])").first();
        if (await answer.count()) {
          await answer.click();
        } else {
          const tile = page.locator('button.tile[data-used="false"]').first();
          for (let placed = 0; placed < 12 && (await check.isDisabled()); placed += 1) {
            if (!(await tile.count())) break;
            await tile.click();
          }
        }
      }

      await expect(check).toBeEnabled();
      await check.click();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      continue;
    }

    const saidIt = page.getByRole("button", { name: "I said it", exact: true });
    if (await saidIt.count()) {
      await saidIt.click();
      continue;
    }

    const speak = page.getByRole("button", { name: "Speak", exact: true });
    if (await speak.count()) {
      await speak.click();
      const markPractised = page.getByRole("button", { name: /Can't use the mic\? Mark it practised/ });
      await expect(markPractised).toBeVisible();
      await markPractised.click();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      continue;
    }

    const next = page.getByRole("button", { name: "Continue", exact: true });
    if (await next.count()) {
      await next.click();
      continue;
    }

    await page.waitForTimeout(200);
  }

  throw new Error(`lesson did not finish at ${page.url()}`);
}

const CASES = [
  {
    name: "Words",
    path: "/learn/th/th.u1.l1",
    nextPath: "/learn/th/th.u1.l1.practice",
    track: "words",
  },
  {
    name: "Speaking",
    path: "/learn/th/speak.th.u1",
    nextPath: "/learn/th/speak.th.u1.practice",
    track: "speak",
  },
  {
    name: "Reading",
    path: "/learn/th/read.th.mid",
    nextPath: "/learn/th/read.th.mid.practice",
    track: "read",
  },
] as const;

for (const entry of CASES) {
  test(`completion offers the next ${entry.name} lesson and preserves its map tab`, async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => {
            throw new DOMException("Microphone blocked in the test browser", "NotAllowedError");
          },
        },
      });
    });

    await finishLesson(page, entry.path);

    const nextLesson = page.getByRole("link", { name: "Next lesson", exact: true });
    await expect(nextLesson).toBeVisible();
    await expect(nextLesson).toHaveAttribute("href", entry.nextPath);

    const mapLink = page.getByRole("link", { name: "Back to the map", exact: true });
    await expect(mapLink).toHaveAttribute("href", `/learn/th?track=${entry.track}`);
    await mapLink.click();

    await expect(page).toHaveURL(new RegExp(`/learn/th\\?track=${entry.track}$`));
    await expect(page.locator('button[aria-pressed="true"]')).toContainText(entry.name);
  });
}
