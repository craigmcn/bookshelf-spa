import { test, expect } from "@playwright/test";
import { signIn, users } from "./support/auth";

test.describe("Readings (real API)", () => {
  test("member can add a reading with a status, rating, and review", async ({
    page,
  }) => {
    await signIn(page, users.member);
    await page.getByText("1984").click();

    await page.getByRole("button", { name: "Add to my list" }).click();
    await page.getByLabel("Status").selectOption("finished");
    await page.getByLabel("Rating").selectOption({ label: "★★★★★ Excellent" });
    await page.getByLabel("Review").fill("Chillingly good.");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("★★★★★")).toBeVisible();

    await page.goto("/readings");
    const card = page.locator(".card", { hasText: "1984" });
    await expect(card.getByText("★★★★★")).toBeVisible();
    await expect(card.getByText("Chillingly good.")).toBeVisible();
  });

  test("editing a reading updates the displayed rating", async ({ page }) => {
    await signIn(page, users.member);
    await page.goto("/readings");

    const card = page.locator(".card", { hasText: "1984" });
    await card.getByRole("button", { name: "Edit" }).click();
    await card.getByLabel("Rating").selectOption({ label: "★ Poor" });
    await card.getByRole("button", { name: "Save" }).click();

    await expect(card.getByText("★", { exact: true })).toBeVisible();
  });

  // ReadingPolicy#destroy? is moderator_or_above-only in bookshelf-api (same as the
  // Rails apps), but ReadingsPage renders a "Remove" button for every owner
  // unconditionally — a real parity gap, not something this test works around.
  // See CLAUDE.md.
  test("member's own Remove button is rejected by the API", async ({
    page,
  }) => {
    await signIn(page, users.member);
    await page.goto("/readings");

    const card = page.locator(".card", { hasText: "1984" });
    // handleDelete() shows a confirm() first, then (on 403) an alert() with the failure
    let alertMessage = "";
    page.on("dialog", async (dialog) => {
      if (dialog.type() === "alert") alertMessage = dialog.message();
      await dialog.accept();
    });
    await card.getByRole("button", { name: "Remove" }).click();
    await expect.poll(() => alertMessage).toBe("Failed to remove reading.");
    // still there — the API rejected the delete
    await expect(card).toBeVisible();
  });
});
