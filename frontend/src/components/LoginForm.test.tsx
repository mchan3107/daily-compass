import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

vi.mock("@/lib/auth", () => ({
  login: vi.fn(),
  signup: vi.fn(),
}));

import { login, signup } from "@/lib/auth";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.mocked(login).mockReset();
    vi.mocked(signup).mockReset();
  });

  it("signs in with email and password", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(login).mockResolvedValue(null);

    render(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(login).toHaveBeenCalledWith("user@example.com", "password");
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows an error for bad credentials", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(login).mockResolvedValue("Invalid email or password");

    render(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "nope");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("creates an account from the signup view", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(signup).mockResolvedValue(null);

    render(<LoginForm onSuccess={onSuccess} />);
    await user.click(screen.getByRole("button", { name: "Create an account" }));

    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    expect(screen.getByText(/Already have an account/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password1");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(signup).toHaveBeenCalledWith("new@example.com", "password1");
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(
      screen.getByText("Account created successfully. Please sign in."),
    ).toBeInTheDocument();
  });
});
