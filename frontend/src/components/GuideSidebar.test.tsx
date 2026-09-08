import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dummyBoard } from "@/lib/dummy-tasks";
import { GuideSidebar } from "./GuideSidebar";

vi.mock("@/lib/api", () => ({
  sendChat: vi.fn(),
}));

import { sendChat } from "@/lib/api";

describe("GuideSidebar", () => {
  beforeEach(() => {
    vi.mocked(sendChat).mockReset();
  });

  it("shows planning-guide empty copy", () => {
    render(<GuideSidebar date="2026-09-07" onBoard={() => undefined} />);

    expect(screen.getByRole("heading", { name: "This day" })).toBeInTheDocument();
    expect(
      screen.getByText(/Ask about this day. I can help you prioritize/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/chatbot/i)).not.toBeInTheDocument();
  });

  it("renders a reply after send", async () => {
    const user = userEvent.setup();
    vi.mocked(sendChat).mockResolvedValue({
      reply: "Start with the stretch.",
      board: null,
    });

    render(<GuideSidebar date="2026-09-07" onBoard={() => undefined} />);
    await user.type(
      screen.getByLabelText("Message the planning guide"),
      "What first?",
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(sendChat).toHaveBeenCalledWith("2026-09-07", "What first?");
    expect(await screen.findByText("What first?")).toBeInTheDocument();
    expect(await screen.findByText("Start with the stretch.")).toBeInTheDocument();
  });

  it("applies a returned board", async () => {
    const user = userEvent.setup();
    const onBoard = vi.fn();
    const nextBoard = {
      ...dummyBoard,
      health: [
        ...dummyBoard.health,
        {
          id: "health-new",
          categoryId: "health" as const,
          title: "Evening walk",
          details: "Ten quiet minutes.",
          completed: false,
        },
      ],
    };
    vi.mocked(sendChat).mockResolvedValue({
      reply: "I added an evening walk.",
      board: nextBoard,
    });

    render(<GuideSidebar date="2026-09-07" onBoard={onBoard} />);
    await user.type(
      screen.getByLabelText("Message the planning guide"),
      "Add a walk tonight.",
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("I added an evening walk.")).toBeInTheDocument();
    expect(onBoard).toHaveBeenCalledWith(nextBoard);
  });
});
