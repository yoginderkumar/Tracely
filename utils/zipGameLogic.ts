// utils/zipGameLogic.ts - Improved version with better grid selection and revisiting
import { GameGrid, GridCell, Level, NumberCell, PathPoint, ValidationResult } from '@/types';

export class ZipGameEngine {
  private grid: GameGrid;
  private currentPath: PathPoint[] = [];
  private currentNumber: number = 1;

  constructor(level: Level) {
    this.grid = this.initializeGrid(level);
  }

  private initializeGrid(level: Level): GameGrid {
    const cells: GridCell[][] = [];
    
    // Initialize empty grid
    for (let y = 0; y < level.height; y++) {
      cells[y] = [];
      for (let x = 0; x < level.width; x++) {
        cells[y][x] = {
          x,
          y,
          type: 'empty',
          isVisited: false,
          isInPath: false,
        };
      }
    }

    // Place numbers
    const numbers: NumberCell[] = [];
    level.numbers.forEach(num => {
      if (cells[num.y] && cells[num.y][num.x]) {
        cells[num.y][num.x].type = 'number';
        cells[num.y][num.x].number = num.number;
        numbers.push({
          x: num.x,
          y: num.y,
          number: num.number,
          isVisited: false,
        });
      }
    });

    // Place walls
    const walls: { x: number; y: number }[] = [];
    level.walls?.forEach(wall => {
      if (cells[wall.y] && cells[wall.y][wall.x]) {
        cells[wall.y][wall.x].type = 'wall';
        walls.push({ x: wall.x, y: wall.y });
      }
    });

    return {
      width: level.width,
      height: level.height,
      cells,
      numbers: numbers.sort((a, b) => a.number - b.number),
      walls,
    };
  }

  public getGrid(): GameGrid {
    return this.grid;
  }

  public getCurrentPath(): PathPoint[] {
    return this.currentPath;
  }

  public getCurrentNumber(): number {
    return this.currentNumber;
  }

  public startPath(x: number, y: number): boolean {
    // Can only start at number 1
    const cell = this.grid.cells[y]?.[x];
    if (!cell || cell.type !== 'number' || cell.number !== 1) {
      return false;
    }

    this.currentPath = [{ x, y, pathOrder: 1 }];
    this.updateCellPath(x, y, 1);
    this.currentNumber = 2;
    console.log('Started path at number 1:', { x, y });
    return true;
  }

  // NEW: Method to handle clicking on any grid cell (including already selected ones)
  public handleCellClick(x: number, y: number): ValidationResult {
    const cell = this.grid.cells[y]?.[x];
    if (!cell) {
      return { isValid: false, reason: 'Out of bounds' };
    }

    // If no path exists, try to start
    if (this.currentPath.length === 0) {
      if (this.startPath(x, y)) {
        return { isValid: true, reason: 'Started new path' };
      } else {
        return { isValid: false, reason: 'Must start at number 1' };
      }
    }

    // Check if user clicked on an already selected cell to revisit/truncate path
    const existingIndex = this.currentPath.findIndex(point => point.x === x && point.y === y);
    if (existingIndex !== -1) {
      return this.truncatePathTo(existingIndex);
    }

    // Otherwise, try to add to path
    return this.addToPath(x, y);
  }

