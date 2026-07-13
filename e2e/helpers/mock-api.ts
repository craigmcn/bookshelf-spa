import type { Page } from "@playwright/test";

const API = "http://localhost:3000";

export const users = {
  member: { id: 1, email: "member@example.com", roles: ["member"] },
  moderator: {
    id: 2,
    email: "mod@example.com",
    roles: ["member", "moderator"],
  },
};

export const sampleBook = {
  id: 1,
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  cover_url: null,
  added_by_id: 1,
};

export const sampleUserReading = {
  id: 10,
  status: "reading",
  rating: 3,
  review: "A classic I should have read sooner.",
};

export const sampleReading = {
  id: 10,
  status: "reading",
  rating: 3,
  review: "A classic I should have read sooner.",
  deleted_at: null,
  book: {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover_url: null,
  },
};

export async function mockSession(page: Page, user = users.member) {
  await page.route(`${API}/session`, (route) => {
    if (route.request().method() === "DELETE") {
      route.fulfill({ status: 204, body: "" });
    } else {
      route.fulfill({ json: { user } });
    }
  });
}

export async function mockSessionSignedOut(page: Page) {
  await page.route(`${API}/session`, (route) => {
    const method = route.request().method();
    if (method === "GET") {
      route.fulfill({ status: 401, json: { error: "Unauthorized" } });
    } else {
      route.continue();
    }
  });
}

export async function mockBooksList(page: Page, books = [sampleBook]) {
  await page.route(`${API}/books`, (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({ json: { books } });
    } else {
      route.continue();
    }
  });
}

export async function mockBookDetail(
  page: Page,
  bookId: number,
  options: { userReading?: typeof sampleUserReading | null } = {},
) {
  await page.route(`${API}/books/${bookId}`, (route) => {
    const method = route.request().method();
    if (method === "GET") {
      route.fulfill({
        json: {
          book: {
            ...sampleBook,
            id: bookId,
            user_reading:
              options.userReading !== undefined ? options.userReading : null,
          },
        },
      });
    } else if (method === "PATCH") {
      route.fulfill({ json: { book: { ...sampleBook, id: bookId } } });
    } else if (method === "DELETE") {
      route.fulfill({ status: 204, body: "" });
    } else {
      route.continue();
    }
  });
}

export async function mockReadings(page: Page, readings = [sampleReading]) {
  await page.route(`${API}/readings`, (route) => {
    const method = route.request().method();
    if (method === "GET") {
      route.fulfill({ json: { readings } });
    } else if (method === "POST") {
      route.fulfill({
        status: 201,
        json: {
          reading: {
            ...sampleReading,
            id: 99,
            status: "want_to_read",
            rating: null,
            review: null,
          },
        },
      });
    } else {
      route.continue();
    }
  });
}

export async function mockReadingMutations(
  page: Page,
  readingId: number,
  updated: Partial<typeof sampleReading> = {},
) {
  await page.route(`${API}/readings/${readingId}`, (route) => {
    const method = route.request().method();
    if (method === "PATCH") {
      route.fulfill({
        json: { reading: { ...sampleReading, ...updated, id: readingId } },
      });
    } else if (method === "DELETE") {
      route.fulfill({ status: 204, body: "" });
    } else {
      route.continue();
    }
  });
}
