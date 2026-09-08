import type { Category, CategoryId } from "./types";

export const CATEGORIES: Category[] = [
  { id: "health", label: "Health / Exercise" },
  { id: "relationships", label: "Relationships" },
  { id: "growth", label: "Personal Growth" },
  { id: "hobbies", label: "Hobbies" },
  { id: "career", label: "School / Career" },
];

export const CATEGORY_IDS = CATEGORIES.map((category) => category.id);

export function isCategoryId(value: unknown): value is CategoryId {
  return CATEGORY_IDS.includes(value as CategoryId);
}

export function renameCategory(
  categories: Category[],
  id: CategoryId,
  label: string,
): Category[] {
  const nextLabel = label.trim();
  if (!nextLabel) return categories;
  return categories.map((category) =>
    category.id === id ? { ...category, label: nextLabel } : category,
  );
}

export function reorderCategories(
  categories: Category[],
  fromIndex: number,
  toIndex: number,
): Category[] {
  if (fromIndex === toIndex) return categories;
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= categories.length ||
    toIndex >= categories.length
  ) {
    return categories;
  }

  const next = [...categories];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
