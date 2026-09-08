import { CATEGORIES, isCategoryId } from "./categories";
import { emptyBoard } from "./tasks";
import type { BoardState, Category, CategoryId } from "./types";

const jsonHeaders = { "Content-Type": "application/json" };

export async function getCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories", { credentials: "include" });
  if (!response.ok) return CATEGORIES;
  const data = (await response.json()) as {
    categories?: { id: string; label: string }[];
  };
  const items = data.categories;
  if (!items || items.length !== 5 || !items.every((item) => isCategoryId(item.id))) {
    return CATEGORIES;
  }
  return items.map((item) => ({
    id: item.id as CategoryId,
    label: item.label,
  }));
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await fetch("/api/categories", {
    method: "PUT",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({
      categories: categories.map((category) => ({
        id: category.id,
        label: category.label,
      })),
    }),
  });
}

export async function getDay(date: string): Promise<BoardState> {
  const response = await fetch(`/api/days/${date}`, { credentials: "include" });
  if (!response.ok) return emptyBoard();
  const data = (await response.json()) as { board?: BoardState };
  return data.board ?? emptyBoard();
}

export async function saveDay(date: string, board: BoardState): Promise<void> {
  await fetch(`/api/days/${date}`, {
    method: "PUT",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ board }),
  });
}

export async function sendChat(
  date: string,
  message: string,
): Promise<{ reply: string; board: BoardState | null }> {
  const response = await fetch("/api/chat", {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ date, message }),
  });
  if (!response.ok) {
    return { reply: "The guide could not reply. Try again.", board: null };
  }
  const data = (await response.json()) as {
    reply?: string;
    board?: BoardState | null;
  };
  return {
    reply: data.reply?.trim() || "The guide could not reply. Try again.",
    board: data.board ?? null,
  };
}

export async function moveTaskDate(
  fromDate: string,
  taskId: string,
  toDate: string,
): Promise<void> {
  await fetch(`/api/days/${fromDate}/move-task`, {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ taskId, toDate }),
  });
}
