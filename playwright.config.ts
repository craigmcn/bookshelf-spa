import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // e2e/real-api/ is a separate project run via playwright.real-api.config.ts
  // against the real bookshelf-api — excluded here so the default `yarn test:e2e`
  // stays fast/backend-free and doesn't try to run those specs without that server.
  testIgnore: "real-api/**",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
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
  webServer: {
    command: "yarn dev",
    url: "http://localhost:3150",
    reuseExistingServer: !process.env.CI,
  },
});