  // NEW: Method to truncate path to a specific point (for revisiting)
  private truncatePathTo(index: number): ValidationResult {
    if (index < 0 || index >= this.currentPath.length) {
      return { isValid: false, reason: 'Invalid path index' };
    }

    // If clicking on the last point, no change needed
    if (index === this.currentPath.length - 1) {
      return { isValid: true, reason: 'Already at this position' };
    }

    // Remove all points after the clicked point
    const pointsToRemove = this.currentPath.slice(index + 1);
    this.currentPath = this.currentPath.slice(0, index + 1);

    // Clear the removed points from the grid
    pointsToRemove.forEach(point => {
      const cell = this.grid.cells[point.y][point.x];
      cell.isInPath = false;
      cell.pathOrder = undefined;
      
      // If it's a number cell, mark as unvisited
      if (cell.type === 'number') {
        const numberCell = this.grid.numbers.find(n => n.x === point.x && n.y === point.y);
        if (numberCell) {
          numberCell.isVisited = false;
        }
        // Update current number to the last visited number + 1
        this.currentNumber = cell.number! + 1;
      }
    });

    // Recalculate current number based on the last number in path
    this.recalculateCurrentNumber();

    console.log(`Truncated path to point (${this.currentPath[index].x}, ${this.currentPath[index].y})`);
    return { isValid: true, reason: 'Path truncated' };
  }

  // NEW: Recalculate current number based on visited numbers
  private recalculateCurrentNumber(): void {
    let highestVisitedNumber = 0;
    this.currentPath.forEach(point => {
      const cell = this.grid.cells[point.y][point.x];
      if (cell.type === 'number' && cell.number !== undefined) {
        highestVisitedNumber = Math.max(highestVisitedNumber, cell.number);
      }
    });
    this.currentNumber = highestVisitedNumber + 1;
  }

  public addToPath(x: number, y: number): ValidationResult {
    if (this.currentPath.length === 0) {
      return { isValid: false, reason: 'Must start at number 1' };
    }

    const cell = this.grid.cells[y]?.[x];
    if (!cell) {
      return { isValid: false, reason: 'Out of bounds' };
    }

    // Can't move to walls
    if (cell.type === 'wall') {
      return { isValid: false, reason: 'Cannot move through walls' };
    }

    // Check if cell is already in path (should be handled by handleCellClick)
    if (cell.isInPath) {
      return { isValid: false, reason: 'Cell already in path' };
    }

    // NEW: Check adjacency - cells must be adjacent to the last cell in path
    const lastPoint = this.currentPath[this.currentPath.length - 1];
    if (!this.isAdjacent(lastPoint.x, lastPoint.y, x, y)) {
      return { isValid: false, reason: 'Must select adjacent cells' };
    }

    // If this is a numbered cell, check special rules
    if (cell.type === 'number') {
      if (cell.number !== this.currentNumber) {
        return { 
          isValid: false, 
          reason: `Must visit number ${this.currentNumber} next, not ${cell.number}` 
        };
      }

      // CRITICAL RULE: If this is the final number, ALL other cells must be filled first
      const maxNumber = Math.max(...this.grid.numbers.map(n => n.number));
      if (cell.number === maxNumber) {
        const unfilledCells = this.getAllCells().filter(c => 
          c.type !== 'wall' && 
          c.type !== 'number' && 
          !c.isInPath
        );
        
        if (unfilledCells.length > 0) {
          return {
            isValid: false,
            reason: `Must fill all ${unfilledCells.length} remaining cells before connecting to final number ${cell.number}`,
            blockedCells: unfilledCells.map(c => ({ x: c.x, y: c.y }))
          };
        }
      }

      this.currentNumber++;
    }

    // Add to path
    const pathOrder = this.currentPath.length + 1;
    this.currentPath.push({ x, y, pathOrder });
    this.updateCellPath(x, y, pathOrder);

    console.log(`Added to path: (${x}, ${y}) - order: ${pathOrder}`);
    return { isValid: true };
  }

  // NEW: Get all selectable cells (non-wall cells)
  public getSelectableCells(): GridCell[] {
    return this.getAllCells().filter(cell => cell.type !== 'wall');
  }

