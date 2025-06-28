// src/components/GameLine.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { colors } from '../styles/globalStyles';

// Define the interface for GameLine's props
interface GameLineProps {
  path: string; // SVG path data (e.g., "M10 10 L50 50")
  color?: string; // Color of the line
  strokeWidth?: number; // Thickness of the line
  isComplete?: boolean; // If it's part of a completed path
  isCurrentDrawing?: boolean; // If it's the line currently being drawn
}

const GameLine: React.FC<GameLineProps> = ({
  path,
  color = colors.primaryHighlight, // Default to a prominent highlight color
  strokeWidth = 10,
  isComplete = false,
  isCurrentDrawing = false,
}) => {
  return (
    // Note: Svg component needs to wrap Path/G elements.
    // It's often better to render Svg *once* in a parent (like GameGrid)
    // and then render multiple G/Path elements as children within that single Svg.
    // For now, we'll keep it here, but be aware of this optimization for performance.
    <Svg style={StyleSheet.absoluteFillObject}>
      <Path
        d={path} // The SVG path data
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none" // Lines should not be filled
        strokeLinecap="round" // Round ends of lines
        strokeLinejoin="round" // Round corners of lines
        // Optional: Add opacity for current drawing or completed lines
        opacity={isCurrentDrawing ? 0.8 : isComplete ? 1 : 0.6}
      />
    </Svg>
  );
};
export default GameLine;