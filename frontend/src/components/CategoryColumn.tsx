"use client";

import { useState } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { pointerIntersection } from "@dnd-kit/collision";
import { useDroppable } from "@dnd-kit/react";
import { SortableTaskCard } from "./SortableTaskCard";
import { TaskForm } from "./TaskForm";
import type { CategoryId, Task } from "@/lib/types";

type CategoryColumnProps = {
  id: CategoryId;
  label: string;
  tasks: Task[];
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRename: (label: string) => void;
  onAdd: (input: { title: string; details: string }) => void;
  onToggle: (taskId: string) => void;
  onSave: (taskId: string, input: { title: string; details: string }) => void;
  onDelete: (taskId: string) => void;
};

export function CategoryColumn({
  id,
  label,
  tasks,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onRename,
  onAdd,
  onToggle,
  onSave,
  onDelete,
}: CategoryColumnProps) {
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(label);
  const { ref, isDropTarget } = useDroppable({
    id,
    type: "column",
    accept: "item",
    collisionDetector: pointerIntersection,
    collisionPriority: CollisionPriority.Lowest,
  });

  function saveName() {
    onRename(draftName);
    setRenaming(false);
  }

  return (
    <section
      data-testid={`column-${id}`}
      className={`flex min-h-64 flex-col rounded-3xl bg-sage-soft/60 p-4 ring-1 ring-sage/30 ${
        isDropTarget ? "ring-2 ring-gold" : ""
      }`}
    >
      <div className="mb-4 flex items-start gap-1">
        <button
          type="button"
          aria-label={`Move ${label} left`}
          disabled={!canMoveLeft}
          onClick={onMoveLeft}
          className="mt-1 rounded px-1 text-sage hover:text-forest disabled:opacity-30"
        >
          {"<"}
        </button>
        {renaming ? (
          <form
            className="min-w-0 flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              saveName();
            }}
          >
            <label className="sr-only" htmlFor={`rename-${id}`}>
              Category name
            </label>
            <input
              id={`rename-${id}`}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="w-full rounded-lg border border-sage/40 bg-paper px-2 py-1 font-serif text-xl text-forest outline-none focus:border-forest"
            />
            <button type="submit" className="sr-only">
              Save name
            </button>
          </form>
        ) : (
          <h2 className="min-w-0 flex-1 font-serif text-xl text-forest">{label}</h2>
        )}
        <button
          type="button"
          aria-label={`Move ${label} right`}
          disabled={!canMoveRight}
          onClick={onMoveRight}
          className="mt-1 rounded px-1 text-sage hover:text-forest disabled:opacity-30"
        >
          {">"}
        </button>
      </div>
      {renaming ? null : (
        <button
          type="button"
          aria-label={`Rename ${label}`}
          onClick={() => {
            setDraftName(label);
            setRenaming(true);
          }}
          className="mb-3 self-start text-xs text-sage hover:text-forest"
        >
          Rename
        </button>
      )}
      <div ref={ref} className="flex min-h-40 flex-1 flex-col">
        {tasks.map((task, index) => (
          <SortableTaskCard
            key={task.id}
            task={task}
            index={index}
            onToggle={() => onToggle(task.id)}
            onSave={(input) => onSave(task.id, input)}
            onDelete={() => onDelete(task.id)}
          />
        ))}
        {adding ? (
          <div className="rounded-2xl bg-paper p-4 shadow-sm ring-1 ring-sage/20">
            <TaskForm
              submitLabel="Add"
              onSubmit={(input) => {
                onAdd(input);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          </div>
        ) : (
          <button
            type="button"
            data-testid={`add-task-${id}`}
            onClick={() => setAdding(true)}
            className="mt-auto rounded-2xl border border-dashed border-sage px-3 py-3 text-sm text-forest/80 transition-colors hover:border-forest hover:bg-paper/70"
          >
            Add a task
          </button>
        )}
      </div>
    </section>
  );
}
