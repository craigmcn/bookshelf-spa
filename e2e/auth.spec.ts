import { test, expect } from "@playwright/test";
import {
  mockSession,
  mockSessionSignedOut,
  mockBooksList,
  users,
} from "./helpers/mock-api";

test.describe("Authentication", () => {
  test("shows Sign In link when signed out", async ({ page }) => {
    await mockSessionSignedOut(page);
    await mockBooksList(page);
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(page.getByText(users.member.email)).not.toBeVisible();
  });

  test("shows user email in navbar when signed in", async ({ page }) => {
    await mockSession(page);
    await mockBooksList(page);
    await page.goto("/");
    await expect(page.getByText(users.member.email)).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).not.toBeVisible();
  });

  test("sign in with valid credentials redirects to home", async ({ page }) => {
    await page.route("http://localhost:3000/session", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 401, json: { error: "Unauthorized" } });
      } else if (route.request().method() === "POST") {
        route.fulfill({ json: { user: users.member } });
      } else {
        route.continue();
      }
    });
    await mockBooksList(page);

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(users.member.email);
    await page.getByLabel("Password").fill("correct-horse-shelf");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(users.member.email)).toBeVisible();
  });

  test("sign in with invalid credentials shows error", async ({ page }) => {
    await page.route("http://localhost:3000/session", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({ status: 401, json: { error: "Unauthorized" } });
      } else if (route.request().method() === "POST") {
        route.fulfill({ status: 401, json: { error: "Invalid credentials" } });
      } else {
        route.continue();
      }
    });

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("alert")).toContainText(
      "Invalid email or password",
    );
  });

  test("sign out returns to signed-out state", async ({ page }) => {
    await mockSession(page);
    await mockBooksList(page);
    await page.goto("/");

    await page.getByRole("button", { name: "Sign out" }).click();

    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  });

  test("already signed-in user redirected away from sign-in page", async ({
    page,
  }) => {
    await mockSession(page);
    await mockBooksList(page);

    await page.goto("/sign-in");

    await expect(page).toHaveURL("/");
  });
});
