/**
 * RNG ENGINE - Random Number Generation for Symbol Distribution
 * Handles weighted random symbol selection based on game mode
 */

import { 
  SymbolId, 
  SYMBOL_WEIGHTS, 
  BONUS_CONFIG,
  GRID_CONFIG,
  VOLATILITY_PROFILES,
  VolatilityProfile,
  DEFAULT_VOLATILITY,
} from "../config/GameConfig";

export interface GeneratedSymbol {
  id: SymbolId;
  multiplierValue?: number; // Only for MULTIPLIER symbols
}

/**
 * Weighted random selection from an array of items with weights
 */
function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1]; // Fallback
}

/**
 * Generate a random symbol based on current game mode
 */
export function generateRandomSymbol(
  isBonus: boolean = false,
  volatility: VolatilityProfile = DEFAULT_VOLATILITY
): GeneratedSymbol {
  const weights = isBonus ? SYMBOL_WEIGHTS.bonus : SYMBOL_WEIGHTS.base;
  const profile = VOLATILITY_PROFILES[volatility];
  
  // Build arrays for weighted selection
  const symbolIds: SymbolId[] = [];
  const symbolWeights: number[] = [];
  
  for (const [id, weight] of Object.entries(weights)) {
    if (weight > 0) {
      symbolIds.push(id as SymbolId);
      symbolWeights.push(weight);
    }
  }
  
  const selectedId = weightedRandom(symbolIds, symbolWeights);
  
  // If it's a multiplier, generate the multiplier value
  if (selectedId === "MULTIPLIER") {
    const multiplierValue = weightedRandom(
      BONUS_CONFIG.MULTIPLIER_VALUES,
      BONUS_CONFIG.MULTIPLIER_WEIGHTS
    );
    return { id: selectedId, multiplierValue };
  }
  
  return { id: selectedId };
}

/**
 * Generate a random multiplier value for multiplier symbols
 */
export function generateMultiplierValue(): number {
  return weightedRandom(
    BONUS_CONFIG.MULTIPLIER_VALUES,
    BONUS_CONFIG.MULTIPLIER_WEIGHTS
  );
}

/**
 * Determine if this spin should produce a win
 * Based on volatility profile hit frequency
 */
export function shouldSpinWin(
  isBonus: boolean = false,
  volatility: VolatilityProfile = DEFAULT_VOLATILITY
): boolean {
  const profile = VOLATILITY_PROFILES[volatility];
  // Bonus has higher hit frequency
  const hitChance = isBonus ? profile.hitFrequency * 1.5 : profile.hitFrequency;
  return Math.random() < hitChance;
}

/**
 * Determine how many scatters should appear (for controlled bonus frequency)
 */
export function generateScatterCount(
  volatility: VolatilityProfile = DEFAULT_VOLATILITY
): number {
  const profile = VOLATILITY_PROFILES[volatility];
  const roll = Math.random();
  
  // Very rare: 6 scatters
  if (roll < profile.bonusFrequency * 0.1) return 6;
  // Rare: 5 scatters
  if (roll < profile.bonusFrequency * 0.3) return 5;
  // Normal bonus trigger: 4 scatters
  if (roll < profile.bonusFrequency) return 4;
  // Near miss: 3 scatters (no trigger)
  if (roll < profile.bonusFrequency * 3) return 3;
  // Common: 0-2 scatters
  if (roll < 0.15) return 2;
  if (roll < 0.35) return 1;
  return 0;
}

/**
 * Generate a complete grid of symbols
 */
export function generateGrid(
  isBonus: boolean = false,
  volatility: VolatilityProfile = DEFAULT_VOLATILITY,
  forceWin: boolean | null = null // null = use RNG, true/false = force
): GeneratedSymbol[][] {
  const { ROWS, COLS } = GRID_CONFIG;
  const grid: GeneratedSymbol[][] = [];
  
  const shouldWin = forceWin !== null ? forceWin : shouldSpinWin(isBonus, volatility);
  
  if (shouldWin) {
    return generateWinningGrid(isBonus, volatility);
  } else {
    return generateNonWinningGrid(isBonus, volatility);
  }
}

