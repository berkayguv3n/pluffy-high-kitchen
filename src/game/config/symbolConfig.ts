/**
 * SYMBOL CONFIGURATION - Central Symbol Brain
 * All symbol definitions, weights, payouts, and helper functions
 * 
 * This is the SINGLE SOURCE OF TRUTH for all symbol-related data.
 * No magic constants for payouts should exist elsewhere in the codebase.
 */

// ============================================
// TYPES
// ============================================

/**
 * All possible symbol IDs in the game
 * Maps to actual asset files in /src/assets/
 */
export type SymbolId =
  | "chef"        // Premium - Pluffy Chef (symbol-chef.png)
  | "brownie"     // High - Brownie Tray (symbol-brownie.png)
  | "pizza"       // High - Pizza Slice (symbol-pizza.png)
  | "smoothie"    // Mid - Smoothie Cup (symbol-smoothie.png)
  | "cookie"      // Mid - Cookie Jar (symbol-cookie.png)
  | "muffin"      // Low - Muffin (symbol-muffin.png)
  | "spatula"     // Low - Spatula (symbol-spatula.png)
  | "rolling"     // Low - Rolling Pin (symbol-rolling.png)
  | "scatter"     // Bonus - Oven (symbol-oven.png)
  | "multiplier"; // Multiplier Bomb (special rendering)

export type SymbolType = "regular" | "wild" | "bonus" | "multiplier";
export type SymbolTier = "premium" | "high" | "mid" | "low" | "special";

/**
 * Payout table: clusterSize => bet multiplier
 * Sweet Bonanza style: 8-9, 10-11, 12+ clusters
 */
export interface PayoutTable {
  [clusterSize: number]: number;
}

export interface SymbolConfigEntry {
  id: SymbolId;
  type: SymbolType;
  tier: SymbolTier;
  displayName: string;
  image: string;
  weight: number;        // Base game RNG weight (higher = more common)
  bonusWeight: number;   // Free spins RNG weight
  isWild: boolean;
  isBonus: boolean;
  payouts: PayoutTable;
}

// ============================================
// SYMBOL DEFINITIONS
// ============================================

export const SYMBOLS: Record<SymbolId, SymbolConfigEntry> = {
  // === PREMIUM ===
  chef: {
    id: "chef",
    type: "regular",
    tier: "premium",
    displayName: "Pluffy Chef",
    image: "/src/assets/symbol-chef.png",
    weight: 5,
    bonusWeight: 5,
    isWild: false,
    isBonus: false,
    payouts: {
      8: 10,    // 8-9 symbols: 10x bet
      10: 25,   // 10-11 symbols: 25x bet
      12: 50,   // 12+ symbols: 50x bet
    },
  },

  // === HIGH TIER ===
  brownie: {
    id: "brownie",
    type: "regular",
    tier: "high",
    displayName: "Brownie",
    image: "/src/assets/symbol-brownie.png",
    weight: 8,
    bonusWeight: 8,
    isWild: false,
    isBonus: false,
    payouts: {
      8: 5,
      10: 10,
      12: 25,
    },
  },

  pizza: {
    id: "pizza",
    type: "regular",
    tier: "high",
    displayName: "Pizza",
    image: "/src/assets/symbol-pizza.png",
    weight: 8,
    bonusWeight: 8,
    isWild: false,
    isBonus: false,
    payouts: {
      8: 3,
      10: 7,
      12: 15,
    },
  },

  // === MID TIER ===
  smoothie: {
    id: "smoothie",
    type: "regular",
    tier: "mid",
    displayName: "Smoothie",
    image: "/src/assets/symbol-smoothie.png",
    weight: 12,
    bonusWeight: 12,
    isWild: false,
    isBonus: false,
    payouts: {
      8: 2,
      10: 5,
      12: 10,
    },
  },

  cookie: {
    id: "cookie",
    type: "regular",
    tier: "mid",
    displayName: "Cookie",
    image: "/src/assets/symbol-cookie.png",
    weight: 12,
    bonusWeight: 12,
    isWild: false,
    isBonus: false,
    payouts: {
      8: 1.5,
      10: 4,
      12: 8,
    },
  },

  // === LOW TIER ===
  muffin: {
    id: "muffin",
    type: "regular",
    tier: "low",
    displayName: "Muffin",
    image: "/src/assets/symbol-muffin.png",
    weight: 17,
    bonusWeight: 15,
    isWild: false,
    isBonus: false,
    payouts: {
      8: 1,
      10: 2,
      12: 5,
    },
  },

  spatula: {
    id: "spatula",
    type: "regular",
    tier: "low",
    displayName: "Spatula",
    image: "/src/assets/symbol-spatula.png",
    weight: 17,
    bonusWeight: 15,
    isWild: false,
    isBonus: false,
    payouts: {
      8: 0.5,
      10: 1.5,
      12: 3,
    },
  },

  rolling: {
    id: "rolling",
    type: "regular",
    tier: "low",
    displayName: "Rolling Pin",
    image: "/src/assets/symbol-rolling.png",
    weight: 17,
    bonusWeight: 15,
    isWild: false,
    isBonus: false,
    payouts: {
      8: 0.25,
      10: 1,
      12: 2,
    },
  },

  // === SPECIAL ===
  scatter: {
    id: "scatter",
    type: "bonus",
    tier: "special",
    displayName: "Bonus Oven",
    image: "/src/assets/symbol-oven.png",
    weight: 2,        // ~2% in base game
    bonusWeight: 1,   // Lower in bonus (retrigger)
    isWild: false,
    isBonus: true,
    payouts: {},      // Scatter doesn't pay directly
  },

  multiplier: {
    id: "multiplier",
    type: "multiplier",
    tier: "special",
    displayName: "Multiplier Bomb",
    image: "/src/assets/symbol-oven.png", // Custom rendering
    weight: 0,        // Never in base game
    bonusWeight: 5,   // ~5% in free spins
    isWild: false,
    isBonus: false,
    payouts: {},
  },
};

