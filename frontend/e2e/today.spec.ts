import { test, expect } from "@playwright/test";
import { signIn } from "./auth";

test.use({ viewport: { width: 1440, height: 900 } });

async function columnTitles(page: import("@playwright/test").Page, column: string) {
  return page.getByTestId(`column-${column}`).locator("article h3").allTextContents();
}

async function dragCard(
  page: import("@playwright/test").Page,
  fromDragTestId: string,
  toTaskTestId: string,
  targetPosition?: { x: number; y: number },
) {
  await page.getByTestId(fromDragTestId).dragTo(page.getByTestId(toTaskTestId), {
    steps: 20,
    targetPosition,
  });
  await expect(page.locator("[data-dragging=true]")).toHaveCount(0);
}

test("shows today header, five categories, and dummy tasks", async ({
  page,
}) => {
  await signIn(page);

  await expect(page).toHaveTitle(/Daily Compass/);
  await expect(
    page.getByRole("heading", { name: "Daily Compass" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Physical Health" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Relationships" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Mental Wellbeing" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hobbies & Fun" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "School & Career" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Morning stretch" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Call Mom" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Read twenty pages" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sketch in the garden" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Outline the project brief" })).toBeVisible();
});

test("adds a task to a category", async ({ page }) => {
  await signIn(page);

  await page.getByTestId("add-task-health").click();
  await page.getByLabel("Task").fill("Evening swim");
  await page.getByLabel("Notes (Optional)").fill("Easy laps at the pool.");
  await page.getByTestId("column-health").getByRole("button", { name: "Add", exact: true }).click();

  await expect(
    page.getByTestId("column-health").getByRole("heading", { name: "Evening swim" }),
  ).toBeVisible();
});

test("edits a task title and details", async ({ page }) => {
  await signIn(page);

  await page.getByRole("button", { name: "Edit Call Mom" }).click();
  await page.getByLabel("Task").fill("Call Dad");
  await page.getByLabel("Notes (Optional)").fill("Share the week.");
  await page.getByRole("button", { name: "Save", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Call Dad" })).toBeVisible();
  await expect(page.getByText("Share the week.")).toBeVisible();
  await expect(page.getByText("Call Mom")).toHaveCount(0);
});

test("marks a task complete", async ({ page }) => {
  await signIn(page);

  await page.getByRole("checkbox", { name: "Call Mom" }).check();

  const card = page.getByTestId("task-rel-1");
  await expect(card).toHaveAttribute("data-completed", "true");
  await expect(card.getByRole("heading", { name: "Call Mom" })).toHaveClass(
    /line-through/,
  );
  await expect(page.getByTestId("column-relationships").getByTestId("task-rel-1")).toBeVisible();
});

test("deletes a task", async ({ page }) => {
  await signIn(page);

  await page.getByRole("button", { name: "Delete Sketch in the garden" }).click();

  await expect(page.getByTestId("task-hobbies-1")).toHaveCount(0);
});

test("drags a card by its body to reorder within a category", async ({
  page,
}) => {
  await signIn(page);

  await expect(await columnTitles(page, "health")).toEqual([
    "Morning stretch",
    "Walk after lunch",
  ]);
  await dragCard(page, "drag-health-2", "task-health-1");
  await expect.poll(async () => columnTitles(page, "health")).toEqual([
    "Walk after lunch",
    "Morning stretch",
  ]);
});

test("drops below another card to place after it", async ({ page }) => {
  await signIn(page);

  await dragCard(page, "drag-health-1", "task-health-2", { x: 40, y: 72 });
  await expect.poll(async () => columnTitles(page, "health")).toEqual([
    "Walk after lunch",
    "Morning stretch",
  ]);
});

test("drops onto another category at the targeted card", async ({ page }) => {
  await signIn(page);

  await dragCard(page, "drag-health-1", "task-career-2", { x: 40, y: 12 });

  await expect.poll(async () => columnTitles(page, "health")).toEqual([
    "Walk after lunch",
  ]);
  await expect.poll(async () => columnTitles(page, "career")).toEqual([
    "Outline the project brief",
    "Morning stretch",
    "Review notes from class",
    "Send the weekly update",
  ]);
});

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

test("navigates previous, next, and picked dates", async ({ page }) => {
  await signIn(page);

  await expect(page.getByText("Today", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Morning stretch" })).toBeVisible();

  await page.getByTestId("next-day").click();
  await expect(page.getByText("Today", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("today-board")).not.toHaveAttribute(
    "data-date",
    dateKey(),
  );
  await expect(page.getByRole("heading", { name: "Morning stretch" })).toHaveCount(0);

  await page.getByTestId("prev-day").click();
  await expect(page.getByText("Today", { exact: true })).toBeVisible();
  await expect(page.getByTestId("today-board")).toHaveAttribute("data-date", dateKey());
  await expect(page.getByRole("heading", { name: "Morning stretch" })).toBeVisible();

  await page.getByTestId("date-picker").fill(shift(dateKey(), 1));
  await expect(page.getByTestId("today-board")).not.toHaveAttribute(
    "data-date",
    dateKey(),
  );
  await expect(page.getByRole("heading", { name: "Morning stretch" })).toHaveCount(0);
});

test("renames and reorders categories across days", async ({ page }) => {
  await signIn(page);

  await page.getByRole("button", { name: "Rename Physical Health" }).click();
  await page.getByLabel("Category name").fill("Body");
  await page.getByLabel("Category name").press("Enter");
  await expect(page.getByRole("heading", { name: "Body" })).toBeVisible();

  await page.getByRole("button", { name: "Move Body right" }).click();
  await expect.poll(async () =>
    page.locator("section h2").allTextContents(),
  ).toEqual([
    "Relationships",
    "Body",
    "Mental Wellbeing",
    "Hobbies & Fun",
    "School & Career",
  ]);

  await page.getByTestId("next-day").click();
  await expect(page.getByRole("heading", { name: "Body" })).toBeVisible();
  await expect.poll(async () =>
    page.locator("section h2").allTextContents(),
  ).toEqual([
    "Relationships",
    "Body",
    "Mental Wellbeing",
    "Hobbies & Fun",
    "School & Career",
  ]);
});
