// src/components/GameLine.tsx
import { colors } from '@/styles/globalStyles';
import React from 'react';
import { Path } from 'react-native-svg';

interface GameLineProps {
  path: string; // SVG path data (e.g., "M10 10 L50 50")
  color?: string; // Color of the line
  strokeWidth?: number; // Thickness of the line
  isComplete?: boolean; // If it's part of a completed path
  isCurrentDrawing?: boolean; // If it's the line currently being drawn
}

const GameLine: React.FC<GameLineProps> = ({
  path,
  color = colors.primaryHighlight,
  strokeWidth = 8,
  isComplete = false,
  isCurrentDrawing = false,
}) => {
  // Don't render empty paths
  if (!path || path.length === 0) {
    return null;
  }

  return (
    <Path
      d={path}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={isCurrentDrawing ? 0.7 : isComplete ? 1 : 0.6}
    />
  );
};

export default GameLine;