  // NEW: Check if a cell can be selected next
  public canSelectCell(x: number, y: number): boolean {
    const cell = this.grid.cells[y]?.[x];
    if (!cell || cell.type === 'wall') {
      return false;
    }

    // If no path, can only select number 1
    if (this.currentPath.length === 0) {
      return cell.type === 'number' && cell.number === 1;
    }

    // Can always click on already selected cells (for revisiting)
    if (cell.isInPath) {
      return true;
    }

    // Must be adjacent to last cell
    const lastPoint = this.currentPath[this.currentPath.length - 1];
    if (!this.isAdjacent(lastPoint.x, lastPoint.y, x, y)) {
      return false;
    }

    // If it's a number, must be the next expected number
    if (cell.type === 'number') {
      return cell.number === this.currentNumber;
    }

    // Empty cells are always selectable if adjacent
    return true;
  }

  public canCompleteFromCurrentPosition(): boolean {
    // Check if we can reach all remaining numbers and fill all cells
    const unvisitedNumbers = this.grid.numbers.filter(num => !num.isVisited);
    const unvisitedCells = this.getAllUnvisitedCells();
    
    if (unvisitedNumbers.length === 0 && unvisitedCells.length === 0) {
      return true; // Already complete
    }

    // Use flood fill to check reachability
    return this.canReachAllTargets(unvisitedNumbers, unvisitedCells);
  }

  public isComplete(): boolean {
    // Must visit all numbers in sequence AND fill all non-wall cells
    const allNumbersVisited = this.grid.numbers.every(num => num.isVisited);
    const allNonWallCellsFilled = this.getAllCells()
      .filter(cell => cell.type !== 'wall')
      .every(cell => cell.isInPath);

    const maxNumber = Math.max(...this.grid.numbers.map(n => n.number));
    const finalNumberVisited = this.currentNumber > maxNumber;

    return allNumbersVisited && allNonWallCellsFilled && finalNumberVisited;
  }

  public undoLastMove(): boolean {
    if (this.currentPath.length <= 1) {
      return false; // Can't undo if we're at start or empty
    }

    const lastPoint = this.currentPath.pop()!;
    const cell = this.grid.cells[lastPoint.y][lastPoint.x];
    
    // If we're undoing a numbered cell, adjust current number
    if (cell.type === 'number') {
      this.currentNumber = cell.number!;
    }

    // Clear cell path data
    cell.isInPath = false;
    cell.pathOrder = undefined;
    
    if (cell.type === 'number') {
      const numberCell = this.grid.numbers.find(n => n.x === lastPoint.x && n.y === lastPoint.y);
      if (numberCell) {
        numberCell.isVisited = false;
      }
    }

    console.log(`Undid move to (${lastPoint.x}, ${lastPoint.y})`);
    return true;
  }

