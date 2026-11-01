import { test, expect } from "@playwright/test";
import {
  mockSession,
  mockSessionSignedOut,
  mockBooksList,
  mockAdminDashboard,
  mockAdminUsers,
  mockAdminUserUpdate,
  mockAdminReadings,
  adminFixtures,
  users,
} from "./helpers/mock-api";

async function setupModSession(page: Parameters<typeof mockSession>[0]) {
  await mockSession(page, users.moderator);
  await mockAdminDashboard(page);
  await mockAdminUsers(page);
  await mockAdminReadings(page);
}

test.describe("Admin access control", () => {
  test("unauthenticated user is redirected to sign-in", async ({ page }) => {
    await mockSessionSignedOut(page);
    await page.goto("/admin");
    await expect(page).toHaveURL("/sign-in");
  });

  test("member (non-moderator) is redirected to home", async ({ page }) => {
    await mockSession(page, users.member);
    await mockBooksList(page);
    await page.goto("/admin");
    await expect(page).toHaveURL("/");
  });

  test("moderator can access admin area", async ({ page }) => {
    await setupModSession(page);
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
  });
});

test.describe("Admin dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await setupModSession(page);
    await page.goto("/admin");
  });

  test("shows stat cards for users, books, and readings", async ({ page }) => {
    const { total_users, total_books, total_readings } =
      adminFixtures.dashboard;
    await expect(page.getByText(String(total_users)).first()).toBeVisible();
    await expect(page.getByText(String(total_books)).first()).toBeVisible();
    await expect(page.getByText(String(total_readings)).first()).toBeVisible();
  });

  test("shows most-read books list", async ({ page }) => {
    for (const book of adminFixtures.dashboard.popular_books) {
      await expect(page.getByRole("link", { name: book.title })).toBeVisible();
    }
  });

  test("popular book links go to book detail", async ({ page }) => {
    const [first] = adminFixtures.dashboard.popular_books;
    await expect(page.getByRole("link", { name: first.title })).toHaveAttribute(
      "href",
      `/books/${first.id}`,
    );
  });

  test("shows tab navigation with Dashboard, Users, Reviews", async ({
    page,
  }) => {
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reviews" })).toBeVisible();
  });
});

test.describe("Admin users page", () => {
  test.beforeEach(async ({ page }) => {
    await setupModSession(page);
    await page.goto("/admin/users");
  });

  test("shows user table with emails", async ({ page }) => {
    for (const user of adminFixtures.users.users) {
      await expect(page.getByRole("cell", { name: user.email })).toBeVisible();
    }
  });

  test("shows role checkboxes for each user", async ({ page }) => {
    const { users: userList, available_roles } = adminFixtures.users;
    for (const user of userList) {
      for (const role of available_roles) {
        await expect(
          page.locator(`#role-${user.id}-${role.name}`),
        ).toBeVisible();
      }
    }
  });

  test("member role checkbox is checked for member user", async ({ page }) => {
    const memberUser = adminFixtures.users.users[0];
    await expect(page.locator(`#role-${memberUser.id}-member`)).toBeChecked();
    await expect(
      page.locator(`#role-${memberUser.id}-moderator`),
    ).not.toBeChecked();
  });

  test("saves role changes", async ({ page }) => {
    const memberUser = adminFixtures.users.users[0];
    const updatedUser = {
      ...memberUser,
      roles: ["member", "moderator"],
    };
    await mockAdminUserUpdate(page, memberUser.id, updatedUser);

    // Toggle moderator on for the member user
    await page.locator(`#role-${memberUser.id}-moderator`).check();
    await page
      .getByRole("row", { name: new RegExp(memberUser.email) })
      .getByRole("button", { name: /save/i })
      .click();

    // Button returns to "Save" (not "Saving…") after completion
    await expect(
      page
        .getByRole("row", { name: new RegExp(memberUser.email) })
        .getByRole("button", { name: "Save" }),
    ).toBeVisible();
  });
});

test.describe("Admin reviews page", () => {
  test.beforeEach(async ({ page }) => {
    await setupModSession(page);
    await page.goto("/admin/readings");
  });

  test("shows all reviews with book title and review text", async ({
    page,
  }) => {
    for (const r of adminFixtures.readings) {
      await expect(
        page.getByRole("link", { name: r.book.title }),
      ).toBeVisible();
      await expect(page.getByText(r.review)).toBeVisible();
    }
    // Both readings belong to the same user; verify the email appears at least once
    const userEmail = adminFixtures.readings[0].user.email;
    await expect(page.getByText(userEmail).first()).toBeVisible();
  });

  test("deleted readings are visually faded", async ({ page }) => {
    const deleted = adminFixtures.readings.find((r) => r.deleted_at);
    if (!deleted) throw new Error("No deleted reading in fixtures");

    const card = page.locator(".card").filter({ hasText: deleted.review });
    await expect(card).toHaveClass(/opacity-50/);
  });

  test("deleted readings show 'deleted' label", async ({ page }) => {
    const deleted = adminFixtures.readings.find((r) => r.deleted_at);
    if (!deleted) throw new Error("No deleted reading in fixtures");

    const card = page.locator(".card").filter({ hasText: deleted.review });
    await expect(card.getByText(/deleted/)).toBeVisible();
  });

  test("active reading does not have opacity-50", async ({ page }) => {
    const active = adminFixtures.readings.find((r) => !r.deleted_at);
    if (!active) throw new Error("No active reading in fixtures");

    const card = page.locator(".card").filter({ hasText: active.review });
    await expect(card).not.toHaveClass(/opacity-50/);
  });
});
