import { test, expect } from "@playwright/test";
import { signIn, users } from "./support/auth";

test.describe("Books (real API)", () => {
  test("catalog is visible signed out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Books" })).toBeVisible();
    await page.getByText("The Great Gatsby").click();
    await expect(
      page.getByRole("heading", { name: "The Great Gatsby" }),
    ).toBeVisible();
  });

  test("member can search Open Library and add a book", async ({ page }) => {
    await signIn(page, users.member);
    await page.getByRole("button", { name: "+ Add Book" }).click();

    await page.getByLabel("Search Open Library").fill("hobbit");
    await page.getByRole("button", { name: /The Hobbit/ }).click();

    await expect(page.getByLabel("Title")).toHaveValue("The Hobbit");
    await expect(page.getByLabel("Author")).toHaveValue("J.R.R. Tolkien");
    await page.getByRole("button", { name: "Save book" }).click();

    await expect(
      page.getByRole("button", { name: "+ Add Book" }),
    ).toBeVisible();
    await expect(page.getByText("The Hobbit")).toBeVisible();
  });
});
