import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  it("renders the approved header and hero", () => {
    render(<LandingPage />);

    expect(screen.getByRole("link", { name: "Daily Compass" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
    expect(screen.getByRole("link", { name: "Create Account" })).toHaveAttribute(
      "href",
      "/create-account",
    );
    expect(
      screen.getByRole("heading", { name: "Five areas. One balanced day." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Organize your day around the five areas of life that matter most to you.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Daily Compass day preview")).toBeInTheDocument();
    for (const area of [
      "Physical Health",
      "Relationships",
      "Mental Wellbeing",
      "Hobbies & Fun",
      "School & Career",
    ]) {
      expect(screen.getByText(area)).toBeInTheDocument();
    }
    expect(
      screen.getByRole("heading", { name: "Why use Daily Compass" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How It Works" })).toBeInTheDocument();
  });
});
