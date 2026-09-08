import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskForm } from "./TaskForm";

describe("TaskForm", () => {
  it("does not submit when the title is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TaskForm
        onSubmit={onSubmit}
        onCancel={() => undefined}
        submitLabel="Add"
      />,
    );

    await user.type(screen.getByLabelText("Notes (Optional)"), "Some notes");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed title and details", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TaskForm
        initialTitle=" Stretch "
        initialDetails=" Ten minutes "
        onSubmit={onSubmit}
        onCancel={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Stretch",
      details: "Ten minutes",
    });
  });
});
