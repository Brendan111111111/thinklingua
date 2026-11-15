import { defineConfig, devices } from "@playwright/test";

const HOST = "127.0.0.1";
const PORT = 8787;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/concept-images.spec.ts",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/concept-images" }]],
  outputDir: "test-results/concept-images",
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build:worker && npx opennextjs-cloudflare preview --config wrangler.jsonc --port ${PORT}`,
    url: `http://${HOST}:${PORT}/learn/th`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
