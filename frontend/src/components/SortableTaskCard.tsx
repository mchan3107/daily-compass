"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { defaultCollisionDetection } from "@dnd-kit/collision";
import { SortableKeyboardPlugin } from "@dnd-kit/dom/sortable";
import { useSortable } from "@dnd-kit/react/sortable";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/lib/types";

type SortableTaskCardProps = {
  task: Task;
  index: number;
  onToggle: () => void;
  onSave: (input: { title: string; details: string }) => void;
  onDelete: () => void;
};

export function SortableTaskCard({
  task,
  index,
  onToggle,
  onSave,
  onDelete,
}: SortableTaskCardProps) {
  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: task.id,
    index,
    type: "item",
    accept: "item",
    group: task.categoryId,
    collisionPriority: CollisionPriority.High,
    plugins: [SortableKeyboardPlugin],
    collisionDetector: (input) => {
      if (input.dragOperation.source?.id === input.droppable.id) return null;
      return defaultCollisionDetection(input);
    },
  });

  return (
    <div
      ref={ref}
      data-dragging={isDragging}
      className={`py-1.5 ${isDragging ? "z-20" : ""}`}
    >
      <div
        ref={handleRef}
        data-testid={`drag-${task.id}`}
        className={`relative select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"} ${
          isDropTarget && !isDragging ? "[&>article]:ring-2 [&>article]:ring-gold" : ""
        }`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute top-3 right-3 text-xs tracking-widest text-sage"
        >
          ::
        </span>
        <TaskCard
          task={task}
          onToggle={onToggle}
          onSave={onSave}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
