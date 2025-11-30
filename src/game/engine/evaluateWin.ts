/**
 * WIN EVALUATION ENGINE
 * Cluster-based win detection with tumble/cascade logic
 * Sweet Bonanza style: 8+ matching symbols anywhere on grid
 * 
 * This module provides pure functions for win evaluation.
 * No side effects - just takes board state and returns results.
 */

import {
  SymbolId,
  getSymbolData,
  getWinMultiplier,
  generateMultiplierValue,
  isWinningClusterSize,
  MIN_CLUSTER_SIZE,
  LEGACY_TYPE_TO_SYMBOL_ID,
  getSymbolDisplayName,
} from "../config/symbolConfig";

// ============================================
// TYPES
// ============================================

export interface CellPosition {
  row: number;
  col: number;
}

export interface WinningCluster {
  id: number;
  symbolId: SymbolId;
  displayName: string;
  positions: CellPosition[];
  clusterSize: number;
  multiplier: number;       // Paytable multiplier (e.g., 10x for 8 chefs)
  winAmount: number;        // multiplier * bet
  appliedMultiplier: number; // Bomb multiplier (starts at 1)
}

export interface MultiplierOnBoard {
  row: number;
  col: number;
  value: number;
}

export interface ScatterOnBoard {
  row: number;
  col: number;
}

// Board representation: [row][col], null = empty cell
export type Board = (SymbolId | null)[][];

export interface EvaluateWinOptions {
  minClusterSize: number;
  betPerSpin: number;
}

export interface SingleCascadeResult {
  hasWin: boolean;
  clusters: WinningCluster[];
  totalWinMultiplier: number;
  boardAfterRemoval: Board;
  winningPositions: CellPosition[];
}

export interface EvaluateWinResult {
  hasWin: boolean;
  totalWin: number;
  totalWinMultiplier: number;
  winningClusters: WinningCluster[];
  finalBoard: Board;
  scatterCount: number;
  scatterPositions: ScatterOnBoard[];
  multipliers: MultiplierOnBoard[];
  totalMultiplierSum: number;
  cascadeCount: number;
}

// ============================================
// MAIN EVALUATION FUNCTION
// ============================================

/**
 * Full win evaluation with tumble loop
 * Keeps cascading until no more wins
 */
export function evaluateWinWithTumble(
  board: Board,
  options: EvaluateWinOptions
): EvaluateWinResult {
  let workingBoard = cloneBoard(board);
  const allClusters: WinningCluster[] = [];
  let totalWin = 0;
  let totalWinMultiplier = 0;
  let clusterId = 0;
  let cascadeCount = 0;

  // Find special symbols (scatters, multipliers) - they persist through cascades
  const { scatterCount, scatterPositions, multipliers } = findSpecialSymbols(workingBoard);
  const totalMultiplierSum = multipliers.reduce((sum, m) => sum + m.value, 0);

  // Cascade loop
  while (true) {
    const result = evaluateSingleCascade(workingBoard, options, clusterId);

    if (!result.hasWin) {
      break;
    }

    clusterId += result.clusters.length;
    cascadeCount++;

    // Apply gravity to get new board state
    workingBoard = applyGravity(result.boardAfterRemoval);

    // Accumulate wins
    const cascadeWin = result.clusters.reduce((sum, c) => sum + c.winAmount, 0);
    totalWin += cascadeWin;
    totalWinMultiplier += result.totalWinMultiplier;
    allClusters.push(...result.clusters);
  }

  return {
    hasWin: allClusters.length > 0,
    totalWin,
    totalWinMultiplier,
    winningClusters: allClusters,
    finalBoard: workingBoard,
    scatterCount,
    scatterPositions,
    multipliers,
    totalMultiplierSum,
    cascadeCount,
  };
}

/**
 * Evaluate a single cascade (no tumble loop)
 * Useful for step-by-step animation
 */
