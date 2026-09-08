"use client";

import { useState, useSyncExternalStore } from "react";
import { move } from "@dnd-kit/helpers";
import { KeyboardSensor, PointerSensor, DragDropProvider } from "@dnd-kit/react";
import { CategoryColumn } from "./CategoryColumn";
import { TodayHeader } from "./TodayHeader";
import { CATEGORIES, CATEGORY_IDS, renameCategory, reorderCategories } from "@/lib/categories";
import { todayKey, shiftDate } from "@/lib/dates";
import { boardForDate, moveTaskToDate, setBoard } from "@/lib/days";
import { dummyBoard } from "@/lib/dummy-tasks";
import { addTask, deleteTask, emptyBoard, toggleComplete, updateTask } from "@/lib/tasks";
import { logout } from "@/lib/auth";
import type { BoardState, CategoryId, DaysState, Task } from "@/lib/types";

const dndSensors = [
  PointerSensor.configure({
    preventActivation(event) {
      const target = event.target;
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [contenteditable]:not([contenteditable="false"])',
        ),
      );
    },
  }),
  KeyboardSensor,
];

function syncCategoryIds(board: BoardState): BoardState {
  const lastSeen = new Map<string, { task: Task; categoryId: CategoryId }>();

  for (const id of CATEGORY_IDS) {
    for (const task of board[id]) {
      lastSeen.set(task.id, { task, categoryId: id });
    }
  }

  const next = emptyBoard();
  const placed = new Set<string>();

  for (const id of CATEGORY_IDS) {
    for (const task of board[id]) {
      const latest = lastSeen.get(task.id);
      if (!latest || latest.categoryId !== id || placed.has(task.id)) continue;
      placed.add(task.id);
      next[id].push(task.categoryId === id ? task : { ...task, categoryId: id });
    }
  }

  return next;
}

function subscribe() {
  return () => {};
}

export function TodayBoard({ onLogout }: { onLogout: () => void }) {
  const today = useSyncExternalStore(subscribe, todayKey, () => "");
  const [openDate, setOpenDate] = useState("");
  const [days, setDays] = useState<DaysState>({});
  const [categories, setCategories] = useState(CATEGORIES);
  const activeDate = openDate || today;

  if (!today || !activeDate) {
    return (
      <div
        data-testid="today-board"
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <h1 className="text-center font-serif text-4xl text-forest">Daily Compass</h1>
      </div>
    );
  }

  const daysState: DaysState = { [today]: dummyBoard, ...days };
  const board = boardForDate(daysState, activeDate);

  function updateBoard(updater: (current: BoardState) => BoardState) {
    setDays((current) => {
      const merged = { [today]: dummyBoard, ...current };
      return setBoard(merged, activeDate, updater(boardForDate(merged, activeDate)));
    });
  }

  return (
    <div
      data-testid="today-board"
      className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <TodayHeader
        date={activeDate}
        viewingToday={activeDate === today}
        onPrev={() => setOpenDate(shiftDate(activeDate, -1))}
        onNext={() => setOpenDate(shiftDate(activeDate, 1))}
        onPickDate={setOpenDate}
        onLogout={() => {
          void logout().then(onLogout);
        }}
      />
      <DragDropProvider
        sensors={dndSensors}
        onDragEnd={(event) => {
          const date = activeDate;
          window.setTimeout(() => {
            setDays((current) => {
              const merged = { [today]: dummyBoard, ...current };
              const currentBoard = boardForDate(merged, date);
              const moved = move(currentBoard, event);
              if (moved === currentBoard) return current;
              return setBoard(merged, date, syncCategoryIds(moved));
            });
          }, 0);
        }}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {categories.map((category, index) => (
            <CategoryColumn
              key={category.id}
              id={category.id}
              label={category.label}
              tasks={board[category.id]}
              canMoveLeft={index > 0}
              canMoveRight={index < categories.length - 1}
              onMoveLeft={() =>
                setCategories((current) => reorderCategories(current, index, index - 1))
              }
              onMoveRight={() =>
                setCategories((current) => reorderCategories(current, index, index + 1))
              }
              onRename={(label) =>
                setCategories((current) => renameCategory(current, category.id, label))
              }
              onAdd={(input) =>
                updateBoard((current) => addTask(current, category.id, input))
              }
              onToggle={(taskId) =>
                updateBoard((current) => toggleComplete(current, taskId))
              }
              onSave={(taskId, input) =>
                updateBoard((current) => updateTask(current, taskId, input))
              }
              onDelete={(taskId) =>
                updateBoard((current) => deleteTask(current, taskId))
              }
              onMoveToDate={(taskId, date) =>
                setDays((current) =>
                  moveTaskToDate({ [today]: dummyBoard, ...current }, activeDate, taskId, date),
                )
              }
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}
