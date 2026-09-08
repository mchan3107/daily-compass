import { expect, type Page } from "@playwright/test";

export async function signIn(page: Page) {
  await page.goto("/");
  await page.getByLabel("Username").fill("user");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByTestId("today-board")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Health / Exercise" }),
  ).toBeVisible();
}
