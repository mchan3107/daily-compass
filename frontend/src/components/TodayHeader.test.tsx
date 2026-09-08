import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TodayHeader } from "./TodayHeader";

describe("TodayHeader", () => {
  it("shows Today and the formatted date", () => {
    render(
      <TodayHeader
        date="2026-09-07"
        viewingToday
        onPrev={() => undefined}
        onNext={() => undefined}
        onPickDate={() => undefined}
        onLogout={() => undefined}
      />,
    );

    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Monday, September 7, 2026")).toBeInTheDocument();
    expect(screen.getByLabelText("Choose date")).toHaveValue("2026-09-07");
  });

  it("hides the Today label on other days and notifies on navigation", async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onPickDate = vi.fn();

    render(
      <TodayHeader
        date="2026-09-08"
        viewingToday={false}
        onPrev={onPrev}
        onNext={onNext}
        onPickDate={onPickDate}
        onLogout={() => undefined}
      />,
    );

    expect(screen.queryByText("Today")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Previous day" }));
    await user.click(screen.getByRole("button", { name: "Next day" }));
    fireEvent.change(screen.getByLabelText("Choose date"), {
      target: { value: "2026-09-10" },
    });

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPickDate).toHaveBeenCalledWith("2026-09-10");
  });

  it("logs out", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();

    render(
      <TodayHeader
        date="2026-09-07"
        viewingToday
        onPrev={() => undefined}
        onNext={() => undefined}
        onPickDate={() => undefined}
        onLogout={onLogout}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
