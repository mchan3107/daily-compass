import { emptyBoard } from "./tasks";
import type { BoardState, DaysState } from "./types";

export function boardForDate(days: DaysState, date: string): BoardState {
  return days[date] ?? emptyBoard();
}

export function setBoard(
  days: DaysState,
  date: string,
  board: BoardState,
): DaysState {
  return { ...days, [date]: board };
}
