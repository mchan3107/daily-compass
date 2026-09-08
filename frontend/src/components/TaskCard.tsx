"use client";

import { useState } from "react";
import { TaskForm } from "./TaskForm";
import type { Task } from "@/lib/types";

type TaskCardProps = {
  task: Task;
  onToggle: () => void;
  onSave: (input: { title: string; details: string }) => void;
  onDelete: () => void;
  onMoveToDate: (date: string) => void;
};

export function TaskCard({
  task,
  onToggle,
  onSave,
  onDelete,
  onMoveToDate,
}: TaskCardProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-2xl bg-paper p-4 shadow-sm ring-1 ring-sage/20">
        <TaskForm
          initialTitle={task.title}
          initialDetails={task.details}
          onSubmit={(input) => {
            onSave(input);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <article
      data-testid={`task-${task.id}`}
      data-completed={task.completed}
      className="rounded-2xl bg-paper p-4 pr-10 shadow-sm ring-1 ring-sage/20 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggle}
          aria-label={task.title}
          className="mt-1 size-4 shrink-0 accent-clay"
        />
        <div className="min-w-0 flex-1">
          <h3
            className={`font-serif text-lg leading-snug text-forest ${
              task.completed ? "line-through decoration-sage/70" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.details ? (
            <p
              className={`mt-1 text-sm leading-relaxed text-warm-gray ${
                task.completed ? "line-through decoration-sage/70" : ""
              }`}
            >
              {task.details}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-end gap-3 text-sm">
        <label className="text-sage">
          <input
            type="date"
            data-testid={`move-date-${task.id}`}
            aria-label={`Move ${task.title} to date`}
            onChange={(event) => {
              if (event.target.value) onMoveToDate(event.target.value);
            }}
            className="rounded border border-sage/40 bg-paper px-1 py-0.5 text-xs text-forest"
          />
        </label>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${task.title}`}
          className="text-sage hover:text-forest"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${task.title}`}
          className="text-clay/80 hover:text-clay"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