  public reset(): void {
    this.currentPath = [];
    this.currentNumber = 1;
    
    // Reset all cells
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const cell = this.grid.cells[y][x];
        cell.isInPath = false;
        cell.isVisited = false;
        cell.pathOrder = undefined;
      }
    }

    // Reset number cells
    this.grid.numbers.forEach(num => {
      num.isVisited = false;
    });

    console.log('Game reset');
  }

  public getHint(): { x: number; y: number } | null {
    if (this.currentPath.length === 0) {
      // Hint: start at number 1
      const numberOne = this.grid.numbers.find(n => n.number === 1);
      return numberOne ? { x: numberOne.x, y: numberOne.y } : null;
    }

    // Check if we're near the final number but haven't filled all cells
    const maxNumber = Math.max(...this.grid.numbers.map(n => n.number));
    const finalNumberCell = this.grid.numbers.find(n => n.number === maxNumber);
    const unfilledCells = this.getAllCells().filter(c => 
      c.type !== 'wall' && 
      c.type !== 'number' && 
      !c.isInPath
    );

    if (finalNumberCell && this.currentNumber === maxNumber && unfilledCells.length > 0) {
      // If we're trying to reach the final number but have unfilled cells,
      // suggest moving to any unfilled cell that's adjacent
      const lastPoint = this.currentPath[this.currentPath.length - 1];
      const adjacentUnfilled = unfilledCells.filter(cell => 
        this.isAdjacent(lastPoint.x, lastPoint.y, cell.x, cell.y)
      );
      if (adjacentUnfilled.length > 0) {
        return { x: adjacentUnfilled[0].x, y: adjacentUnfilled[0].y };
      }
    }

    // Prioritize the next number if we've filled required cells
    const nextNumberCell = this.grid.numbers.find(n => n.number === this.currentNumber);
    if (nextNumberCell) {
      // Only suggest the final number if all other cells are filled
      if (nextNumberCell.number === maxNumber) {
        if (unfilledCells.length === 0) {
          return { x: nextNumberCell.x, y: nextNumberCell.y };
        }
      } else {
        // Check if the next number is reachable
        const lastPoint = this.currentPath[this.currentPath.length - 1];
        if (this.isAdjacent(lastPoint.x, lastPoint.y, nextNumberCell.x, nextNumberCell.y)) {
          return { x: nextNumberCell.x, y: nextNumberCell.y };
        }
      }
    }

    // Otherwise suggest any adjacent unfilled empty cell
    const lastPoint = this.currentPath[this.currentPath.length - 1];
    const adjacentCells = this.getAdjacentCells(lastPoint.x, lastPoint.y);
    const selectableAdjacent = adjacentCells.filter(cell => 
      cell.type !== 'wall' && !cell.isInPath
    );
    
    if (selectableAdjacent.length > 0) {
      return { x: selectableAdjacent[0].x, y: selectableAdjacent[0].y };
    }

    return null;
  }

  private updateCellPath(x: number, y: number, pathOrder: number): void {
    const cell = this.grid.cells[y][x];
    cell.isInPath = true;
    cell.isVisited = true;
    cell.pathOrder = pathOrder;

    if (cell.type === 'number') {
      const numberCell = this.grid.numbers.find(n => n.x === x && n.y === y);
      if (numberCell) {
        numberCell.isVisited = true;
      }
    }
  }

  private isAdjacent(x1: number, y1: number, x2: number, y2: number): boolean {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return dx <= 1 && dy <= 1 && (dx + dy > 0); // Adjacent includes diagonal, but not same cell
  }

  private getAdjacentCells(x: number, y: number): GridCell[] {
    const adjacent: GridCell[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue; // Skip current cell
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.grid.width && ny >= 0 && ny < this.grid.height) {
          adjacent.push(this.grid.cells[ny][nx]);
        }
      }
    }
    return adjacent;
  }

  private getAllCells(): GridCell[] {
    const cells: GridCell[] = [];
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        cells.push(this.grid.cells[y][x]);
      }
    }
    return cells;
  }

  private getAllUnvisitedCells(): GridCell[] {
    return this.getAllCells().filter(cell => 
      cell.type !== 'wall' && !cell.isInPath
    );
  }

  private canReachAllTargets(numbers: NumberCell[], cells: GridCell[]): boolean {
    // For adjacency-based movement, we need proper pathfinding
    const lastPoint = this.currentPath[this.currentPath.length - 1];
    
    // Check if we can reach all unvisited numbers in sequence
    for (const numberCell of numbers.sort((a, b) => a.number - b.number)) {
      if (!this.canReach(lastPoint.x, lastPoint.y, numberCell.x, numberCell.y)) {
        return false;
      }
    }
    
    return true;
  }

  private canReach(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // Simple BFS pathfinding for adjacent movement
    const queue: { x: number; y: number }[] = [{ x: fromX, y: fromY }];
    const visited = new Set<string>();
    visited.add(`${fromX},${fromY}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.x === toX && current.y === toY) {
        return true;
      }

      const adjacent = this.getAdjacentCells(current.x, current.y);
      for (const cell of adjacent) {
        const key = `${cell.x},${cell.y}`;
        if (!visited.has(key) && cell.type !== 'wall' && !cell.isInPath) {
          visited.add(key);
          queue.push({ x: cell.x, y: cell.y });
        }
      }
    }

    return false;
  }
}