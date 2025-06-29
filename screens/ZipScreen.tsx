// screens/ZipScreen.tsx - Improved UI with proper grid selection and revisiting
import { getDailyLevel, getLevel, ZipGameEngine } from '@/utils';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Path, Rect, Svg } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const GAME_WIDTH = Math.min(screenWidth - 40, 350);

export default function ZipGameScreen() {
  const [levelId] = useState(1); // Start with level 1 for testing
  const currentLevel = getLevel(levelId) || getDailyLevel();
  
  const [gameEngine] = useState(() => new ZipGameEngine(currentLevel));
  const [, forceUpdate] = useState({});
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [blockedCells, setBlockedCells] = useState<{ x: number; y: number }[]>([]);
  
  const CELL_SIZE = GAME_WIDTH / Math.max(currentLevel.width, currentLevel.height);
  const GRID_WIDTH = currentLevel.width * CELL_SIZE;
  const GRID_HEIGHT = currentLevel.height * CELL_SIZE;

  const refresh = useCallback(() => forceUpdate({}), []);

  const gridToScreen = useCallback((gridX: number, gridY: number) => {
    return {
      x: gridX * CELL_SIZE + CELL_SIZE / 2,
      y: gridY * CELL_SIZE + CELL_SIZE / 2,
    };
  }, [CELL_SIZE]);

  // Improved cell click handler using the new handleCellClick method
  const handleCellClick = useCallback((x: number, y: number) => {
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');
    setBlockedCells([]);
    
    const result = gameEngine.handleCellClick(x, y);
    
    if (result.isValid) {
      if (result.reason) {
        setSuccessMessage(result.reason);
        setTimeout(() => setSuccessMessage(''), 2000);
      }
      
      // Check if puzzle is complete
      if (gameEngine.isComplete()) {
        Alert.alert('🎉 Congratulations!', 'You completed the puzzle!', [
          { text: 'Play Again', onPress: handleReset }
        ]);
      }
    } else {
      setErrorMessage(result.reason || 'Invalid move');
      if (result.blockedCells) {
        setBlockedCells(result.blockedCells);
      }
      setTimeout(() => {
        setErrorMessage('');
        setBlockedCells([]);
      }, 3000);
    }
    
    refresh();
  }, [gameEngine, refresh]);

  const handleUndo = useCallback(() => {
    if (gameEngine.undoLastMove()) {
      setErrorMessage('');
      setSuccessMessage('Move undone');
      setTimeout(() => setSuccessMessage(''), 1500);
      refresh();
    }
  }, [gameEngine, refresh]);

  const handleReset = useCallback(() => {
    gameEngine.reset();
    setErrorMessage('');
    setSuccessMessage('');
    setBlockedCells([]);
    refresh();
  }, [gameEngine, refresh]);

  const handleHint = useCallback(() => {
    const hint = gameEngine.getHint();
    if (hint) {
      setSuccessMessage(`Try clicking cell at (${hint.x + 1}, ${hint.y + 1})`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage('No hints available');
      setTimeout(() => setErrorMessage(''), 2000);
    }
  }, [gameEngine]);

  const renderPath = useCallback(() => {
    const currentPath = gameEngine.getCurrentPath();
    if (currentPath.length < 2) return null;

    let pathString = '';
    for (let i = 0; i < currentPath.length; i++) {
      const point = currentPath[i];
      const screenPos = gridToScreen(point.x, point.y);
      
      if (i === 0) {
        pathString += `M ${screenPos.x} ${screenPos.y}`;
      } else {
        pathString += ` L ${screenPos.x} ${screenPos.y}`;
      }
    }

    return (
      <Path
        d={pathString}
        stroke="#4F46E5"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }, [gameEngine, gridToScreen]);

  const grid = gameEngine.getGrid();
  const currentPath = gameEngine.getCurrentPath();
  const currentNumber = gameEngine.getCurrentNumber();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Zip Game</Text>
        <Text style={styles.subtitle}>Connect numbers 1-{Math.max(...grid.numbers.map(n => n.number))} and fill all cells</Text>
        <Text style={styles.currentNumber}>Next: {currentNumber}</Text>
      </View>

      {/* Messages */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
      
      {successMessage ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      {/* Game Grid */}
      <View style={[styles.gridContainer, { width: GRID_WIDTH, height: GRID_HEIGHT }]}>
        <Svg style={StyleSheet.absoluteFillObject}>
          {/* Grid lines */}
          {Array.from({ length: currentLevel.height + 1 }).map((_, i) => (
            <Path
              key={`h-line-${i}`}
              d={`M 0 ${i * CELL_SIZE} L ${GRID_WIDTH} ${i * CELL_SIZE}`}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: currentLevel.width + 1 }).map((_, i) => (
            <Path
              key={`v-line-${i}`}
              d={`M ${i * CELL_SIZE} 0 L ${i * CELL_SIZE} ${GRID_HEIGHT}`}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}

          {/* Cell backgrounds */}
          {grid.cells.flat().map((cell, index) => {
            let fillColor = '#FFFFFF';
            let opacity = 1;
            
            if (cell.type === 'wall') {
              fillColor = '#374151';
            } else if (cell.isInPath) {
              fillColor = '#DBEAFE';
              opacity = 0.8;
            } else if (gameEngine.canSelectCell(cell.x, cell.y)) {
              fillColor = '#F3F4F6';
              opacity = 0.5;
            }

            // Highlight blocked cells
            if (blockedCells.some(blocked => blocked.x === cell.x && blocked.y === cell.y)) {
              fillColor = '#FEE2E2';
              opacity = 0.8;
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
        </Svg>

        {/* Interactive cells - ALL selectable cells */}
        {grid.cells.flat().map((cell, index) => {
          if (cell.type === 'wall') return null;
          
          const canSelect = gameEngine.canSelectCell(cell.x, cell.y);
          const isInPath = cell.isInPath;
          
          return (
            <Pressable
              key={`cell-${index}`}
              style={[
                styles.cell,
                {
                  left: cell.x * CELL_SIZE + 2,
                  top: cell.y * CELL_SIZE + 2,
                  width: CELL_SIZE - 4,
                  height: CELL_SIZE - 4,
                },
                canSelect && styles.selectableCell,
                isInPath && styles.pathCell,
              ]}
              onPress={() => handleCellClick(cell.x, cell.y)}
              disabled={!canSelect && !isInPath}
            >
              {/* Show path order for debugging */}
              {cell.pathOrder && (
                <Text style={styles.pathOrderText}>{cell.pathOrder}</Text>
              )}
            </Pressable>
          );
        })}

        {/* Number labels */}
        {grid.numbers.map((numberCell) => {
          const screenPos = gridToScreen(numberCell.x, numberCell.y);
          const isNext = numberCell.number === currentNumber;
          const isVisited = numberCell.isVisited;
          
          return (
            <View
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
              pointerEvents="none"
            >
              <Text style={[
                styles.numberText,
                { fontSize: CELL_SIZE / 4 },
                isNext && styles.nextNumberText,
                isVisited && styles.visitedNumberText,
              ]}>
                {numberCell.number}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Control buttons */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handleUndo}>
          <Text style={styles.buttonText}>Undo</Text>
        </Pressable>
        
        <Pressable style={styles.button} onPress={handleHint}>
          <Text style={styles.buttonText}>Hint</Text>
        </Pressable>
        
        <Pressable style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Text style={[styles.buttonText, styles.resetButtonText]}>Reset</Text>
        </Pressable>
      </View>

      {/* Game info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Path length: {currentPath.length} | 
          Remaining cells: {grid.cells.flat().filter(c => c.type !== 'wall' && !c.isInPath).length}
        </Text>
        <Text style={styles.instructionText}>
          • Tap any adjacent cell to extend path{'\n'}
          • Tap any cell in your path to return to that point{'\n'}
          • Visit numbers in order: 1 → 2 → 3 → ...{'\n'}
          • Fill all empty cells before reaching the final number
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    paddingTop: 20,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  
  currentNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
  },
  
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  
  successContainer: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  
  successText: {
    color: '#16A34A',
    fontSize: 14,
    textAlign: 'center',
  },
  
  gridContainer: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  cell: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  selectableCell: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  
  pathCell: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  
  pathOrderText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  numberCell: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  nextNumber: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  
  visitedNumber: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  
  numberText: {
    fontWeight: 'bold',
    color: '#374151',
  },
  
  nextNumberText: {
    color: '#FFFFFF',
  },
  
  visitedNumberText: {
    color: '#FFFFFF',
  },
  
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  resetButton: {
    backgroundColor: '#DC2626',
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  resetButtonText: {
    color: '#FFFFFF',
  },
  
  infoContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  instructionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});