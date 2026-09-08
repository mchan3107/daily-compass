import { CATEGORY_IDS } from "./categories";
import type { BoardState, CategoryId, Task } from "./types";

export function emptyBoard(): BoardState {
  return {
    health: [],
    relationships: [],
    growth: [],
    hobbies: [],
    career: [],
  };
}

export function addTask(
  board: BoardState,
  categoryId: CategoryId,
  input: { title: string; details: string },
): BoardState {
  const title = input.title.trim();
  if (!title) return board;

  const task: Task = {
    id: crypto.randomUUID(),
    categoryId,
    title,
    details: input.details.trim(),
    completed: false,
  };

  return {
    ...board,
    [categoryId]: [...board[categoryId], task],
  };
}

export function updateTask(
  board: BoardState,
  taskId: string,
  input: { title: string; details: string },
): BoardState {
  const title = input.title.trim();
  if (!title) return board;

  return mapTask(board, taskId, (task) => ({
    ...task,
    title,
    details: input.details.trim(),
  }));
}

export function deleteTask(board: BoardState, taskId: string): BoardState {
  const next: BoardState = { ...board };

  for (const id of CATEGORY_IDS) {
    if (next[id].some((task) => task.id === taskId)) {
      next[id] = next[id].filter((task) => task.id !== taskId);
      break;
    }
  }

  return next;
}

export function toggleComplete(board: BoardState, taskId: string): BoardState {
  return mapTask(board, taskId, (task) => ({
    ...task,
    completed: !task.completed,
  }));
}

export function moveTask(
  board: BoardState,
  taskId: string,
  toCategoryId: CategoryId,
  toIndex: number,
): BoardState {
  let moving: Task | undefined;
  let fromCategoryId: CategoryId | undefined;

  for (const id of CATEGORY_IDS) {
    const found = board[id].find((task) => task.id === taskId);
    if (found) {
      moving = found;
      fromCategoryId = id;
      break;
    }
  }

  if (!moving || !fromCategoryId) return board;

  const source = board[fromCategoryId].filter((task) => task.id !== taskId);

  if (fromCategoryId === toCategoryId) {
    const list = [...source];
    const index = Math.max(0, Math.min(toIndex, list.length));
    list.splice(index, 0, moving);
    return { ...board, [toCategoryId]: list };
  }

  const dest = [...board[toCategoryId]];
  const index = Math.max(0, Math.min(toIndex, dest.length));
  dest.splice(index, 0, { ...moving, categoryId: toCategoryId });

  return {
    ...board,
    [fromCategoryId]: source,
    [toCategoryId]: dest,
  };
}

function mapTask(
  board: BoardState,
  taskId: string,
  mapper: (task: Task) => Task,
): BoardState {
  const next: BoardState = { ...board };

  for (const id of CATEGORY_IDS) {
    const index = next[id].findIndex((task) => task.id === taskId);
    if (index !== -1) {
      const list = [...next[id]];
      list[index] = mapper(list[index]);
      next[id] = list;
      break;
    }
  }

  return next;
}
