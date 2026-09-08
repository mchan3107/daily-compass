import { test, expect } from "@playwright/test";
import { signIn } from "./auth";

test.use({ viewport: { width: 1440, height: 900 } });

test("shows login instead of the board when signed out", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("login-form")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Health / Exercise" })).toHaveCount(
    0,
  );
});

test("rejects a bad password", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Username").fill("user");
  await page.getByLabel("Password").fill("wrong");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Invalid username or password")).toBeVisible();
  await expect(page.getByTestId("login-form")).toBeVisible();
});

test("stays signed in after reload", async ({ page }) => {
  await signIn(page);
  await page.reload();
  await expect(page.getByTestId("today-board")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Health / Exercise" }),
  ).toBeVisible();
});

test("signs in and logs out", async ({ page }) => {
  await signIn(page);
  await expect(page.getByTestId("today-board")).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByTestId("login-form")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Health / Exercise" })).toHaveCount(
    0,
  );
});