// ============================================
// MULTIPLIER BOMB CONFIGURATION
// ============================================

export const MULTIPLIER_VALUES = [2, 3, 5, 8, 10, 15, 25, 50, 100];
export const MULTIPLIER_WEIGHTS = [35, 25, 18, 10, 6, 3, 2, 0.8, 0.2];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get symbol configuration by ID
 * @throws Error if symbol ID is unknown
 */
export function getSymbolData(id: SymbolId): SymbolConfigEntry {
  const entry = SYMBOLS[id];
  if (!entry) {
    throw new Error(`Unknown symbol id: ${id}`);
  }
  return entry;
}

/**
 * Safely get symbol data (returns null if not found)
 */
export function getSymbolDataSafe(id: string): SymbolConfigEntry | null {
  return SYMBOLS[id as SymbolId] || null;
}

/**
 * Get win multiplier for a symbol and cluster size
 * Uses "best match" logic: finds highest threshold <= clusterSize
 */
export function getWinMultiplier(symbolId: SymbolId, clusterSize: number): number {
  const config = SYMBOLS[symbolId];
  if (!config || !config.payouts) return 0;

  const payoutTable = config.payouts;
  const thresholds = Object.keys(payoutTable)
    .map(Number)
    .sort((a, b) => a - b);

  let bestThreshold = 0;
  for (const threshold of thresholds) {
    if (clusterSize >= threshold) {
      bestThreshold = threshold;
    }
  }

  return bestThreshold > 0 ? (payoutTable[bestThreshold] ?? 0) : 0;
}

/**
 * Get weighted random symbol for RNG
 */
export function getWeightedRandomSymbol(isBonus: boolean = false): SymbolId {
  const entries = Object.values(SYMBOLS);
  const weights = entries.map(e => isBonus ? e.bonusWeight : e.weight);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let random = Math.random() * totalWeight;

  for (let i = 0; i < entries.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return entries[i].id;
    }
  }

  return "muffin"; // Fallback to most common
}

/**
 * Generate random multiplier value using weighted selection
 */
export function generateMultiplierValue(): number {
  const totalWeight = MULTIPLIER_WEIGHTS.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < MULTIPLIER_VALUES.length; i++) {
    random -= MULTIPLIER_WEIGHTS[i];
    if (random <= 0) {
      return MULTIPLIER_VALUES[i];
    }
  }

  return MULTIPLIER_VALUES[0]; // Fallback to x2
}

/**
 * Get all regular (paying) symbols
 */
export function getRegularSymbols(): SymbolConfigEntry[] {
  return Object.values(SYMBOLS).filter(s => s.type === "regular");
}

/**
 * Get symbol display name
 */
export function getSymbolDisplayName(id: SymbolId): string {
  return SYMBOLS[id]?.displayName || id;
}

/**
 * Get symbol tier
 */
export function getSymbolTier(id: SymbolId): SymbolTier {
  return SYMBOLS[id]?.tier || "low";
}

/**
 * Check if cluster size is a winning count (8+)
 */
export function isWinningClusterSize(count: number): boolean {
  return count >= 8;
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================

/**
 * Map old symbol types to new SymbolIds
 * Used for migrating existing code
 */
export const LEGACY_TYPE_TO_SYMBOL_ID: Record<string, SymbolId> = {
  // Old type -> New SymbolId
  "purple": "chef",
  "plum": "brownie",
  "red": "pizza",
  "heart": "smoothie",
  "grape": "cookie",
  "green": "muffin",
  "blue": "spatula",
  "banana": "rolling",
  "scatter": "scatter",
  "multiplier": "multiplier",
};

/**
 * Map new SymbolIds to old types (for backward compat during transition)
 */
export const SYMBOL_ID_TO_LEGACY_TYPE: Record<SymbolId, string> = {
  "chef": "purple",
  "brownie": "plum",
  "pizza": "red",
  "smoothie": "heart",
  "cookie": "grape",
  "muffin": "green",
  "spatula": "blue",
  "rolling": "banana",
  "scatter": "scatter",
  "multiplier": "multiplier",
};

/**
 * Convert legacy type to SymbolId
 */
export function legacyTypeToSymbolId(legacyType: string): SymbolId {
  return LEGACY_TYPE_TO_SYMBOL_ID[legacyType] || "muffin";
}

/**
 * Convert SymbolId to legacy type
 */
export function symbolIdToLegacyType(symbolId: SymbolId): string {
  return SYMBOL_ID_TO_LEGACY_TYPE[symbolId] || "green";
}

// ============================================
// DISPLAY LABELS (for UI)
// ============================================

export const SYMBOL_LABELS: Record<SymbolId, string> = {
  chef: "Pluffy Chef",
  brownie: "Brownie",
  pizza: "Pizza",
  smoothie: "Smoothie",
  cookie: "Cookie",
  muffin: "Muffin",
  spatula: "Spatula",
  rolling: "Rolling Pin",
  scatter: "Bonus Oven",
  multiplier: "Multiplier",
};

// ============================================
// EXPORTS
// ============================================

export const ALL_SYMBOL_IDS = Object.keys(SYMBOLS) as SymbolId[];
export const REGULAR_SYMBOL_IDS = ALL_SYMBOL_IDS.filter(id => SYMBOLS[id].type === "regular");
export const MIN_CLUSTER_SIZE = 8;
