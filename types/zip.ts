// types/zipGame.ts
export interface GridCell {
  x: number;
  y: number;
  type: 'empty' | 'number' | 'wall';
  number?: number; // Only for numbered cells
  isVisited: boolean;
  isInPath: boolean;
  pathOrder?: number; // Order in which this cell was visited (1, 2, 3...)
}

export interface GameGrid {
  width: number;
  height: number;
  cells: GridCell[][];
  numbers: NumberCell[]; // Quick reference to numbered cells
  walls: WallCell[]; // Quick reference to walls
}

export interface NumberCell {
  x: number;
  y: number;
  number: number;
  isVisited: boolean;
}

export interface WallCell {
  x: number;
  y: number;
}

export interface PathPoint {
  x: number;
  y: number;
  pathOrder: number;
}

export interface GameState {
  grid: GameGrid;
  currentPath: PathPoint[];
  currentNumber: number; // Next number we need to visit
  isComplete: boolean;
  isDrawing: boolean;
  startPoint: { x: number; y: number } | null;
  endPoint: { x: number; y: number } | null;
}

export interface Level {
  id: number;
  width: number;
  height: number;
  numbers: { x: number; y: number; number: number }[];
  walls?: { x: number; y: number }[];
  difficulty: 'easy' | 'medium' | 'hard';
  date?: string; // For daily puzzles
}

export interface TouchPoint {
  x: number;
  y: number;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  blockedCells?: { x: number; y: number }[];
}