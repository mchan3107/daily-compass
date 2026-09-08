import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSession, login, logout, signup } from "./auth";

describe("auth", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getSession returns authenticated from the API", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: true }),
    } as Response);

    await expect(getSession()).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledWith("/api/session", { credentials: "include" });
  });

  it("login posts email and password", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
    await expect(login("user@example.com", "password")).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledWith("/api/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", password: "password" }),
    });

    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
    await expect(login("user@example.com", "wrong")).resolves.toBe(
      "Invalid email or password",
    );
  });

  it("signup posts email and password", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
    await expect(signup("new@example.com", "password1")).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledWith("/api/signup", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "new@example.com", password: "password1" }),
    });
  });

  it("signup rejects short passwords before calling the API", async () => {
    await expect(signup("new@example.com", "1234567")).resolves.toBe(
      "Password must be at least 8 characters",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("signup returns a duplicate-email message", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ detail: "An account with this email already exists" }),
    } as Response);
    await expect(signup("new@example.com", "password1")).resolves.toBe(
      "An account with this email already exists",
    );
  });

  it("logout posts to the logout route", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
    await logout();
    expect(fetch).toHaveBeenCalledWith("/api/logout", {
      method: "POST",
      credentials: "include",
    });
  });
});
