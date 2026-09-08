"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { move } from "@dnd-kit/helpers";
import { KeyboardSensor, PointerSensor, DragDropProvider } from "@dnd-kit/react";
import { CategoryColumn } from "./CategoryColumn";
import { GuideSidebar } from "./GuideSidebar";
import { TodayHeader } from "./TodayHeader";
import {
  getCategories,
  getDay,
  saveCategories,
  saveDay,
} from "@/lib/api";
import { CATEGORIES, CATEGORY_IDS, renameCategory, reorderCategories } from "@/lib/categories";
import { todayKey, shiftDate } from "@/lib/dates";
import { logout } from "@/lib/auth";
import { addTask, deleteTask, emptyBoard, toggleComplete, updateTask } from "@/lib/tasks";
import type { BoardState, Category, CategoryId, Task } from "@/lib/types";

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
  const [board, setBoard] = useState<BoardState>(emptyBoard);
  const [categories, setCategories] = useState(CATEGORIES);
  const activeDate = openDate || today;

  useEffect(() => {
    void getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!activeDate) return;
    setBoard(emptyBoard());
    let cancelled = false;
    void getDay(activeDate).then((next) => {
      if (!cancelled) setBoard(next);
    });
    return () => {
      cancelled = true;
    };
  }, [activeDate]);

  function updateBoard(updater: (current: BoardState) => BoardState) {
    const next = updater(board);
    setBoard(next);
    void saveDay(activeDate, next);
  }

  function updateCategories(next: Category[]) {
    setCategories(next);
    void saveCategories(next);
  }

  if (!today || !activeDate) {
    return (
      <div
        data-testid="today-board"
        className="mx-auto w-full max-w-[1800px] px-4 py-10 sm:px-6 lg:px-8"
      >
        <h1 className="text-center font-serif text-4xl text-forest">Daily Compass</h1>
      </div>
    );
  }

  return (
    <div
      data-testid="today-board"
      data-date={activeDate}
      className="mx-auto w-full max-w-[1800px] px-4 py-10 sm:px-6 lg:px-8"
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
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <DragDropProvider
          sensors={dndSensors}
          onDragEnd={(event) => {
            const date = activeDate;
            window.setTimeout(() => {
              setBoard((current) => {
                const moved = move(current, event);
                if (moved === current) return current;
                const next = syncCategoryIds(moved);
                void saveDay(date, next);
                return next;
              });
            }, 0);
          }}
        >
          <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {categories.map((category, index) => (
              <CategoryColumn
                key={category.id}
                id={category.id}
                label={category.label}
                tasks={board[category.id]}
                canMoveLeft={index > 0}
                canMoveRight={index < categories.length - 1}
                onMoveLeft={() =>
                  updateCategories(reorderCategories(categories, index, index - 1))
                }
                onMoveRight={() =>
                  updateCategories(reorderCategories(categories, index, index + 1))
                }
                onRename={(label) =>
                  updateCategories(renameCategory(categories, category.id, label))
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
              />
            ))}
          </div>
        </DragDropProvider>
        <GuideSidebar date={activeDate} onBoard={setBoard} />
      </div>
    </div>
  );
}
