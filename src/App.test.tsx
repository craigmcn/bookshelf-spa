import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";

vi.mock("./api/auth", () => ({
  authApi: {
    getSession: vi.fn().mockRejectedValue(new Error("Not signed in")),
  },
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the books page at root", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: /books/i }),
    ).toBeInTheDocument();
  });
});
