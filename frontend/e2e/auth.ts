import { expect, type Page } from "@playwright/test";
import { CATEGORIES } from "../src/lib/categories";
import { dummyBoard } from "../src/lib/dummy-tasks";
import { emptyBoard } from "../src/lib/tasks";

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shift(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export async function resetSeed(page: Page) {
  const today = dateKey();
  await page.request.put("/api/categories", {
    data: {
      categories: CATEGORIES.map((category) => ({
        id: category.id,
        label: category.label,
      })),
    },
  });
  await page.request.put(`/api/days/${today}`, { data: { board: dummyBoard } });
  await page.request.put(`/api/days/${shift(today, -1)}`, {
    data: { board: emptyBoard() },
  });
  await page.request.put(`/api/days/${shift(today, 1)}`, {
    data: { board: emptyBoard() },
  });
}

export async function signIn(page: Page) {
  await page.goto("/");
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByTestId("today-board")).toBeVisible();
  await resetSeed(page);
  await page.reload();
  await expect(page.getByTestId("today-board")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Health / Exercise" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Morning stretch" }),
  ).toBeVisible();
}
