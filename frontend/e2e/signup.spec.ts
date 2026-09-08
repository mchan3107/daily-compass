import { test, expect } from "@playwright/test";
import { signIn } from "./auth";

test.use({ viewport: { width: 1440, height: 900 } });

test("creates an account and keeps data private", async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole("heading", { name: "Morning stretch" })).toBeVisible();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByTestId("login-form")).toBeVisible();

  const email = `other-${Date.now()}@example.com`;
  await page.getByRole("button", { name: "Create an account" }).click();
  await expect(page.getByTestId("signup-form")).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password1");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByTestId("login-form")).toBeVisible();
  await expect(
    page.getByText("Account created successfully. Please sign in."),
  ).toBeVisible();
  await expect(page.getByTestId("today-board")).toHaveCount(0);

  await page.getByLabel("Password").fill("password1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByTestId("today-board")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Physical Health" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Morning stretch" })).toHaveCount(0);

  await page.getByTestId("add-task-health").click();
  await page.getByLabel("Task").fill("User B walk");
  await page.getByTestId("column-health").getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("heading", { name: "User B walk" })).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await signIn(page);
  await expect(page.getByRole("heading", { name: "Morning stretch" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "User B walk" })).toHaveCount(0);
});

test("rejects a password shorter than 8 characters", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create an account" }).click();
  await page.getByLabel("Email").fill("short@example.com");
  await page.getByLabel("Password").fill("1234567");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
  await expect(page.getByTestId("signup-form")).toBeVisible();
});
