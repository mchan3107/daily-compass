import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSession, login, logout } from "./auth";

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

  it("login returns null on success and an error message on failure", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
    await expect(login("user", "password")).resolves.toBeNull();

    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
    await expect(login("user", "wrong")).resolves.toBe(
      "Invalid username or password",
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
