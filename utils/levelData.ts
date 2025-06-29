// src/utils/levelData.ts
import { NumberDotData } from "@/types";

export interface Level {
  id: number;
  gridSize: { rows: number; cols: number };
  numbers: NumberDotData[];
}

// Example Level Data - Updated to match your screenshot
export const levels: Level[] = [
  {
    id: 1,
    gridSize: { rows: 6, cols: 6 },
    numbers: [
      { id: 1, position: { x: 1, y: 2 } }, // Row 2, Col 1
      { id: 2, position: { x: 3, y: 1 }, isStart: true }, // Row 1, Col 3 (highlighted in screenshot)
      { id: 3, position: { x: 3, y: 3 } }, // Row 3, Col 3  
      { id: 4, position: { x: 1, y: 3 } }, // Row 3, Col 1
      { id: 5, position: { x: 5, y: 5 } }, // Row 5, Col 5
      { id: 6, position: { x: 0, y: 0 } }, // Row 0, Col 0
    ],
  },
  {
    id: 2,
    gridSize: { rows: 5, cols: 5 },
    numbers: [
      { id: 1, position: { x: 0, y: 0 } },
      { id: 2, position: { x: 4, y: 0 } },
      { id: 3, position: { x: 2, y: 2 } },
      { id: 4, position: { x: 0, y: 4 } },
      { id: 5, position: { x: 4, y: 4 } },
    ]
  },
  {
    id: 3,
    gridSize: { rows: 6, cols: 6 },
    numbers: [
      { id: 1, position: { x: 0, y: 1 } },
      { id: 2, position: { x: 2, y: 0 } },
      { id: 3, position: { x: 4, y: 1 } },
      { id: 4, position: { x: 5, y: 3 } },
      { id: 5, position: { x: 3, y: 5 } },
      { id: 6, position: { x: 1, y: 4 } },
      { id: 7, position: { x: 0, y: 2 } },
      { id: 8, position: { x: 2, y: 3 } },
    ]
  }
];

// Helper to get a level by ID
export const getLevel = (id: number): Level | undefined => {
  return levels.find(level => level.id === id);
};