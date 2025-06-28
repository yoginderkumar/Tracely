import GameGrid from '@/components/GameGrid'; // Adjusted path if needed, based on your setup
import globalStyles, { colors } from '@/styles/globalStyles';
import { CompletedPath, PathSegment, RenderableNumberDotData } from '@/types'; // Adjusted path if needed
import { getLevel } from '@/utils/levelData';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import 'react-native-gesture-handler';

export default function App() {
  const currentLevelData = getLevel(1);

  const [activeDotId, setActiveDotId] = useState<number | null>(null);
  const [currentDrawingPath, setCurrentDrawingPath] = useState<{ x: number; y: number }[]>([]);
  const [completedPaths, setCompletedPaths] = useState<CompletedPath[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  if (!currentLevelData) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <Text style={{ color: colors.text }}>Error: Level not found!</Text>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  const getDotPixelPosition = (dotPosition: { x: number; y: number }): { x: number; y: number } => {
    const gridWidth = 300;
    const gridHeight = 300;
    const cellWidth = gridWidth / currentLevelData.gridSize.cols;
    const cellHeight = gridHeight / currentLevelData.gridSize.rows;

    const x = dotPosition.x * cellWidth + cellWidth / 2;
    const y = dotPosition.y * cellHeight + cellHeight / 2;
    return { x, y };
  };

  const handleDotPress = (dotNumber: number, position: { x: number; y: number }) => {
    // Only start drawing if no path is currently active or if starting a new path
    if (!isDrawing || activeDotId === null) {
      const startPixel = getDotPixelPosition(position);
      if (startPixel) {
        setCurrentDrawingPath([startPixel]);
        setActiveDotId(dotNumber); // <--- ENSURE THIS IS UNCOMMENTED AND ACTIVE
        setIsDrawing(true);
        console.log('App: Dot pressed, currentDrawingPath initialized:', [startPixel]);
        console.log(`Started drawing from dot ${dotNumber}`); // <--- ENSURE THIS IS UNCOMMENTED AND ACTIVE
    }
      // setCurrentDrawingPath([startPixel]);
      // setActiveDotId(dotNumber);
      // setIsDrawing(true);
      // console.log(`Started drawing from dot ${dotNumber}`);
    }
    // If already drawing, and user taps a dot, it means they might be trying to connect to it.
    // This will be handled in onPanMove/Release, not onDotPress for subsequent dots.
  };

  // --- START OF MISSING PAN HANDLING CALLBACKS ---
  const handlePanStart = (x: number, y: number) => {
        console.log('App: handlePanStart called with grid coords:', x, y); // <--- ADD THIS LOG

    // If drawing has already started from a dot, this is redundant,
    // but it can be a fallback for starting a path from anywhere on the grid
    // For our game, we only start drawing from a dot, so this is primarily for initial touch-down.
    if (currentDrawingPath.length === 0 && activeDotId === null) {
      // This case should ideally be prevented by the game logic (must start on a dot)
      // For now, just a placeholder.
      console.log("Pan started outside a dot initially. Ignoring for now.");
      setIsDrawing(false); // Do not allow drawing if not started on a dot
      return;
    }

    // If we have an activeDotId and currentDrawingPath has a starting point,
    // we are officially "drawing"
    setIsDrawing(true);
    // The first point of currentDrawingPath is already set by handleDotPress
    // We might want to clear existing drawing path if this is a new start
    // setCurrentDrawingPath([currentDrawingPath[0]]); // Ensure only first point
  };

  const handlePanMove = (x: number, y: number) => {
    if (isDrawing && currentDrawingPath.length > 0) {
      // Add the current touch position to the path.
      // This creates the "rubber band" effect.
      const newPath = [...currentDrawingPath];
      if (newPath.length > 1) {
          newPath[newPath.length - 1] = { x, y }; // Update last point
      } else {
          newPath.push({ x, y }); // Add second point for initial drag
      }
      setCurrentDrawingPath(newPath);
            console.log('App: handlePanMove updated path, length:', newPath.length, 'last point:', x, y); // <--- ADD THIS LOG


      // --- Game Logic to detect hovering/entering new dots will go here ---
      const tolerance = 20; // How close does the touch need to be to a dot center
      const targetDot = numbersWithState.find(dot => {
        const pixelPos = getDotPixelPosition(dot.position);
        return (
            pixelPos &&
            Math.abs(pixelPos.x - x) < tolerance &&
            Math.abs(pixelPos.y - y) < tolerance &&
            dot.id !== activeDotId && // Not the dot we just came from
            !dot.isCompleted // Not a dot already part of a completed path
            // Later: check if it's the *next sequential* number
        );
      });

      if (targetDot && activeDotId !== null && targetDot.id === activeDotId + 1) {
        const snappedPixel = getDotPixelPosition(targetDot.position);
        if (snappedPixel) {
          const newSegment: PathSegment = {
            startDot: numbersWithState.find(d => d.id === activeDotId)!, // Use '!' to assert non-null
            endDot: targetDot,
            startPixel: currentDrawingPath[0], // Or the pixel of the previously connected dot
            endPixel: snappedPixel
          };

          // For now, just add the new dot to the path. Real logic in next step.
          setCurrentDrawingPath([snappedPixel]); // Start new segment from here
          setActiveDotId(targetDot.id); // Update active dot
          console.log(`Snapped to dot ${targetDot.id}`);
        }
      }
    }
  };

  const handlePanRelease = () => {
        console.log('App: handlePanRelease called. Clearing path.'); // <--- ADD THIS LOG
    setIsDrawing(false);
    setActiveDotId(null);
    setCurrentDrawingPath([]); // Clear the drawing path on release
    // --- Game Logic for validating the final path and setting to completedPaths goes here ---
  };
  // --- END OF MISSING PAN HANDLING CALLBACKS ---

  const numbersWithState: RenderableNumberDotData[] = currentLevelData.numbers.map(dot => ({
    ...dot,
    isActive: dot.id === activeDotId,
    isCompleted: completedPaths.some(cp => cp.segments.some(s => s.startDot.id === dot.id || s.endDot.id === dot.id)),
  }));

  return (
    <SafeAreaView style={globalStyles.container}>
      <GameGrid
        gridSize={currentLevelData.gridSize}
        numbers={numbersWithState}
        onDotPress={handleDotPress}
        currentDrawingPath={currentDrawingPath}
        completedPaths={completedPaths}
        // --- ADD THESE PROPS ---
        onPanStart={handlePanStart}
        onPanMove={handlePanMove}
        onPanRelease={handlePanRelease}
      />
      <StatusBar style="light" />
      {isDrawing && currentDrawingPath.length > 0 &&
        <Text style={{ color: colors.text, marginTop: 10 }}>
            Drawing... Current path length: {currentDrawingPath.length}
        </Text>
      }
    </SafeAreaView>
  );
}