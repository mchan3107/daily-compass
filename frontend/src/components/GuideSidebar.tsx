"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { sendChat } from "@/lib/api";
import type { BoardState } from "@/lib/types";

type GuideMessage = {
  role: "user" | "assistant";
  text: string;
};

type GuideSidebarProps = {
  date: string;
  onBoard: (board: BoardState) => void;
};

export function GuideSidebar({ date, onBoard }: GuideSidebarProps) {
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, pending]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;

    setDraft("");
    setMessages((current) => [...current, { role: "user", text }]);
    setPending(true);
    const result = await sendChat(date, text);
    setMessages((current) => [
      ...current,
      { role: "assistant", text: result.reply },
    ]);
    if (result.board) onBoard(result.board);
    setPending(false);
  }

  return (
    <aside
      data-testid="guide-sidebar"
      className="flex h-[min(42rem,calc(100vh-8rem))] w-full flex-col rounded-3xl bg-sage-soft/60 p-4 ring-1 ring-sage/30 xl:sticky xl:top-6 xl:w-96"
    >
      <header className="mb-3 border-b border-sage/30 pb-3">
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          AI Assistant
        </p>
        <h2 className="mt-1 font-serif text-2xl text-forest">This day</h2>
        <p className="mt-1 text-sm text-warm-gray">
          Chat with AI about the day you have open.
        </p>
      </header>
      <div
        ref={listRef}
        data-testid="guide-messages"
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
      >
        {messages.length === 0 && !pending ? (
          <p data-testid="guide-empty" className="text-sm text-warm-gray">
            Get help prioritizing tasks, deciding what to focus on, breaking
            down goals, and reorganizing your day.
          </p>
        ) : null}
        {messages.map((message, index) => (
          <p
            key={`${message.role}-${index}`}
            data-testid="guide-message"
            data-role={message.role}
            className={
              message.role === "user"
                ? "self-end rounded-2xl bg-paper px-3 py-2 text-sm text-forest ring-1 ring-sage/30"
                : "self-start rounded-2xl bg-cream px-3 py-2 text-sm text-forest"
            }
          >
            {message.text}
          </p>
        ))}
        {pending ? (
          <p className="self-start text-sm text-warm-gray">Looking at the day...</p>
        ) : null}
      </div>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <label className="sr-only" htmlFor="guide-input">
          Message the AI chat
        </label>
        <textarea
          id="guide-input"
          data-testid="guide-input"
          value={draft}
          rows={3}
          disabled={pending}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What would make this day steadier?"
          className="resize-none rounded-2xl border border-sage/40 bg-paper px-3 py-2 text-sm text-forest outline-none focus:border-forest"
        />
        <button
          type="submit"
          data-testid="guide-send"
          disabled={pending}
          className="rounded-full bg-forest px-4 py-2 text-sm text-paper hover:bg-forest/90 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </aside>
  );
}
