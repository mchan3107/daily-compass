import { describe, expect, it } from "vitest";
import { dummyBoard } from "./dummy-tasks";
import { boardForDate, setBoard } from "./days";
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
