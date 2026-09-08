import { fireEvent, render, screen } from "@testing-library/react";
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
        onMoveToDate={() => undefined}
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
        onMoveToDate={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit Morning stretch" }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Yoga");
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
        onMoveToDate={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete Morning stretch" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("moves the task to another date", () => {
    const onMoveToDate = vi.fn();

    render(
      <TaskCard
        task={task}
        onToggle={() => undefined}
        onSave={() => undefined}
        onDelete={() => undefined}
        onMoveToDate={onMoveToDate}
      />,
    );

    fireEvent.change(screen.getByLabelText("Move Morning stretch to date"), {
      target: { value: "2026-09-08" },
    });
    expect(onMoveToDate).toHaveBeenCalledWith("2026-09-08");
  });

  it("shows completed tasks with strikethrough", () => {
    render(
      <TaskCard
        task={{ ...task, completed: true }}
        onToggle={() => undefined}
        onSave={() => undefined}
        onDelete={() => undefined}
        onMoveToDate={() => undefined}
      />,
    );

    expect(screen.getByTestId("task-health-1")).toHaveAttribute(
      "data-completed",
      "true",
    );
    expect(screen.getByText("Morning stretch")).toHaveClass("line-through");
  });
});
