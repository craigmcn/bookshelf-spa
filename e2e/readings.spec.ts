import { test, expect } from "@playwright/test";
import {
  mockSession,
  mockReadings,
  mockReadingMutations,
  sampleReading,
} from "./helpers/mock-api";

test.describe("My Readings (unauthenticated)", () => {
  test("redirects to sign-in page", async ({ page }) => {
    await page.route("http://localhost:3000/session", (route) => {
      route.fulfill({ status: 401, json: { error: "Unauthorized" } });
    });

    await page.goto("/readings");
    await expect(page).toHaveURL("/sign-in");
  });
});

test.describe("My Readings (signed in)", () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockReadings(page);
  });

  test("shows book title, author, and status badge", async ({ page }) => {
    await page.goto("/readings");

    await expect(page.getByText(sampleReading.book.title)).toBeVisible();
    await expect(page.getByText(sampleReading.book.author)).toBeVisible();
    await expect(
      page.getByRole("link", { name: sampleReading.book.title, exact: true }),
    ).toHaveAttribute("href", `/books/${sampleReading.book.id}`);
  });

  test("edit form pre-populates status, rating, and review", async ({
    page,
  }) => {
    await page.goto("/readings");
    await page.getByRole("button", { name: /edit/i }).first().click();

    await expect(page.getByLabel(/status/i).first()).toHaveValue(
      sampleReading.status,
    );
    await expect(page.getByLabel(/rating/i).first()).toHaveValue(
      String(sampleReading.rating),
    );
    await expect(page.getByLabel(/review/i).first()).toHaveValue(
      sampleReading.review,
    );
  });

  test("saves edited reading and closes form", async ({ page }) => {
    await mockReadingMutations(page, sampleReading.id, {
      status: "finished",
      rating: 5,
      review: "Amazing book, highly recommended!",
    });

    await page.goto("/readings");
    await page.getByRole("button", { name: /edit/i }).first().click();

    await page
      .getByLabel(/status/i)
      .first()
      .selectOption("finished");
    await page
      .getByLabel(/review/i)
      .first()
      .fill("Amazing book, highly recommended!");
    await page.getByRole("button", { name: /save/i }).first().click();

    // Form closes
    await expect(page.getByRole("button", { name: /save/i })).not.toBeVisible();
    // Updated status badge
    await expect(page.getByText("Finished")).toBeVisible();
  });

  test("cancel edit restores original view", async ({ page }) => {
    await page.goto("/readings");
    await page.getByRole("button", { name: /edit/i }).first().click();

    await expect(page.getByRole("button", { name: /save/i })).toBeVisible();

    await page
      .getByRole("button", { name: /cancel/i })
      .first()
      .click();

    await expect(page.getByRole("button", { name: /save/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
  });

  test("removes reading from list", async ({ page }) => {
    await mockReadingMutations(page, sampleReading.id);

    await page.goto("/readings");

    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", { name: /remove/i })
      .first()
      .click();

    await expect(page.getByText(sampleReading.book.title)).not.toBeVisible();
    await expect(page.getByText(/no readings yet/i)).toBeVisible();
  });

  test("shows empty state when there are no readings", async ({ page }) => {
    // Override the beforeEach mock with an empty list
    await page.route("http://localhost:3000/readings", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ json: { readings: [] } });
      } else {
        route.continue();
      }
    });

    await page.goto("/readings");

    await expect(page.getByText(/no readings yet/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /browse books/i }),
    ).toBeVisible();
  });
});
