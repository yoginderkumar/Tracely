// src/utils/levelData.ts
import { NumberDotData } from "@/types";



// Define the type for a single level
export interface Level {
  id: number;
  gridSize: { rows: number; cols: number };
  numbers: NumberDotData[];
}

// Example Level Data
export const levels: Level[] = [
  {
    id: 1,
    gridSize: { rows: 6, cols: 6 },
    numbers: [
      { id: 1, position: { x: 1, y: 1 } }, // x is column, y is row (0-indexed)
      { id: 2, position: { x: 3, y: 1 }, isStart: true }, // This '2' is a start for a sequence 2-3-4...
      { id: 3, position: { x: 3, y: 3 } },
      { id: 4, position: { x: 1, y: 3 } },
      { id: 5, position: { x: 5, y: 5 } },
      { id: 6, position: { x: 0, y: 0 } },
      // Add more numbers as per your level design
      // Remember: A sequence starts from an `isStart: true` dot and continues sequentially
      // The game will implicitly try to connect 1->2->3... or from a specific start point.
      // For now, let's just place the dots. The actual pathfinding/validation comes later.
    ],
  },
  // You can add more levels here later
  {
    id: 2,
    gridSize: { rows: 5, cols: 5 },
    numbers: [
        { id: 1, position: { x: 0, y: 0 } },
        { id: 2, position: { x: 4, y: 4 } },
        { id: 3, position: { x: 2, y: 1 } },
        { id: 4, position: { x: 3, y: 0 } },
    ]
  }
];

// Helper to get a level by ID
export const getLevel = (id: number): Level | undefined => {
  return levels.find(level => level.id === id);
};