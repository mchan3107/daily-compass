import { describe, expect, it } from "vitest";
import { CATEGORIES, renameCategory, reorderCategories } from "./categories";

describe("renameCategory", () => {
  it("renames the matching category", () => {
    const next = renameCategory(CATEGORIES, "health", "Body");
    expect(next[0]).toEqual({ id: "health", label: "Body" });
    expect(next[1].label).toBe("Relationships");
  });

  it("ignores a blank label", () => {
    expect(renameCategory(CATEGORIES, "health", "   ")).toBe(CATEGORIES);
  });
});

describe("reorderCategories", () => {
  it("moves a category to a new index", () => {
    const next = reorderCategories(CATEGORIES, 0, 2);
    expect(next.map((category) => category.id)).toEqual([
      "relationships",
      "growth",
      "health",
      "hobbies",
      "career",
    ]);
  });

  it("does not add or remove categories", () => {
    const next = reorderCategories(CATEGORIES, 4, 0);
    expect(next).toHaveLength(5);
    expect(new Set(next.map((category) => category.id))).toEqual(
      new Set(CATEGORIES.map((category) => category.id)),
    );
  });
});
