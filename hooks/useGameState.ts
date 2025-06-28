// src/hooks/useGameState.ts
import { useState } from 'react';
import { doLinesIntersect, gridToScreenCoordinates } from '../utils/gameLogic';

interface GamePoint {
  row: number;
  col: number;
  number: number;
}

interface GameState {
  currentPath: GamePoint[];
  currentNumber: number;
  isDrawing: boolean;
  levelComplete: boolean;
  pathHistory: GamePoint[][];
}

export default function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    currentPath: [],
    currentNumber: 1,
    isDrawing: false,
    levelComplete: false,
    pathHistory: [],
  });

  const validateNewPath = (newPoint: GamePoint): boolean => {
    if (gameState.currentPath.length === 0) return true;

    const lastPoint = gameState.currentPath[gameState.currentPath.length - 1];
    const newLine = {
      start: gridToScreenCoordinates(lastPoint.row, lastPoint.col, 5),
      end: gridToScreenCoordinates(newPoint.row, newPoint.col, 5),
    };

    // Check intersection with all existing lines
    for (let i = 0; i < gameState.currentPath.length - 1; i++) {
      const start = gameState.currentPath[i];
      const end = gameState.currentPath[i + 1];
      const existingLine = {
        start: gridToScreenCoordinates(start.row, start.col, 5),
        end: gridToScreenCoordinates(end.row, end.col, 5),
      };

      if (doLinesIntersect(newLine, existingLine)) {
        return false;
      }
    }

    return true;
  };

  const startPath = (point: GamePoint) => {
    if (point.number === 1) {
      setGameState(prev => ({
        ...prev,
        currentPath: [point],
        currentNumber: 2,
        isDrawing: true,
        pathHistory: [[]],
      }));
      return true;
    }
    return false;
  };

  const addToPath = (point: GamePoint) => {
    if (point.number === gameState.currentNumber && validateNewPath(point)) {
      const newPath = [...gameState.currentPath, point];
      setGameState(prev => ({
        ...prev,
        currentPath: newPath,
        currentNumber: prev.currentNumber + 1,
        levelComplete: point.number === 16,
        pathHistory: [...prev.pathHistory, [...prev.currentPath]],
      }));
      return true;
    }
    return false;
  };

  const undoLastMove = () => {
    if (gameState.pathHistory.length > 0) {
      const previousPath = gameState.pathHistory[gameState.pathHistory.length - 1];
      const newHistory = gameState.pathHistory.slice(0, -1);
      
      setGameState(prev => ({
        ...prev,
        currentPath: previousPath,
        currentNumber: previousPath.length + 1,
        levelComplete: false,
        pathHistory: newHistory,
      }));
    }
  };

  const resetGame = () => {
    setGameState({
      currentPath: [],
      currentNumber: 1,
      isDrawing: false,
      levelComplete: false,
      pathHistory: [],
    });
  };

  return {
    gameState,
    startPath,
    addToPath,
    undoLastMove,
    resetGame,
  };
}