export function evaluateSingleCascade(
  board: Board,
  options: EvaluateWinOptions,
  startClusterId: number = 0
): SingleCascadeResult {
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;

  // Count symbols by type (excluding special symbols)
  const symbolPositions = new Map<SymbolId, CellPosition[]>();

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const symbolId = board[r][c];
      if (!symbolId) continue;

      const config = getSymbolData(symbolId);

      // Skip bonus and multiplier symbols for cluster counting
      if (config.type === "bonus" || config.type === "multiplier") {
        continue;
      }

      // Skip wilds as cluster starters (they join other clusters)
      if (config.isWild) {
        continue;
      }

      const positions = symbolPositions.get(symbolId) || [];
      positions.push({ row: r, col: c });
      symbolPositions.set(symbolId, positions);
    }
  }

  // Find winning clusters (8+ of same symbol)
  const clusters: WinningCluster[] = [];
  const boardAfter = cloneBoard(board);
  const allWinningPositions: CellPosition[] = [];
  let nextId = startClusterId;
  let totalWinMultiplier = 0;

  symbolPositions.forEach((positions, symbolId) => {
    if (positions.length >= options.minClusterSize) {
      const multiplier = getWinMultiplier(symbolId, positions.length);
      const winAmount = multiplier * options.betPerSpin;

      clusters.push({
        id: nextId++,
        symbolId,
        displayName: getSymbolDisplayName(symbolId),
        positions: [...positions],
        clusterSize: positions.length,
        multiplier,
        winAmount,
        appliedMultiplier: 1,
      });

      totalWinMultiplier += multiplier;

      // Mark positions for removal
      for (const pos of positions) {
        boardAfter[pos.row][pos.col] = null;
        allWinningPositions.push(pos);
      }
    }
  });

  return {
    hasWin: clusters.length > 0,
    clusters,
    totalWinMultiplier,
    boardAfterRemoval: boardAfter,
    winningPositions: allWinningPositions,
  };
}

/**
 * Quick win check without full evaluation
 */
export function hasAnyWin(board: Board, minClusterSize: number = MIN_CLUSTER_SIZE): boolean {
  const symbolCounts = new Map<SymbolId, number>();

  for (const row of board) {
    for (const cell of row) {
      if (!cell) continue;
      const config = getSymbolData(cell);
      if (config.type === "regular") {
        symbolCounts.set(cell, (symbolCounts.get(cell) || 0) + 1);
      }
    }
  }

  for (const count of symbolCounts.values()) {
    if (count >= minClusterSize) return true;
  }

  return false;
}

// ============================================
// SPECIAL SYMBOLS
// ============================================

function findSpecialSymbols(board: Board): {
  scatterCount: number;
  scatterPositions: ScatterOnBoard[];
  multipliers: MultiplierOnBoard[];
} {
  const scatterPositions: ScatterOnBoard[] = [];
  const multipliers: MultiplierOnBoard[] = [];

  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const symbolId = board[r][c];
      if (!symbolId) continue;

      const config = getSymbolData(symbolId);

      if (config.isBonus) {
        scatterPositions.push({ row: r, col: c });
      }

      if (config.type === "multiplier") {
        multipliers.push({
          row: r,
          col: c,
          value: generateMultiplierValue(),
        });
      }
    }
  }

  return {
    scatterCount: scatterPositions.length,
    scatterPositions,
    multipliers,
  };
}

// ============================================
// GRAVITY / TUMBLE
// ============================================

/**
 * Apply gravity: symbols fall down to fill empty spaces
 * Returns new board with gaps at top (null cells)
 */
export function applyGravity(board: Board): Board {
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;
  const result = cloneBoard(board);

  for (let c = 0; c < numCols; c++) {
    let writeRow = numRows - 1;

    // Scan from bottom to top
    for (let r = numRows - 1; r >= 0; r--) {
      if (result[r][c] !== null) {
        result[writeRow][c] = result[r][c];
        if (writeRow !== r) {
          result[r][c] = null;
        }
        writeRow--;
      }
    }

    // Fill remaining top cells with null
    for (let r = writeRow; r >= 0; r--) {
      result[r][c] = null;
    }
  }

  return result;
}

/**
 * Count empty cells per column (for animation)
 */
