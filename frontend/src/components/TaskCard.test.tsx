import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/lib/types";

const task: Task = {
  id: "health-1",
  categoryId: "health",
  title: "Morning stretch",
  details: "Ten easy minutes",
  completed: false,
};

describe("TaskCard", () => {
  it("toggles complete", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <TaskCard
        task={task}
        onToggle={onToggle}
        onSave={() => undefined}
        onDelete={() => undefined}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Morning stretch" }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("saves edits", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <TaskCard
        task={task}
        onToggle={() => undefined}
        onSave={onSave}
        onDelete={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit Morning stretch" }));
    await user.clear(screen.getByLabelText("Task"));
    await user.type(screen.getByLabelText("Task"), "Yoga");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith({
      title: "Yoga",
      details: "Ten easy minutes",
    });
  });

  it("deletes the task", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <TaskCard
        task={task}
        onToggle={() => undefined}
        onSave={() => undefined}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete Morning stretch" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("shows completed tasks with strikethrough", () => {
    render(
      <TaskCard
        task={{ ...task, completed: true }}
        onToggle={() => undefined}
        onSave={() => undefined}
        onDelete={() => undefined}
      />,
    );

    expect(screen.getByTestId("task-health-1")).toHaveAttribute(
      "data-completed",
      "true",
    );
    expect(screen.getByText("Morning stretch")).toHaveClass("line-through");
  });
});
