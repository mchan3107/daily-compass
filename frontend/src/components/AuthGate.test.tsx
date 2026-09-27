import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthGate } from "./AuthGate";

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("./LandingPage", () => ({
  LandingPage: () => <div data-testid="landing-page" />,
}));

vi.mock("./TodayBoard", () => ({
  TodayBoard: () => <div data-testid="today-board" />,
}));

import { getSession } from "@/lib/auth";

describe("AuthGate", () => {
  beforeEach(() => {
    vi.mocked(getSession).mockReset();
  });

  it("waits for the session check before showing the landing page", async () => {
    let resolveSession!: (authenticated: boolean) => void;
    vi.mocked(getSession).mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve;
      }),
    );

    render(<AuthGate />);

    expect(screen.queryByTestId("landing-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("today-board")).not.toBeInTheDocument();

    resolveSession(false);

    expect(await screen.findByTestId("landing-page")).toBeInTheDocument();
  });
});
