// cell: {
//     position: 'absolute',
//     backgroundColor: 'transparent',
//     zIndex: 1, // Ensure cells are above the grid background
//   },        {/* Interactive cells - tap any cell to add to path */}
//         {grid.cells.flat().map((cell, index) => {
//           if (cell.type === 'wall') return null; // Skip walls
          
//           const screenPos = gridToScreen(cell.x, cell.y);
          
//           return (
//             <Pressable
//               key={`cell-${index}`}
//               style={[
//                 styles.cell,
//                 {
//                   left: cell.x * CELL_SIZE + 2,
//                   top: cell.y * CELL_SIZE + 2,
//                   width: CELL_SIZE - 4,
//                   height: CELL_SIZE - 4,
//                 },
//               ]}
//               onPress={() => handleCellPress(cell.x, cell.y)}
//             />
//           );
//         })} ,// app/index.tsx - Zip Game Implementation
import { getDailyLevel, getLevel, ZipGameEngine } from '@/utils';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const GAME_WIDTH = Math.min(screenWidth - 40, 350);

export default function ZipGameScreen() {
  const [levelId] = useState(1); // Start with level 1 for testing
  const currentLevel = getLevel(levelId) || getDailyLevel();
  
  const [gameEngine] = useState(() => new ZipGameEngine(currentLevel));
  const [, forceUpdate] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragPath, setDragPath] = useState<{ x: number; y: number }[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [blockedCells, setBlockedCells] = useState<{ x: number; y: number }[]>([]);
  
  const gridRef = useRef<View>(null);
  const gridLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const CELL_SIZE = GAME_WIDTH / Math.max(currentLevel.width, currentLevel.height);
  const GRID_WIDTH = currentLevel.width * CELL_SIZE;
  const GRID_HEIGHT = currentLevel.height * CELL_SIZE;

  const refresh = useCallback(() => forceUpdate({}), []);

  const handleLayout = useCallback((event: any) => {
    if (gridRef.current) {
      gridRef.current.measure((fx, fy, width, height, px, py) => {
        gridLayout.current = { x: px, y: py, width, height };
      });
    }
  }, []);

  const screenToGrid = useCallback((screenX: number, screenY: number) => {
    if (!gridLayout.current) return null;
    
    const relativeX = screenX - gridLayout.current.x;
    const relativeY = screenY - gridLayout.current.y;
    
    const gridX = Math.floor(relativeX / CELL_SIZE);
    const gridY = Math.floor(relativeY / CELL_SIZE);
    
    if (gridX >= 0 && gridX < currentLevel.width && gridY >= 0 && gridY < currentLevel.height) {
      return { x: gridX, y: gridY };
    }
    return null;
  }, [CELL_SIZE, currentLevel.width, currentLevel.height]);

  const gridToScreen = useCallback((gridX: number, gridY: number) => {
    return {
      x: gridX * CELL_SIZE + CELL_SIZE / 2,
      y: gridY * CELL_SIZE + CELL_SIZE / 2,
    };
  }, [CELL_SIZE]);

  const handleCellPress = useCallback((x: number, y: number) => {
    const currentPath = gameEngine.getCurrentPath();
    
    // Clear previous error messages
    setErrorMessage('');
    setBlockedCells([]);
    
    if (currentPath.length === 0) {
      // Start new path
      if (gameEngine.startPath(x, y)) {
        setIsDrawing(true);
        console.log('Started path at:', { x, y });
      } else {
        setErrorMessage('Must start at number 1');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } else {
      // Add to existing path
      const result = gameEngine.addToPath(x, y);
      if (result.isValid) {
        console.log('Added to path:', { x, y });
        if (gameEngine.isComplete()) {
          console.log('🎉 Puzzle completed!');
          setIsDrawing(false);
        }
      } else {
        console.log('Invalid move:', result.reason);
        setErrorMessage(result.reason || 'Invalid move');
        setBlockedCells(result.blockedCells || []);
        setTimeout(() => {
          setErrorMessage('');
          setBlockedCells([]);
        }, 3000);
      }
    }
    refresh();
  }, [gameEngine, refresh]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Disable pan gestures - only use taps
      onMoveShouldSetPanResponder: () => false,
    })
  ).current;

  const handleUndo = useCallback(() => {
    if (gameEngine.undoLastMove()) {
      refresh();
    }
  }, [gameEngine, refresh]);

  const handleReset = useCallback(() => {
    gameEngine.reset();
    setIsDrawing(false);
    setDragPath([]);
    setShowHint(false);
    setErrorMessage('');
    setBlockedCells([]);
    refresh();
  }, [gameEngine, refresh]);

  const handleHint = useCallback(() => {
    const hint = gameEngine.getHint();
    if (hint) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2000);
    }
    refresh();
  }, [gameEngine, refresh]);

  const renderPath = () => {
    const currentPath = gameEngine.getCurrentPath();
    if (currentPath.length < 2) return null;

    // Render path as connected line segments between visited cells
    const pathPoints = currentPath.map(p => gridToScreen(p.x, p.y));
    let pathString = `M${pathPoints[0].x} ${pathPoints[0].y}`;
    for (let i = 1; i < pathPoints.length; i++) {
      pathString += ` L${pathPoints[i].x} ${pathPoints[i].y}`;
    }

    return (
      <Path
        d={pathString}
        stroke="#007AFF"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    );
  };

  const grid = gameEngine.getGrid();
  const currentPath = gameEngine.getCurrentPath();
  const currentNumber = gameEngine.getCurrentNumber();
  const isComplete = gameEngine.isComplete();
  const hint = showHint ? gameEngine.getHint() : null;
  const maxNumber = Math.max(...grid.numbers.map(n => n.number));
  const unfilledCells = grid.cells.flat().filter(c => 
    c.type !== 'wall' && 
    c.type !== 'number' && 
    !c.isInPath
  );

  console.log('currentNumber: ', currentNumber)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ZIP</Text>
        <Text style={styles.subtitle}>
          {isComplete 
            ? 'Complete!' 
            : currentNumber > maxNumber 
              ? `Fill ${unfilledCells.length} more cells`
              : `Connect to number ${currentNumber}`
          }
        </Text>
        <Text style={styles.progress}>
          {currentPath.length} / {grid.width * grid.height - grid.walls.length} cells filled
        </Text>
        {errorMessage && (
          <Text style={styles.error}>{errorMessage}</Text>
        )}
        {isComplete && (
          <Text style={styles.victory}>🎉 Puzzle Complete! 🎉</Text>
        )}
      </View>

      <View 
        ref={gridRef}
        onLayout={handleLayout}
        style={[styles.gameContainer, { width: GRID_WIDTH, height: GRID_HEIGHT }]}
        {...panResponder.panHandlers}
      >
        {/* Background grid */}
        <Svg style={StyleSheet.absoluteFillObject}>
          {/* Grid lines */}
          {Array.from({ length: currentLevel.height + 1 }).map((_, i) => (
            <Path
              key={`h-line-${i}`}
              d={`M0 ${i * CELL_SIZE} L${GRID_WIDTH} ${i * CELL_SIZE}`}
              stroke="#444"
              strokeWidth={1}
              opacity={0.3}
            />
          ))}
          {Array.from({ length: currentLevel.width + 1 }).map((_, i) => (
            <Path
              key={`v-line-${i}`}
              d={`M${i * CELL_SIZE} 0 L${i * CELL_SIZE} ${GRID_HEIGHT}`}
              stroke="#444"
              strokeWidth={1}
              opacity={0.3}
            />
          ))}

          {/* Cell backgrounds */}
          {grid.cells.flat().map((cell, index) => {
            const screenPos = gridToScreen(cell.x, cell.y);
            let fillColor = '#2C2C2E'; // Default empty cell
            let opacity = 0.1;
            
            if (cell.type === 'wall') {
              fillColor = '#1C1C1E'; // Wall color
              opacity = 0.8;
            } else if (cell.isInPath) {
              fillColor = '#007AFF'; // Path color
              opacity = 0.3;
            } else if (blockedCells.some(bc => bc.x === cell.x && bc.y === cell.y)) {
              fillColor = '#FF3B30'; // Highlight unfilled cells when error
              opacity = 0.4;
            }

            return (
              <Rect
                key={`cell-bg-${index}`}
                x={cell.x * CELL_SIZE + 1}
                y={cell.y * CELL_SIZE + 1}
                width={CELL_SIZE - 2}
                height={CELL_SIZE - 2}
                fill={fillColor}
                opacity={opacity}
              />
            );
          })}

          {/* Path */}
          {renderPath()}

          {/* Hint highlight */}
          {hint && (
            <Circle
              cx={hint.x * CELL_SIZE + CELL_SIZE / 2}
              cy={hint.y * CELL_SIZE + CELL_SIZE / 2}
              r={CELL_SIZE / 3}
              fill="none"
              stroke="#FFD60A"
              strokeWidth={3}
              opacity={0.8}
            />
          )}
        </Svg>

        {/* Numbers and interactive elements */}
        {grid.numbers.map((numberCell) => {
          const screenPos = gridToScreen(numberCell.x, numberCell.y);
          const isNext = numberCell.number === currentNumber;
          const isVisited = numberCell.isVisited;
          
          return (
            <Pressable
              key={`number-${numberCell.number}`}
              style={[
                styles.numberCell,
                {
                  left: screenPos.x - CELL_SIZE / 3,
                  top: screenPos.y - CELL_SIZE / 3,
                  width: (CELL_SIZE * 2) / 3,
                  height: (CELL_SIZE * 2) / 3,
                  borderRadius: CELL_SIZE / 3,
                },
                isNext && styles.nextNumber,
                isVisited && styles.visitedNumber,
              ]}
              onPress={() => handleCellPress(numberCell.x, numberCell.y)}
            >
              <Text style={[
                styles.numberText,
                { fontSize: CELL_SIZE / 4 },
                isNext && styles.nextNumberText,
                isVisited && styles.visitedNumberText,
              ]}>
                {numberCell.number}
              </Text>
            </Pressable>
          );
        })}

        {/* Walls */}
        {grid.walls.map((wall, index) => {
          const screenPos = gridToScreen(wall.x, wall.y);
          
          return (
            <View
              key={`wall-${index}`}
              style={[
                styles.wall,
                {
                  left: wall.x * CELL_SIZE + 2,
                  top: wall.y * CELL_SIZE + 2,
                  width: CELL_SIZE - 4,
                  height: CELL_SIZE - 4,
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={handleUndo}>
          <Text style={styles.buttonText}>↶ Undo</Text>
        </Pressable>
        
        <Pressable style={styles.button} onPress={handleHint}>
          <Text style={styles.buttonText}>💡 Hint</Text>
        </Pressable>
        
        <Pressable style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>↻ Reset</Text>
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Draw a path from 1→2→3... that fills every cell
        </Text>
        <Text style={styles.infoText}>
          Level {currentLevel.id} • {currentLevel.difficulty.toUpperCase()}
        </Text>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
  progress: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 5,
  },
  victory: {
    color: '#30D158',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  gameContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2C2C2E',
    position: 'relative',
    overflow: 'hidden',
  },
  numberCell: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    elevation: 5,
    zIndex: 2, // Numbers should be above cells
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextNumber: {
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#0056CC',
    transform: [{ scale: 1.1 }],
  },
  visitedNumber: {
    backgroundColor: '#30D158',
    borderWidth: 2,
    borderColor: '#248A3D',
  },
  numberText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  nextNumberText: {
    color: '#FFFFFF',
  },
  visitedNumberText: {
    color: '#FFFFFF',
  },
  wall: {
    backgroundColor: '#8E8E93',
    position: 'absolute',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 15,
  },
  button: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 2,
  },
   error: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  }
});