import { defineConfig, devices } from "@playwright/test";

const HOST = "localhost";
const PORT = 3000;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://${HOST}:${PORT}/dev/tone`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
