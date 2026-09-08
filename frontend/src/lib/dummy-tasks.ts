import type { BoardState } from "./types";

export const dummyBoard: BoardState = {
  health: [
    {
      id: "health-1",
      categoryId: "health",
      title: "Morning stretch",
      details: "Ten minutes of easy mobility before coffee.",
      completed: false,
    },
    {
      id: "health-2",
      categoryId: "health",
      title: "Walk after lunch",
      details: "Loop the neighborhood, no headphones.",
      completed: false,
    },
  ],
  relationships: [
    {
      id: "rel-1",
      categoryId: "relationships",
      title: "Call Mom",
      details: "Catch up about the weekend.",
      completed: false,
    },
    {
      id: "rel-2",
      categoryId: "relationships",
      title: "Write a thank-you note",
      details: "For last week's dinner with Sam.",
      completed: false,
    },
  ],
  growth: [
    {
      id: "growth-1",
      categoryId: "growth",
      title: "Read twenty pages",
      details: "Continue the essay collection on the nightstand.",
      completed: false,
    },
    {
      id: "growth-2",
      categoryId: "growth",
      title: "Journal tonight",
      details: "Three lines about what felt steady today.",
      completed: false,
    },
  ],
  hobbies: [
    {
      id: "hobbies-1",
      categoryId: "hobbies",
      title: "Sketch in the garden",
      details: "Loose ink study of the olive tree.",
      completed: false,
    },
    {
      id: "hobbies-2",
      categoryId: "hobbies",
      title: "Practice guitar",
      details: "The slow piece in G, twice through.",
      completed: false,
    },
  ],
  career: [
    {
      id: "career-1",
      categoryId: "career",
      title: "Outline the project brief",
      details: "Keep it to one page, no extras.",
      completed: false,
    },
    {
      id: "career-2",
      categoryId: "career",
      title: "Review notes from class",
      details: "Highlight anything still unclear.",
      completed: false,
    },
    {
      id: "career-3",
      categoryId: "career",
      title: "Send the weekly update",
      details: "Three bullets, calm and clear.",
      completed: false,
    },
  ],
};
