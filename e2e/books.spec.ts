import { test, expect } from "@playwright/test";
import {
  mockSession,
  mockSessionSignedOut,
  mockBooksList,
  mockBookDetail,
  mockReadingMutations,
  sampleBook,
  sampleUserReading,
} from "./helpers/mock-api";

test.describe("Books page (public)", () => {
  test("shows book list with title and author", async ({ page }) => {
    await mockSessionSignedOut(page);
    await mockBooksList(page);
    await page.goto("/");

    await expect(page.getByText(sampleBook.title)).toBeVisible();
    await expect(page.getByText(sampleBook.author)).toBeVisible();
  });

  test("hides Add Book button for signed-out visitors", async ({ page }) => {
    await mockSessionSignedOut(page);
    await mockBooksList(page);
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: /add book/i }),
    ).not.toBeVisible();
  });

  test("shows Add Book button for signed-in members", async ({ page }) => {
    await mockSession(page);
    await mockBooksList(page);
    await page.goto("/");

    await expect(page.getByRole("button", { name: /add book/i })).toBeVisible();
  });
});

test.describe("Book detail page (public)", () => {
  test("shows title and author without My Reading section", async ({
    page,
  }) => {
    await mockSessionSignedOut(page);
    await mockBookDetail(page, 1);
    await page.goto("/books/1");

    await expect(
      page.getByRole("heading", { name: sampleBook.title }),
    ).toBeVisible();
    await expect(page.getByText(sampleBook.author)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add to my list/i }),
    ).not.toBeVisible();
  });
});

test.describe("Book reading (signed in)", () => {
  test("shows 'Add to my list' when book has no reading", async ({ page }) => {
    await mockSession(page);
    await mockBookDetail(page, 1, { userReading: null });
    await page.goto("/books/1");

    await expect(
      page.getByRole("button", { name: /add to my list/i }),
    ).toBeVisible();
  });

  test("adds book to reading list", async ({ page }) => {
    await mockSession(page);
    await mockBookDetail(page, 1, { userReading: null });
    await page.route("http://localhost:3000/readings", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          json: {
            reading: {
              id: 99,
              status: "want_to_read",
              rating: null,
              review: null,
              deleted_at: null,
              book: sampleBook,
            },
          },
        });
      } else {
        route.continue();
      }
    });

    await page.goto("/books/1");
    await page.getByRole("button", { name: /add to my list/i }).click();
    await page.getByLabel(/status/i).selectOption("want_to_read");
    await page.getByRole("button", { name: /save/i }).click();

    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
  });

  test("shows existing reading status when book is on list", async ({
    page,
  }) => {
    await mockSession(page);
    await mockBookDetail(page, 1, { userReading: sampleUserReading });
    await page.goto("/books/1");

    await expect(page.getByText("Reading", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
  });

  test("edit form pre-populates review from existing reading", async ({
    page,
  }) => {
    await mockSession(page);
    await mockBookDetail(page, 1, { userReading: sampleUserReading });
    await page.goto("/books/1");

    await page.getByRole("button", { name: /edit/i }).click();

    // This is the regression: review must be pre-filled, not blank
    await expect(page.getByLabel(/review/i)).toHaveValue(
      sampleUserReading.review,
    );
  });

  test("edit form pre-populates status and rating", async ({ page }) => {
    await mockSession(page);
    await mockBookDetail(page, 1, { userReading: sampleUserReading });
    await page.goto("/books/1");

    await page.getByRole("button", { name: /edit/i }).click();

    await expect(page.getByLabel(/status/i)).toHaveValue(
      sampleUserReading.status,
    );
    await expect(page.getByLabel(/rating/i)).toHaveValue(
      String(sampleUserReading.rating),
    );
  });

  test("saves updated status, rating, and review", async ({ page }) => {
    await mockSession(page);
    await mockBookDetail(page, 1, { userReading: sampleUserReading });
    await mockReadingMutations(page, sampleUserReading.id, {
      status: "finished",
      rating: 5,
      review: "Absolutely fantastic!",
    });
    await page.goto("/books/1");

    await page.getByRole("button", { name: /edit/i }).click();
    await page.getByLabel(/status/i).selectOption("finished");
    await page.getByLabel(/rating/i).selectOption("5");
    await page.getByLabel(/review/i).fill("Absolutely fantastic!");
    await page.getByRole("button", { name: /save/i }).click();

    // Form closes and updated status badge appears
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
    await expect(page.getByText("Finished")).toBeVisible();
  });

  test("removes reading from book detail page", async ({ page }) => {
    await mockSession(page);
    await mockBookDetail(page, 1, { userReading: sampleUserReading });
    await mockReadingMutations(page, sampleUserReading.id);
    await page.goto("/books/1");

    await page.getByRole("button", { name: /edit/i }).click();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /remove/i }).click();

    await expect(
      page.getByRole("button", { name: /add to my list/i }),
    ).toBeVisible();
  });
});
