import { test, expect } from "@playwright/test";
import { signIn, users } from "./support/auth";

test.describe("Admin access control (real API)", () => {
  test("unauthenticated user is redirected to sign-in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/sign-in");
  });

  test("member (non-moderator) is redirected to the books catalog", async ({
    page,
  }) => {
    await signIn(page, users.member);
    await page.goto("/admin");
    await expect(page).toHaveURL("/");
  });

  test("moderator can reach Reviews but the API rejects Dashboard and Users", async ({
    page,
  }) => {
    await signIn(page, users.moderator);
    await page.goto("/admin/readings");
    await expect(page.getByText("A great read.")).toBeVisible();

    // ProtectedRoute's client-side gate only checks "moderator or above"; the
    // Dashboard/Users pages are still admin-only server-side (bookshelf-api's
    // Admin::BaseController), so a moderator reaches the route but the API 403s.
    await page.goto("/admin");
    await expect(page.getByText("Failed to load dashboard.")).toBeVisible();

    await page.goto("/admin/users");
    await expect(page.getByText("Failed to load users.")).toBeVisible();
  });

  test("admin can reach the Dashboard and edit user roles", async ({
    page,
  }) => {
    await signIn(page, users.admin);
    await page.goto("/admin");
    await expect(page.getByText("Most-read Books")).toBeVisible();

    await page.goto("/admin/users");
    let row = page.locator("tr", { has: page.getByText("member@example.com") });
    await row.getByLabel("moderator").check();
    await row.getByRole("button", { name: "Save" }).click();
    await expect(row.getByLabel("moderator")).toBeChecked();

    // revert so the fixture user's role stays stable for other specs/runs — reload
    // first, since the checkbox after a save can be slow to settle into a state
    // where a second click on the same node reliably registers
    await page.reload();
    row = page.locator("tr", { has: page.getByText("member@example.com") });
    await row.getByLabel("moderator").uncheck();
    await row.getByRole("button", { name: "Save" }).click();
    await expect(row.getByLabel("moderator")).not.toBeChecked();
  });
});