export function countEmptyCellsPerColumn(board: Board): number[] {
  const numCols = board[0]?.length ?? 0;
  const counts: number[] = [];

  for (let c = 0; c < numCols; c++) {
    let count = 0;
    for (const row of board) {
      if (row[c] === null) count++;
    }
    counts.push(count);
  }

  return counts;
}

// ============================================
// BOARD UTILITIES
// ============================================

function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

/**
 * Fill empty cells with new symbols
 */
export function fillEmptyCells(
  board: Board,
  getNewSymbol: () => SymbolId
): {
  filledBoard: Board;
  newSymbolPositions: CellPosition[];
} {
  const result = cloneBoard(board);
  const newPositions: CellPosition[] = [];

  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (result[r][c] === null) {
        result[r][c] = getNewSymbol();
        newPositions.push({ row: r, col: c });
      }
    }
  }

  return {
    filledBoard: result,
    newSymbolPositions: newPositions,
  };
}

/**
 * Convert legacy grid format to Board
 */
export function convertLegacyGridToBoard(
  legacyGrid: { symbol: { type: string } | null }[][]
): Board {
  return legacyGrid.map(row =>
    row.map(cell => {
      if (!cell.symbol) return null;
      return LEGACY_TYPE_TO_SYMBOL_ID[cell.symbol.type] || null;
    })
  );
}

/**
 * Create empty board
 */
export function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );
}

// ============================================
// SCATTER / FREE SPINS TRIGGERS
// ============================================

export interface ScatterTriggerResult {
  triggered: boolean;
  freeSpins: number;
}

export function checkScatterTrigger(scatterCount: number): ScatterTriggerResult {
  if (scatterCount >= 6) return { triggered: true, freeSpins: 20 };
  if (scatterCount >= 5) return { triggered: true, freeSpins: 15 };
  if (scatterCount >= 4) return { triggered: true, freeSpins: 10 };
  return { triggered: false, freeSpins: 0 };
}

export interface RetriggerResult {
  retriggered: boolean;
  additionalSpins: number;
}

export function checkRetrigger(scatterCount: number): RetriggerResult {
  if (scatterCount >= 3) {
    return { retriggered: true, additionalSpins: 5 };
  }
  return { retriggered: false, additionalSpins: 0 };
}

// ============================================
// WIN CATEGORIES
// ============================================

export type WinCategory = "none" | "nice" | "big" | "mega" | "insane";

export interface WinCategoryResult {
  category: WinCategory;
  label: string;
}

export function getWinCategory(winMultiplier: number): WinCategoryResult {
  if (winMultiplier >= 100) return { category: "insane", label: "INSANE WIN!" };
  if (winMultiplier >= 50) return { category: "mega", label: "MEGA WIN!" };
  if (winMultiplier >= 10) return { category: "big", label: "BIG WIN!" };
  if (winMultiplier >= 1) return { category: "nice", label: "NICE WIN!" };
  return { category: "none", label: "" };
}

// ============================================
// DEBUG HELPERS
// ============================================

export function debugPrintBoard(board: Board): void {
  console.log("=== BOARD STATE ===");
  board.forEach((row, r) => {
    const rowStr = row.map(cell => {
      if (!cell) return "___";
      return cell.substring(0, 3).toUpperCase();
    }).join(" | ");
    console.log(`Row ${r}: ${rowStr}`);
  });
  console.log("==================");
}

export function debugPrintWinResult(result: EvaluateWinResult): void {
  console.log("=== WIN RESULT ===");
  console.log(`Has Win: ${result.hasWin}`);
  console.log(`Total Win: ${result.totalWin}`);
  console.log(`Total Multiplier: ${result.totalWinMultiplier}x`);
  console.log(`Cascades: ${result.cascadeCount}`);
  console.log(`Scatters: ${result.scatterCount}`);
  console.log(`Multiplier Sum: ${result.totalMultiplierSum}x`);
  console.log("Clusters:");
  result.winningClusters.forEach(c => {
    console.log(`  - ${c.displayName}: ${c.clusterSize} symbols = ${c.multiplier}x (${c.winAmount})`);
  });
  console.log("==================");
}
