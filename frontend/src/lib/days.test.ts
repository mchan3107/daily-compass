import { describe, expect, it } from "vitest";
import { dummyBoard } from "./dummy-tasks";
import { boardForDate, moveTaskToDate, setBoard } from "./days";
import { emptyBoard } from "./tasks";
import type { DaysState } from "./types";

const today = "2026-09-07";
const tomorrow = "2026-09-08";

function seeded(): DaysState {
  return { [today]: dummyBoard };
}

describe("boardForDate", () => {
  it("returns the stored board or an empty board", () => {
    const days = seeded();
    expect(boardForDate(days, today).health[0].title).toBe("Morning stretch");
    expect(boardForDate(days, tomorrow)).toEqual(emptyBoard());
  });
});

describe("setBoard", () => {
  it("stores a board for a date", () => {
    const days = setBoard({}, tomorrow, dummyBoard);
    expect(days[tomorrow]?.career).toHaveLength(3);
  });
});

describe("moveTaskToDate", () => {
  it("moves a task onto another date in the same category", () => {
    const days = moveTaskToDate(seeded(), today, "health-1", tomorrow);

    expect(days[today]?.health.map((task) => task.id)).toEqual(["health-2"]);
    expect(days[tomorrow]?.health).toEqual([
      expect.objectContaining({
        id: "health-1",
        categoryId: "health",
        title: "Morning stretch",
      }),
    ]);
  });

  it("does nothing when the date is unchanged or the task is missing", () => {
    const days = seeded();
    expect(moveTaskToDate(days, today, "health-1", today)).toBe(days);
    expect(moveTaskToDate(days, today, "missing", tomorrow)).toBe(days);
  });
});
