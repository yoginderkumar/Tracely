// src/components/PathLine.tsx
import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const GRID_WIDTH = width - 40;

interface PathLineProps {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  gradientId: string;
  gradientColors: string[];
  gridCols: number;
  gridRows: number;
}

export default function PathLine({ 
  startRow, 
  startCol, 
  endRow, 
  endCol, 
  gradientId,
  gradientColors,
  gridCols,
  gridRows
}: PathLineProps) {
  const CELL_SIZE = GRID_WIDTH / gridCols;
  
  // Convert grid coordinates to screen coordinates
  const getScreenCoordinates = (row: number, col: number) => {
    const x = col * CELL_SIZE + CELL_SIZE / 2;
    const y = row * CELL_SIZE + CELL_SIZE / 2;
    return { x, y };
  };

  const startCoords = getScreenCoordinates(startRow, startCol);
  const endCoords = getScreenCoordinates(endRow, endCol);

  // Create rounded rectangular path
  const createRoundedRectPath = (x1: number, y1: number, x2: number, y2: number) => {
    const strokeWidth = 16;
    const radius = 8;
    
    // Calculate direction vector
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return '';
    
    // Normalize direction
    const unitX = dx / length;
    const unitY = dy / length;
    
    // Calculate perpendicular vector for width
    const perpX = -unitY * strokeWidth / 2;
    const perpY = unitX * strokeWidth / 2;
    
    // Calculate the four corners of the rectangle
    const corners = [
      { x: x1 + perpX, y: y1 + perpY }, // top-left
      { x: x2 + perpX, y: y2 + perpY }, // top-right
      { x: x2 - perpX, y: y2 - perpY }, // bottom-right
      { x: x1 - perpX, y: y1 - perpY }, // bottom-left
    ];
    
    // Create rounded rectangle path
    return `
      M ${corners[0].x + radius} ${corners[0].y}
      L ${corners[1].x - radius} ${corners[1].y}
      Q ${corners[1].x} ${corners[1].y} ${corners[1].x} ${corners[1].y + radius}
      L ${corners[2].x} ${corners[2].y - radius}
      Q ${corners[2].x} ${corners[2].y} ${corners[2].x - radius} ${corners[2].y}
      L ${corners[3].x + radius} ${corners[3].y}
      Q ${corners[3].x} ${corners[3].y} ${corners[3].x} ${corners[3].y - radius}
      L ${corners[0].x} ${corners[0].y + radius}
      Q ${corners[0].x} ${corners[0].y} ${corners[0].x + radius} ${corners[0].y}
      Z
    `;
  };

  const pathData = createRoundedRectPath(startCoords.x, startCoords.y, endCoords.x, endCoords.y);

  return (
    <Svg
      height={CELL_SIZE * gridRows}
      width={GRID_WIDTH}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
      }}
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={gradientColors[0]} />
          <Stop offset="100%" stopColor={gradientColors[1]} />
        </LinearGradient>
      </Defs>
      <Path
        d={pathData}
        fill={`url(#${gradientId})`}
      />
    </Svg>
  );
}