/**
 * Generate a grid guaranteed to have at least one winning combination (8+ of same)
 */
function generateWinningGrid(
  isBonus: boolean,
  volatility: VolatilityProfile
): GeneratedSymbol[][] {
  const { ROWS, COLS, TOTAL_CELLS } = GRID_CONFIG;
  const grid: (GeneratedSymbol | null)[][] = [];
  
  // Initialize empty grid
  for (let r = 0; r < ROWS; r++) {
    grid.push(new Array(COLS).fill(null));
  }
  
  // Pick 1-2 winning symbol types (weighted towards lower value)
  const winningSymbolWeights: SymbolId[] = [
    "ROLLING", "ROLLING", "ROLLING", "ROLLING", "ROLLING",
    "SPATULA", "SPATULA", "SPATULA", "SPATULA",
    "MUFFIN", "MUFFIN", "MUFFIN",
    "COOKIE", "COOKIE",
    "SMOOTHIE", "SMOOTHIE",
    "PIZZA",
    "BROWNIE",
    "CHEF",
  ];
  
  const numWinningTypes = Math.random() < 0.7 ? 1 : 2;
  const winningSymbols: SymbolId[] = [];
  
  for (let i = 0; i < numWinningTypes; i++) {
    let sym = winningSymbolWeights[Math.floor(Math.random() * winningSymbolWeights.length)];
    while (winningSymbols.includes(sym)) {
      sym = winningSymbolWeights[Math.floor(Math.random() * winningSymbolWeights.length)];
    }
    winningSymbols.push(sym);
  }
  
  // Determine count for each winning symbol (8-12)
  const winCounts: Map<SymbolId, number> = new Map();
  winningSymbols.forEach(sym => {
    const baseCount = sym === "CHEF" ? 8 : sym === "BROWNIE" || sym === "PIZZA" ? 9 : 10;
    winCounts.set(sym, baseCount + Math.floor(Math.random() * 4));
  });
  
  // Shuffle all positions
  const positions: { row: number; col: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      positions.push({ row: r, col: c });
    }
  }
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Place winning symbols
  let posIndex = 0;
  winCounts.forEach((count, sym) => {
    for (let i = 0; i < count && posIndex < positions.length; i++) {
      const pos = positions[posIndex++];
      grid[pos.row][pos.col] = { id: sym };
    }
  });
  
  // Track symbol counts to avoid accidental additional wins
  const symbolCounts: Map<SymbolId, number> = new Map();
  winCounts.forEach((count, sym) => symbolCounts.set(sym, count));
  
  // Fill remaining positions
  while (posIndex < positions.length) {
    const pos = positions[posIndex++];
    let sym = generateRandomSymbol(isBonus, volatility);
    
    // Ensure we don't create another 8+ match
    let attempts = 0;
    while ((symbolCounts.get(sym.id) || 0) >= 7 && attempts < 20) {
      sym = generateRandomSymbol(isBonus, volatility);
      attempts++;
    }
    
    symbolCounts.set(sym.id, (symbolCounts.get(sym.id) || 0) + 1);
    grid[pos.row][pos.col] = sym;
  }
  
  return grid as GeneratedSymbol[][];
}

/**
 * Generate a grid guaranteed to have NO winning combinations
 */
function generateNonWinningGrid(
  isBonus: boolean,
  volatility: VolatilityProfile
): GeneratedSymbol[][] {
  const { ROWS, COLS } = GRID_CONFIG;
  const grid: GeneratedSymbol[][] = [];
  const symbolCounts: Map<SymbolId, number> = new Map();
  
  for (let r = 0; r < ROWS; r++) {
    const row: GeneratedSymbol[] = [];
    for (let c = 0; c < COLS; c++) {
      let sym = generateRandomSymbol(isBonus, volatility);
      
      // Ensure no symbol reaches 8
      let attempts = 0;
      while ((symbolCounts.get(sym.id) || 0) >= 7 && attempts < 20) {
        sym = generateRandomSymbol(isBonus, volatility);
        attempts++;
      }
      
      symbolCounts.set(sym.id, (symbolCounts.get(sym.id) || 0) + 1);
      row.push(sym);
    }
    grid.push(row);
  }
  
  return grid;
}

