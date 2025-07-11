// src/components/GameGrid.tsx
import gameStyles from '@/styles/gameStyles';
import { colors } from '@/styles/globalStyles';
import { CompletedPath, RenderableNumberDotData } from '@/types';
import React, { useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { Svg } from 'react-native-svg';
import GameLine from './GameLine';
import NumberDot from './NumberDot';

interface GameGridProps {
  gridSize?: { rows: number; cols: number };
  numbers: RenderableNumberDotData[];
  onDotPress: (dotNumber: number, position: { x: number; y: number }) => void;
  currentDrawingPath: { x: number; y: number }[];
  completedPaths: CompletedPath[];
  onPanStart: (x: number, y: number) => void;
  onPanMove: (x: number, y: number) => void;
  onPanRelease: () => void;
}

const GameGrid: React.FC<GameGridProps> = ({
  gridSize = { rows: 6, cols: 6 },
  numbers,
  onDotPress,
  currentDrawingPath,
  completedPaths,
  onPanStart,
  onPanMove,
  onPanRelease,
}) => {
  const { rows, cols } = gridSize;

  const gridWidth = 300;
  const gridHeight = 300;

  const cellWidth = gridWidth / cols;
  const cellHeight = gridHeight / rows;

  const dotSize = Math.min(cellWidth, cellHeight) * 0.7;

  const gridRef = useRef<View>(null);
  const gridLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleLayout = (event: any) => {
    if (gridRef.current) {
      gridRef.current.measure((fx, fy, width, height, px, py) => {
        gridLayout.current = { x: px, y: py, width, height };
        console.log('GameGrid Layout Measured:', gridLayout.current);
      });
    }
  };

  const pixelsToSvgPath = (pixels: { x: number; y: number }[]): string => {
    if (pixels.length === 0) return "";
    let path = `M${pixels[0].x} ${pixels[0].y}`;
    for (let i = 1; i < pixels.length; i++) {
      path += ` L${pixels[i].x} ${pixels[i].y}`;
    }
    console.log('Generated SVG Path:', path);
    return path;
  };

  const currentPathSvg = pixelsToSvgPath(currentDrawingPath);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false, // Allow dot presses

      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        console.log('PanResponder Grant: Touch started at screen coords:', gestureState.x0, gestureState.y0);
        if (gridLayout.current) {
          const touchX = gestureState.x0 - gridLayout.current.x;
          const touchY = gestureState.y0 - gridLayout.current.y;
          console.log('PanResponder Grant: Touch relative to grid:', touchX, touchY);
          onPanStart(touchX, touchY);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gridLayout.current) {
          const touchX = gestureState.moveX - gridLayout.current.x;
          const touchY = gestureState.moveY - gridLayout.current.y;
          onPanMove(touchX, touchY);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        console.log('PanResponder Release: Touch ended');
        onPanRelease();
      },
    })
  ).current;

  return (
    <View
      ref={gridRef}
      onLayout={handleLayout}
      style={gameStyles.gameGridContainer}
      {...panResponder.panHandlers}
    >
      {/* Optional: Render grid cells for visual reference */}
      {Array.from({ length: rows }).map((_, rIdx) => (
        Array.from({ length: cols }).map((_, cIdx) => (
          <View
            key={`cell-${rIdx}-${cIdx}`}
            style={{
              position: 'absolute',
              left: cIdx * cellWidth,
              top: rIdx * cellHeight,
              width: cellWidth,
              height: cellHeight,
              borderWidth: 0.5,
              borderColor: colors.gridBorder,
              opacity: 0.3,
            }}
          />
        ))
      ))}

      <Svg style={StyleSheet.absoluteFillObject}>
        {/* Render completed paths */}
        {completedPaths.map((completedPath, index) => (
          completedPath.segments.map((segment, segIndex) => (
            <GameLine
              key={`completed-path-${index}-${segIndex}`}
              path={`M${segment.startPixel.x} ${segment.startPixel.y} L${segment.endPixel.x} ${segment.endPixel.y}`}
              color={completedPath.color}
              isComplete={true}
            />
          ))
        ))}

        {/* Render the line currently being drawn */}
        {currentDrawingPath.length > 1 && (
          <GameLine
            path={currentPathSvg}
            color={colors.primaryHighlight}
            isCurrentDrawing={true}
          />
        )}
      </Svg>

      {/* Render NumberDots on top of the lines */}
      {numbers.map((dotData) => {
        const x = dotData.position.x * cellWidth + cellWidth / 2;
        const y = dotData.position.y * cellHeight + cellHeight / 2;

        return (
          <NumberDot
            key={`dot-${dotData.id}-${dotData.position.x}-${dotData.position.y}`}
            number={dotData.id}
            dotPosition={dotData.position}
            isStart={dotData.isStart}
            isActive={dotData.isActive}
            isCompleted={dotData.isCompleted}
            x={x}
            y={y}
            size={dotSize}
            onPress={onDotPress}
          />
        );
      })}
    </View>
  );
};

export default GameGrid;