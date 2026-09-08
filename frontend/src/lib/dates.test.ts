import { describe, expect, it } from "vitest";
import { formatDisplayDate, isToday, shiftDate, todayKey } from "./dates";

describe("todayKey", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(todayKey(new Date(2026, 8, 7))).toBe("2026-09-07");
  });
});

describe("shiftDate", () => {
  it("moves forward and backward across month boundaries", () => {
    expect(shiftDate("2026-09-07", 1)).toBe("2026-09-08");
    expect(shiftDate("2026-09-01", -1)).toBe("2026-08-31");
    expect(shiftDate("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("isToday", () => {
  it("compares against the given now", () => {
    expect(isToday("2026-09-07", new Date(2026, 8, 7))).toBe(true);
    expect(isToday("2026-09-08", new Date(2026, 8, 7))).toBe(false);
  });
});

describe("formatDisplayDate", () => {
  it("formats a date key for display", () => {
    expect(formatDisplayDate("2026-09-07")).toBe("Monday, September 7, 2026");
  });
});
