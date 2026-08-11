import type { Page } from "@playwright/test";

// Shared fixture credentials — same rows across community_bookshelf, bookshelf-islands,
// bookshelf-api and bookshelf-spa (see test/fixtures/users.yml in each Rails repo).
export const users = {
  member: { email: "member@example.com", password: "correct-horse-shelf" },
  moderator: {
    email: "moderator@example.com",
    password: "correct-horse-shelf",
  },
  admin: { email: "admin@example.com", password: "correct-horse-shelf" },
};

export async function signIn(
  page: Page,
  user: { email: string; password: string },
) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");
}
