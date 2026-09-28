import { defineConfig, devices } from "@playwright/test";

const outputRoot = process.env.VISUAL_OUTPUT_DIR ?? ".visual-regression/output";

export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: `${outputRoot}/playwright-report`, open: "never" }]],
  use: {
    trace: "off",
    video: "off",
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    locale: "en-US",
    timezoneId: "Asia/Kolkata",
    reducedMotion: "reduce",
    colorScheme: "light",
  },
  projects: [
    {
      name: "baseline-chrome-1920",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "baseline-chrome-1366",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "compare-edge-1920",
      use: {
        ...devices["Desktop Edge"],
        channel: "msedge",
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "compare-edge-1366",
      use: {
        ...devices["Desktop Edge"],
        channel: "msedge",
        viewport: { width: 1366, height: 768 },
      },
    },
  ],
});
