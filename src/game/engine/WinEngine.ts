/**
 * WIN ENGINE - Win Detection and Payout Calculation
 * Handles scatter-pay win detection and paytable lookups
 */

import {
  SymbolId,
  PAYTABLE,
  GRID_CONFIG,
  BONUS_CONFIG,
  WIN_CATEGORIES,
  RISK_CONFIG,
} from "../config/GameConfig";
import { GeneratedSymbol } from "./RNGEngine";

export interface WinningCell {
  row: number;
  col: number;
  symbolId: SymbolId;
}

export interface SymbolWin {
  symbolId: SymbolId;
  count: number;
  multiplier: number;
  winAmount: number; // In bet multipliers
  cells: WinningCell[];
}

export interface WinResult {
  hasWin: boolean;
  totalWinMultiplier: number; // Total win as bet multiplier (before candy multipliers)
  symbolWins: SymbolWin[];
  winningCells: WinningCell[];
  scatterCount: number;
  scatterCells: WinningCell[];
  multiplierCells: { row: number; col: number; value: number }[];
  totalMultiplierSum: number; // Sum of all multiplier candies on grid
}

export interface WinCategory {
  category: "NONE" | "NICE" | "BIG" | "MEGA" | "INSANE";
  label: string;
}

/**
 * Calculate wins from a grid
 */
export function calculateWins(
  grid: GeneratedSymbol[][],
  bet: number
): WinResult {
  const { ROWS, COLS } = GRID_CONFIG;
  
  // Count symbols and track positions
  const symbolCounts: Map<SymbolId, WinningCell[]> = new Map();
  const scatterCells: WinningCell[] = [];
  const multiplierCells: { row: number; col: number; value: number }[] = [];
  
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const symbol = grid[row][col];
      if (!symbol) continue;
      
      if (symbol.id === "SCATTER") {
        scatterCells.push({ row, col, symbolId: "SCATTER" });
      } else if (symbol.id === "MULTIPLIER") {
        multiplierCells.push({
          row,
          col,
          value: symbol.multiplierValue || 2,
        });
      } else {
        const cells = symbolCounts.get(symbol.id) || [];
        cells.push({ row, col, symbolId: symbol.id });
        symbolCounts.set(symbol.id, cells);
      }
    }
  }
  
  // Calculate wins for each symbol with 8+ matches
  const symbolWins: SymbolWin[] = [];
  const allWinningCells: WinningCell[] = [];
  let totalWinMultiplier = 0;
  
  symbolCounts.forEach((cells, symbolId) => {
    if (cells.length >= 8 && symbolId !== "SCATTER" && symbolId !== "MULTIPLIER") {
      const payout = getPayoutMultiplier(symbolId, cells.length);
      
      symbolWins.push({
        symbolId,
        count: cells.length,
        multiplier: payout,
        winAmount: payout,
        cells,
      });
      
      totalWinMultiplier += payout;
      allWinningCells.push(...cells);
    }
  });
  
  // Sum multiplier candies
  const totalMultiplierSum = multiplierCells.length > 0
    ? multiplierCells.reduce((sum, m) => sum + m.value, 0)
    : 0;
  
  return {
    hasWin: symbolWins.length > 0,
    totalWinMultiplier,
    symbolWins,
    winningCells: allWinningCells,
    scatterCount: scatterCells.length,
    scatterCells,
    multiplierCells,
    totalMultiplierSum,
  };
}

/**
 * Get payout multiplier from paytable
 */
export function getPayoutMultiplier(symbolId: SymbolId, count: number): number {
  const payouts = PAYTABLE[symbolId as keyof typeof PAYTABLE];
  if (!payouts) return 0;
  
  if (count >= payouts.highCount.minCount) {
    return payouts.highCount.multiplier;
  } else if (count >= payouts.midCount.minCount) {
    return payouts.midCount.multiplier;
  } else if (count >= payouts.lowCount.minCount) {
    return payouts.lowCount.multiplier;
  }
  
  return 0;
}

/**
 * Calculate final win amount with multipliers
 */
export function calculateFinalWin(
  baseWinMultiplier: number,
  multiplierSum: number,
  bet: number
): number {
  const effectiveMultiplier = multiplierSum > 0 ? multiplierSum : 1;
  const totalMultiplier = baseWinMultiplier * effectiveMultiplier;
  
  // Apply max win cap
  const cappedMultiplier = Math.min(totalMultiplier, RISK_CONFIG.MAX_WIN_PER_SPIN_X);
  
  return cappedMultiplier * bet;
}

/**
 * Determine win category based on size
 */
export function getWinCategory(winMultiplier: number): WinCategory {
  if (winMultiplier >= WIN_CATEGORIES.INSANE.minMultiplier) {
    return { category: "INSANE", label: WIN_CATEGORIES.INSANE.label };
  }
  if (winMultiplier >= WIN_CATEGORIES.MEGA.minMultiplier) {
    return { category: "MEGA", label: WIN_CATEGORIES.MEGA.label };
  }
  if (winMultiplier >= WIN_CATEGORIES.BIG.minMultiplier) {
    return { category: "BIG", label: WIN_CATEGORIES.BIG.label };
  }
  if (winMultiplier >= WIN_CATEGORIES.NICE.minMultiplier) {
    return { category: "NICE", label: WIN_CATEGORIES.NICE.label };
  }
  return { category: "NONE", label: "" };
}

/**
 * Check if scatters trigger free spins
 */
export function checkScatterTrigger(scatterCount: number): {
  triggered: boolean;
  freeSpins: number;
} {
  if (scatterCount >= 6) {
    return { triggered: true, freeSpins: BONUS_CONFIG.SCATTER_TRIGGER[6] };
  }
  if (scatterCount >= 5) {
    return { triggered: true, freeSpins: BONUS_CONFIG.SCATTER_TRIGGER[5] };
  }
  if (scatterCount >= 4) {
    return { triggered: true, freeSpins: BONUS_CONFIG.SCATTER_TRIGGER[4] };
  }
  return { triggered: false, freeSpins: 0 };
}

/**
 * Check for retrigger during bonus
 */
export function checkRetrigger(scatterCount: number): {
  retriggered: boolean;
  additionalSpins: number;
} {
  if (scatterCount >= BONUS_CONFIG.RETRIGGER_SCATTERS) {
    return { retriggered: true, additionalSpins: BONUS_CONFIG.RETRIGGER_SPINS };
  }
  return { retriggered: false, additionalSpins: 0 };
}


