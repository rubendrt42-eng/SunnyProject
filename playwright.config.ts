import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright specs assume a fully configured environment: Supabase
 * migrations applied, `pnpm seed` run, and env vars set (see README §Testing).
 * Without that, every route renders the SetupRequired screen instead of the
 * real app, and these specs will fail — that's expected, not a bug.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60000,
      },
});
