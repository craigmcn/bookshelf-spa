import { defineConfig, devices } from "@playwright/test";

// Cross-app parity project: same fixture data/scenarios as community_bookshelf
// and bookshelf-islands, but driving the real bookshelf-api instead of the mocks
// used by playwright.config.ts's suite. Kept as a separate config (rather than a
// second `project` in playwright.config.ts) so the default `yarn test:e2e` stays
// fast and backend-free — this one requires a sibling bookshelf-api checkout.
const BOOKSHELF_API_DIR = process.env.BOOKSHELF_API_DIR ?? "../bookshelf-api";

export default defineConfig({
  testDir: "./e2e/real-api",
  // Serial: mutates a shared Postgres DB, with no per-test transaction rollback
  // like the Rails apps' Minitest suites get.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["html", { outputFolder: "playwright-report-real-api", open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:3150",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "yarn dev",
      url: "http://localhost:3150",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `bash -c "cd ${BOOKSHELF_API_DIR} && ./bin/e2e_server"`,
      // bookshelf-api is API-only with no root route, so "/" always 404s and never
      // satisfies Playwright's readiness check — poll a real (public) endpoint instead.
      url: "http://localhost:3000/books",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
