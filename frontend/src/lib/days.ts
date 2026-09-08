import { CATEGORY_IDS } from "./categories";
import { deleteTask, emptyBoard } from "./tasks";
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

export function moveTaskToDate(
  days: DaysState,
  fromDate: string,
  taskId: string,
  toDate: string,
): DaysState {
  if (fromDate === toDate) return days;

  const fromBoard = boardForDate(days, fromDate);
  let moving = undefined;
  for (const id of CATEGORY_IDS) {
    moving = fromBoard[id].find((task) => task.id === taskId);
    if (moving) break;
  }
  if (!moving) return days;

  const toBoard = boardForDate(days, toDate);
  return {
    ...days,
    [fromDate]: deleteTask(fromBoard, taskId),
    [toDate]: {
      ...toBoard,
      [moving.categoryId]: [...toBoard[moving.categoryId], moving],
    },
  };
}
