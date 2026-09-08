import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dummyBoard } from "./dummy-tasks";
import { CATEGORIES } from "./categories";
import {
  getCategories,
  getDay,
  saveCategories,
  saveDay,
  sendChat,
} from "./api";

describe("api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getCategories loads the five categories", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ categories: CATEGORIES }),
    } as Response);

    await expect(getCategories()).resolves.toEqual(CATEGORIES);
    expect(fetch).toHaveBeenCalledWith("/api/categories", {
      credentials: "include",
    });
  });

  it("saveCategories puts the category list", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
    const renamed = CATEGORIES.map((category) =>
      category.id === "health" ? { ...category, label: "Body" } : category,
    );

    await saveCategories(renamed);
    expect(fetch).toHaveBeenCalledWith("/api/categories", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: renamed }),
    });
  });

  it("getDay returns the board for a date", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ date: "2026-09-07", board: dummyBoard }),
    } as Response);

    await expect(getDay("2026-09-07")).resolves.toEqual(dummyBoard);
    expect(fetch).toHaveBeenCalledWith("/api/days/2026-09-07", {
      credentials: "include",
    });
  });

  it("saveDay puts the board", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
    await saveDay("2026-09-07", dummyBoard);
    expect(fetch).toHaveBeenCalledWith("/api/days/2026-09-07", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board: dummyBoard }),
    });
  });

  it("sendChat posts the date and message", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "Start with the stretch.", board: null }),
    } as Response);

    await expect(sendChat("2026-09-07", "What first?")).resolves.toEqual({
      reply: "Start with the stretch.",
      board: null,
    });
    expect(fetch).toHaveBeenCalledWith("/api/chat", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: "2026-09-07", message: "What first?" }),
    });
  });

  it("sendChat returns a fallback reply when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    await expect(sendChat("2026-09-07", "Hello")).resolves.toEqual({
      reply: "The guide could not reply. Try again.",
      board: null,
    });
  });
});
