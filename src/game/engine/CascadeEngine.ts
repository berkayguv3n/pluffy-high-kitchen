/**
 * CASCADE ENGINE - Tumble/Cascade Mechanics
 * Handles symbol removal, gravity, and new symbol spawning
 */

import { GRID_CONFIG } from "../config/GameConfig";
import { GeneratedSymbol, generateRandomSymbol } from "./RNGEngine";
import { WinningCell } from "./WinEngine";
import { VolatilityProfile, DEFAULT_VOLATILITY } from "../config/GameConfig";

export interface CascadeResult {
  newGrid: GeneratedSymbol[][];
  fallingCells: FallingCell[];
  spawningCells: SpawningCell[];
}

export interface FallingCell {
  row: number;
  col: number;
  fromRow: number;
  fallDistance: number;
  symbol: GeneratedSymbol;
}

export interface SpawningCell {
  row: number;
  col: number;
  spawnIndex: number; // How far above grid it spawns from
  symbol: GeneratedSymbol;
}

/**
 * Apply cascade after winning symbols are removed
 * 1. Remove winning symbols (set to null)
 * 2. Apply gravity (symbols fall down within their column)
 * 3. Spawn new symbols from above
 */
export function applyCascade(
  grid: GeneratedSymbol[][],
  winningCells: WinningCell[],
  isBonus: boolean = false,
  volatility: VolatilityProfile = DEFAULT_VOLATILITY
): CascadeResult {
  const { ROWS, COLS } = GRID_CONFIG;
  
  // Create mutable copy
  const newGrid: (GeneratedSymbol | null)[][] = grid.map(row => [...row]);
  
  // Step 1: Remove winning symbols
  for (const cell of winningCells) {
    newGrid[cell.row][cell.col] = null;
  }
  
  const fallingCells: FallingCell[] = [];
  const spawningCells: SpawningCell[] = [];
  
  // Step 2 & 3: Process each column independently
  for (let col = 0; col < COLS; col++) {
    // Collect non-null symbols in this column (from bottom to top)
    const columnSymbols: { symbol: GeneratedSymbol; originalRow: number }[] = [];
    
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newGrid[row][col] !== null) {
        columnSymbols.push({
          symbol: newGrid[row][col] as GeneratedSymbol,
          originalRow: row,
        });
      }
    }
    
    // Count empty spaces
    const emptyCount = ROWS - columnSymbols.length;
    
    // Clear the column
    for (let row = 0; row < ROWS; row++) {
      newGrid[row][col] = null;
    }
    
    // Place existing symbols at bottom (with fall tracking)
    let targetRow = ROWS - 1;
    for (const { symbol, originalRow } of columnSymbols) {
      newGrid[targetRow][col] = symbol;
      
      const fallDistance = targetRow - originalRow;
      if (fallDistance > 0) {
        fallingCells.push({
          row: targetRow,
          col,
          fromRow: originalRow,
          fallDistance,
          symbol,
        });
      }
      
      targetRow--;
    }
    
    // Spawn new symbols at top
    for (let i = 0; i < emptyCount; i++) {
      const row = emptyCount - 1 - i;
      const symbol = generateRandomSymbol(isBonus, volatility);
      newGrid[row][col] = symbol;
      
      spawningCells.push({
        row,
        col,
        spawnIndex: i + 1, // 1 = closest to grid, higher = further above
        symbol,
      });
    }
  }
  
  return {
    newGrid: newGrid as GeneratedSymbol[][],
    fallingCells,
    spawningCells,
  };
}

/**
 * Check if any cells need to cascade
 */
export function hasCellsToRemove(winningCells: WinningCell[]): boolean {
  return winningCells.length > 0;
}

/**
 * Get positions that will be affected by cascade
 */
export function getAffectedColumns(winningCells: WinningCell[]): number[] {
  const columns = new Set<number>();
  for (const cell of winningCells) {
    columns.add(cell.col);
  }
  return Array.from(columns).sort((a, b) => a - b);
}

