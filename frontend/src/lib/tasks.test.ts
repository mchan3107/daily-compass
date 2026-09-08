import { describe, expect, it } from "vitest";
import { dummyBoard } from "./dummy-tasks";
import { CATEGORY_IDS } from "./categories";
import {
  addTask,
  deleteTask,
  emptyBoard,
  moveTask,
  toggleComplete,
  updateTask,
} from "./tasks";
import type { BoardState, Task } from "./types";

function task(
  overrides: Partial<Task> & Pick<Task, "id" | "categoryId" | "title">,
): Task {
  return {
    details: "",
    completed: false,
    ...overrides,
  };
}

function sampleBoard(): BoardState {
  return {
    health: [
      task({ id: "h1", categoryId: "health", title: "Stretch" }),
      task({ id: "h2", categoryId: "health", title: "Walk" }),
    ],
    relationships: [task({ id: "r1", categoryId: "relationships", title: "Call" })],
    growth: [],
    hobbies: [task({ id: "hb1", categoryId: "hobbies", title: "Sketch" })],
    career: [task({ id: "c1", categoryId: "career", title: "Brief" })],
  };
}

describe("dummyBoard", () => {
  it("covers all five categories with at least two tasks each", () => {
    for (const id of CATEGORY_IDS) {
      expect(dummyBoard[id].length).toBeGreaterThanOrEqual(2);
      for (const item of dummyBoard[id]) {
        expect(item.categoryId).toBe(id);
        expect(item.title.length).toBeGreaterThan(0);
        expect(item.details.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("addTask", () => {
  it("appends a task to the chosen category", () => {
    const board = addTask(emptyBoard(), "health", {
      title: "Morning stretch",
      details: "Ten easy minutes",
    });

    expect(board.health).toHaveLength(1);
    expect(board.health[0]).toMatchObject({
      categoryId: "health",
      title: "Morning stretch",
      details: "Ten easy minutes",
      completed: false,
    });
    expect(board.health[0].id).toBeTruthy();
    expect(board.growth).toHaveLength(0);
  });

  it("does not add a task when the title is blank", () => {
    const board = addTask(emptyBoard(), "career", {
      title: "   ",
      details: "notes",
    });

    expect(board.career).toHaveLength(0);
  });
});

describe("updateTask", () => {
  it("updates title and details in place", () => {
    const board = updateTask(sampleBoard(), "h1", {
      title: "Yoga",
      details: "Sun salutations",
    });

    expect(board.health[0]).toMatchObject({
      id: "h1",
      title: "Yoga",
      details: "Sun salutations",
    });
    expect(board.health[1].title).toBe("Walk");
  });

  it("ignores a blank title", () => {
    const board = updateTask(sampleBoard(), "h1", {
      title: " ",
      details: "changed",
    });

    expect(board.health[0].title).toBe("Stretch");
    expect(board.health[0].details).toBe("");
  });
});

describe("deleteTask", () => {
  it("removes the task from its category", () => {
    const board = deleteTask(sampleBoard(), "h1");

    expect(board.health.map((item) => item.id)).toEqual(["h2"]);
  });
});

describe("toggleComplete", () => {
  it("marks a task complete and back again without moving it", () => {
    const completed = toggleComplete(sampleBoard(), "h1");
    expect(completed.health[0].completed).toBe(true);
    expect(completed.health.map((item) => item.id)).toEqual(["h1", "h2"]);

    const undone = toggleComplete(completed, "h1");
    expect(undone.health[0].completed).toBe(false);
  });
});

describe("moveTask", () => {
  it("reorders within a category", () => {
    const board = moveTask(sampleBoard(), "h2", "health", 0);

    expect(board.health.map((item) => item.id)).toEqual(["h2", "h1"]);
  });

  it("moves a task into another category at the given index", () => {
    const board = moveTask(sampleBoard(), "h1", "career", 0);

    expect(board.health.map((item) => item.id)).toEqual(["h2"]);
    expect(board.career.map((item) => item.id)).toEqual(["h1", "c1"]);
    expect(board.career[0].categoryId).toBe("career");
  });

  it("moves a task into an empty category", () => {
    const board = moveTask(sampleBoard(), "r1", "growth", 0);

    expect(board.relationships).toHaveLength(0);
    expect(board.growth).toEqual([
      expect.objectContaining({
        id: "r1",
        categoryId: "growth",
        title: "Call",
      }),
    ]);
  });
});
