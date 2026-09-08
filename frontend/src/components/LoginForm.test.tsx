import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

vi.mock("@/lib/auth", () => ({
  login: vi.fn(),
}));

import { login } from "@/lib/auth";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.mocked(login).mockReset();
  });

  it("signs in with username and password", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(login).mockResolvedValue(null);

    render(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Username"), "user");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(login).toHaveBeenCalledWith("user", "password");
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows an error for bad credentials", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(login).mockResolvedValue("Invalid username or password");

    render(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Username"), "user");
    await user.type(screen.getByLabelText("Password"), "nope");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid username or password")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
