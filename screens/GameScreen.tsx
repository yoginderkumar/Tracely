// app/index.tsx
import GameGrid from '@/components/GameGrid';
import globalStyles, { colors } from '@/styles/globalStyles';
import { CompletedPath, PathSegment, RenderableNumberDotData } from '@/types';
import { getLevel } from '@/utils/levelData';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function GameScreen() {
  const currentLevelData = getLevel(1);

  const [activeDotId, setActiveDotId] = useState<number | null>(null);
  const [currentDrawingPath, setCurrentDrawingPath] = useState<{ x: number; y: number }[]>([]);
  const [completedPaths, setCompletedPaths] = useState<CompletedPath[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [completedSequences, setCompletedSequences] = useState<Set<number>>(new Set());

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
    console.log(`Dot ${dotNumber} pressed at position:`, position);
    
    // Only start drawing if no path is currently active or if starting a new path
    if (!isDrawing || activeDotId === null) {
      // Check if this dot is already part of a completed sequence
      if (completedSequences.has(dotNumber)) {
        console.log(`Dot ${dotNumber} is already completed, ignoring press`);
        return;
      }

      const startPixel = getDotPixelPosition(position);
      setCurrentDrawingPath([startPixel]);
      setActiveDotId(dotNumber);
      setIsDrawing(true);
      console.log(`Started drawing from dot ${dotNumber}`, startPixel);
    }
  };

  const handlePanStart = (x: number, y: number) => {
    console.log('Pan started at:', x, y);
  };

  const handlePanMove = (x: number, y: number) => {
    if (isDrawing && currentDrawingPath.length > 0 && activeDotId !== null) {
      // Update the drawing path with current touch position
      const newPath = [...currentDrawingPath];
      if (newPath.length > 1) {
        newPath[newPath.length - 1] = { x, y }; // Update last point (rubber band effect)
      } else {
        newPath.push({ x, y }); // Add second point for initial drag
      }
      setCurrentDrawingPath(newPath);

      // Check if we're hovering over the next sequential dot
      const tolerance = 25; // Touch tolerance for connecting to dots
      const targetDot = numbersWithState.find(dot => {
        const pixelPos = getDotPixelPosition(dot.position);
        return (
          Math.abs(pixelPos.x - x) < tolerance &&
          Math.abs(pixelPos.y - y) < tolerance &&
          dot.id !== activeDotId && // Not the current dot
          !completedSequences.has(dot.id) && // Not already completed
          dot.id === activeDotId + 1 // Must be the next number in sequence
        );
      });

      if (targetDot) {
        console.log(`Hovering over next dot: ${targetDot.id}`);
        // Snap to the target dot
        const snappedPixel = getDotPixelPosition(targetDot.position);
        const newPath = [currentDrawingPath[0], snappedPixel];
        setCurrentDrawingPath(newPath);
      }
    }
  };

  const handlePanRelease = () => {
    console.log('Pan released');
    
    if (isDrawing && activeDotId !== null && currentDrawingPath.length >= 2) {
      // Check if we ended on a valid next dot
      const lastPoint = currentDrawingPath[currentDrawingPath.length - 1];
      const tolerance = 25;
      
      const targetDot = numbersWithState.find(dot => {
        const pixelPos = getDotPixelPosition(dot.position);
        return (
          Math.abs(pixelPos.x - lastPoint.x) < tolerance &&
          Math.abs(pixelPos.y - lastPoint.y) < tolerance &&
          dot.id !== activeDotId &&
          !completedSequences.has(dot.id) &&
          dot.id === activeDotId + 1
        );
      });

      if (targetDot) {
        // Successfully connected to next dot
        console.log(`Connected ${activeDotId} to ${targetDot.id}`);
        
        const startDot = numbersWithState.find(d => d.id === activeDotId)!;
        const newSegment: PathSegment = {
          startDot,
          endDot: targetDot,
          startPixel: currentDrawingPath[0],
          endPixel: getDotPixelPosition(targetDot.position)
        };

        // Add to completed paths
        const existingPathIndex = completedPaths.findIndex(cp => 
          cp.segments.some(s => s.startDot.id === activeDotId || s.endDot.id === activeDotId)
        );

        if (existingPathIndex >= 0) {
          // Extend existing path
          const updatedPaths = [...completedPaths];
          updatedPaths[existingPathIndex].segments.push(newSegment);
          setCompletedPaths(updatedPaths);
        } else {
          // Create new path
          const newPath: CompletedPath = {
            segments: [newSegment],
            sequenceId: Math.min(activeDotId, targetDot.id),
            color: colors.primaryHighlight
          };
          setCompletedPaths([...completedPaths, newPath]);
        }

        // Mark dots as completed
        setCompletedSequences(prev => new Set([...prev, activeDotId, targetDot.id]));

        // Continue drawing from the new dot
        setActiveDotId(targetDot.id);
        setCurrentDrawingPath([getDotPixelPosition(targetDot.position)]);
        
        // Check if we've completed all numbers
        if (targetDot.id === Math.max(...currentLevelData.numbers.map(n => n.id))) {
          console.log('Level completed!');
          setIsDrawing(false);
          setActiveDotId(null);
          setCurrentDrawingPath([]);
        }
      } else {
        // Invalid connection, reset
        console.log('Invalid connection, resetting');
        setIsDrawing(false);
        setActiveDotId(null);
        setCurrentDrawingPath([]);
      }
    } else {
      // No valid path, reset
      setIsDrawing(false);
      setActiveDotId(null);
      setCurrentDrawingPath([]);
    }
  };

  const handleUndo = () => {
    if (completedPaths.length > 0) {
      const lastPath = completedPaths[completedPaths.length - 1];
      
      // Remove last segment
      if (lastPath.segments.length > 1) {
        const updatedPaths = [...completedPaths];
        updatedPaths[updatedPaths.length - 1].segments.pop();
        setCompletedPaths(updatedPaths);
      } else {
        // Remove entire path
        setCompletedPaths(completedPaths.slice(0, -1));
      }
      
      // Update completed sequences
      const allCompletedDots = new Set<number>();
      const updatedPaths = completedPaths.length > 1 ? completedPaths.slice(0, -1) : [];
      updatedPaths.forEach(path => {
        path.segments.forEach(segment => {
          allCompletedDots.add(segment.startDot.id);
          allCompletedDots.add(segment.endDot.id);
        });
      });
      setCompletedSequences(allCompletedDots);
    }
  };

  const handleClear = () => {
    setCompletedPaths([]);
    setCompletedSequences(new Set());
    setIsDrawing(false);
    setActiveDotId(null);
    setCurrentDrawingPath([]);
  };

  const numbersWithState: RenderableNumberDotData[] = currentLevelData.numbers.map(dot => ({
    ...dot,
    isActive: dot.id === activeDotId,
    isCompleted: completedSequences.has(dot.id),
  }));

  const allNumbersConnected = currentLevelData.numbers.every(dot => 
    completedSequences.has(dot.id)
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Level {currentLevelData.id}</Text>
        {allNumbersConnected && (
          <Text style={styles.completedText}>🎉 Level Completed!</Text>
        )}
      </View>
      
      <GameGrid
        gridSize={currentLevelData.gridSize}
        numbers={numbersWithState}
        onDotPress={handleDotPress}
        currentDrawingPath={currentDrawingPath}
        completedPaths={completedPaths}
        onPanStart={handlePanStart}
        onPanMove={handlePanMove}
        onPanRelease={handlePanRelease}
      />
      
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={handleUndo}>
          <Text style={styles.buttonText}>Undo</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </Pressable>
      </View>
      
      {isDrawing && (
        <Text style={styles.debugText}>
          Drawing from {activeDotId}... Path length: {currentDrawingPath.length}
        </Text>
      )}
      
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  levelText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  completedText: {
    color: colors.primaryHighlight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  button: {
    backgroundColor: colors.gridCell,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gridBorder,
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugText: {
    color: colors.text,
    fontSize: 14,
    marginTop: 10,
    opacity: 0.7,
  },
});