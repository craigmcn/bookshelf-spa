import { test, expect } from "@playwright/test";
import { signIn, users } from "./support/auth";

test.describe("Auth (real API)", () => {
  test("signed-out user hitting a protected page is redirected to sign-in", async ({
    page,
  }) => {
    await page.goto("/readings");
    await expect(page).toHaveURL("/sign-in");
  });

  test("member can sign in and see the books catalog", async ({ page }) => {
    await signIn(page, users.member);
    await expect(page.getByRole("heading", { name: "Books" })).toBeVisible();
    await expect(page.getByText("The Great Gatsby")).toBeVisible();
  });

  test("wrong password shows an error and stays on the sign-in form", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(users.member.email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toHaveText(
      "Invalid email or password.",
    );
    await expect(page).toHaveURL("/sign-in");
  });
});
