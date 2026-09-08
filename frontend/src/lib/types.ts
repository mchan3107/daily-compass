export type CategoryId =
  | "health"
  | "relationships"
  | "growth"
  | "hobbies"
  | "career";

export type Category = {
  id: CategoryId;
  label: string;
};

export type Task = {
  id: string;
  categoryId: CategoryId;
  title: string;
  details: string;
  completed: boolean;
};

export type BoardState = Record<CategoryId, Task[]>;

export type DaysState = Record<string, BoardState>;
