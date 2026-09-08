import { test, expect } from "@playwright/test";
import { dummyBoard } from "../src/lib/dummy-tasks";
import { signIn } from "./auth";

test.use({ viewport: { width: 1440, height: 900 } });

function boardWithEveningWalk() {
  return {
    ...dummyBoard,
    health: [
      ...dummyBoard.health,
      {
        id: "health-new",
        categoryId: "health",
        title: "Evening walk",
        details: "Ten quiet minutes.",
        completed: false,
      },
    ],
  };
}

async function mockChat(page: import("@playwright/test").Page) {
  let turn = 0;
  await page.route("**/api/chat", async (route) => {
    turn += 1;
    if (turn === 1) {
      await route.fulfill({
        json: { reply: "Start with the stretch.", board: null },
      });
      return;
    }
    await route.fulfill({
      json: {
        reply: "I added an evening walk.",
        board: boardWithEveningWalk(),
      },
    });
  });
}

test("shows the planning guide and keeps two turns", async ({ page }) => {
  await signIn(page);
  await mockChat(page);

  await expect(page.getByTestId("guide-sidebar")).toBeVisible();
  await expect(page.getByTestId("guide-empty")).toBeVisible();

  await page.getByTestId("guide-input").fill("What first?");
  await page.getByTestId("guide-send").click();
  await expect(page.getByText("What first?")).toBeVisible();
  await expect(page.getByText("Start with the stretch.")).toBeVisible();

  await page.getByTestId("guide-input").fill("Add a walk tonight.");
  await page.getByTestId("guide-send").click();
  await expect(page.getByText("I added an evening walk.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Evening walk" }),
  ).toBeVisible();
});

test("clears the conversation after logout", async ({ page }) => {
  await signIn(page);
  await mockChat(page);

  await page.getByTestId("guide-input").fill("What first?");
  await page.getByTestId("guide-send").click();
  await expect(page.getByText("Start with the stretch.")).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByTestId("login-form")).toBeVisible();

  await signIn(page);
  await expect(page.getByTestId("guide-empty")).toBeVisible();
  await expect(page.getByText("Start with the stretch.")).toHaveCount(0);
});
