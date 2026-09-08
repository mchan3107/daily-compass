import { test, expect } from "@playwright/test";
import { signIn } from "./auth";

test.use({ viewport: { width: 1440, height: 900 } });

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

test("keeps an edited task after reload", async ({ page }) => {
  await signIn(page);

  await page.getByRole("button", { name: "Edit Call Mom" }).click();
  await page.getByLabel("Title").fill("Call Dad");
  await page.getByLabel("Details").fill("Share the week.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Call Dad" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Call Dad" })).toBeVisible();
  await expect(page.getByText("Share the week.")).toBeVisible();
});

test("keeps a renamed category after reload", async ({ page }) => {
  await signIn(page);

  await page.getByRole("button", { name: "Rename Health / Exercise" }).click();
  await page.getByLabel("Category name").fill("Body");
  await page.getByLabel("Category name").press("Enter");
  await expect(page.getByRole("heading", { name: "Body" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Body" })).toBeVisible();
});

test("loads the other day from the server and back", async ({ page }) => {
  await signIn(page);
  const today = dateKey();

  await expect(page.getByRole("heading", { name: "Morning stretch" })).toBeVisible();

  await page.getByTestId("next-day").click();
  await expect(page.getByTestId("today-board")).not.toHaveAttribute(
    "data-date",
    today,
  );
  await expect(page.getByRole("heading", { name: "Morning stretch" })).toHaveCount(
    0,
  );

  await page.getByTestId("prev-day").click();
  await expect(page.getByTestId("today-board")).toHaveAttribute("data-date", today);
  await expect(page.getByRole("heading", { name: "Morning stretch" })).toBeVisible();
});
