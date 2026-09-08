import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DragDropProvider } from "@dnd-kit/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryColumn } from "./CategoryColumn";
import type { Task } from "@/lib/types";

const task: Task = {
  id: "health-1",
  categoryId: "health",
  title: "Morning stretch",
  details: "Ten easy minutes",
  completed: false,
};

const unused = {
  onAdd: () => undefined,
  onToggle: () => undefined,
  onSave: () => undefined,
  onDelete: () => undefined,
  onMoveToDate: () => undefined,
};

describe("CategoryColumn", () => {
  it("renames the category", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();

    render(
      <DragDropProvider>
        <CategoryColumn
          id="health"
          label="Health / Exercise"
          tasks={[task]}
          canMoveLeft={false}
          canMoveRight
          onMoveLeft={() => undefined}
          onMoveRight={() => undefined}
          onRename={onRename}
          {...unused}
        />
      </DragDropProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Rename Health / Exercise" }));
    await user.clear(screen.getByLabelText("Category name"));
    await user.type(screen.getByLabelText("Category name"), "Body");
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(onRename).toHaveBeenCalledWith("Body");
  });

  it("moves the category left and right", async () => {
    const user = userEvent.setup();
    const onMoveLeft = vi.fn();
    const onMoveRight = vi.fn();

    render(
      <DragDropProvider>
        <CategoryColumn
          id="health"
          label="Health / Exercise"
          tasks={[task]}
          canMoveLeft
          canMoveRight
          onMoveLeft={onMoveLeft}
          onMoveRight={onMoveRight}
          onRename={() => undefined}
          {...unused}
        />
      </DragDropProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Move Health / Exercise left" }));
    await user.click(screen.getByRole("button", { name: "Move Health / Exercise right" }));

    expect(onMoveLeft).toHaveBeenCalledTimes(1);
    expect(onMoveRight).toHaveBeenCalledTimes(1);
  });
});
