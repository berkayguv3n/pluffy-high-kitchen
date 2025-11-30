/**
 * PLUFFY: HIGH KITCHEN - GAME CONFIGURATION
 * Central configuration for all game parameters
 */

// ============================================
// SYMBOL DEFINITIONS
// ============================================
export type SymbolId = 
  | "CHEF"      // Premium - Pluffy Chef
  | "BROWNIE"   // High - Brownie Tray
  | "PIZZA"     // High - Pizza Slice
  | "SMOOTHIE"  // Mid - Smoothie Cup
  | "COOKIE"    // Mid - Cookie Jar
  | "MUFFIN"    // Low - Muffin
  | "SPATULA"   // Low - Spatula
  | "ROLLING"   // Low - Rolling Pin
  | "SCATTER"   // Oven - Bonus Trigger
  | "MULTIPLIER"; // Multiplier Candy (Bonus only)

export interface SymbolDefinition {
  id: SymbolId;
  name: string;
  assetKey: string; // Maps to asset file
  tier: "premium" | "high" | "mid" | "low" | "special";
}

export const SYMBOLS: Record<SymbolId, SymbolDefinition> = {
  CHEF:       { id: "CHEF",       name: "Pluffy Chef",   assetKey: "symbol-chef",     tier: "premium" },
  BROWNIE:    { id: "BROWNIE",    name: "Brownie Tray",  assetKey: "symbol-brownie",  tier: "high" },
  PIZZA:      { id: "PIZZA",      name: "Pizza Slice",   assetKey: "symbol-pizza",    tier: "high" },
  SMOOTHIE:   { id: "SMOOTHIE",   name: "Smoothie Cup",  assetKey: "symbol-smoothie", tier: "mid" },
  COOKIE:     { id: "COOKIE",     name: "Cookie Jar",    assetKey: "symbol-cookie",   tier: "mid" },
  MUFFIN:     { id: "MUFFIN",     name: "Muffin",        assetKey: "symbol-muffin",   tier: "low" },
  SPATULA:    { id: "SPATULA",    name: "Spatula",       assetKey: "symbol-spatula",  tier: "low" },
  ROLLING:    { id: "ROLLING",    name: "Rolling Pin",   assetKey: "symbol-rolling",  tier: "low" },
  SCATTER:    { id: "SCATTER",    name: "Oven",          assetKey: "symbol-oven",     tier: "special" },
  MULTIPLIER: { id: "MULTIPLIER", name: "Multiplier",    assetKey: "symbol-oven",     tier: "special" },
};

// ============================================
// GRID CONFIGURATION
// ============================================
export const GRID_CONFIG = {
  ROWS: 5,
  COLS: 6,
  TOTAL_CELLS: 30,
};

// ============================================
// PAYTABLE - Bet Multipliers for 8+ matches
// ============================================
export interface PayoutTier {
  minCount: number;
  maxCount: number;
  multiplier: number;
}

export interface SymbolPayouts {
  lowCount: PayoutTier;   // 8-9 symbols
  midCount: PayoutTier;   // 10-11 symbols
  highCount: PayoutTier;  // 12+ symbols
}

export const PAYTABLE: Record<Exclude<SymbolId, "SCATTER" | "MULTIPLIER">, SymbolPayouts> = {
  CHEF: {
    lowCount:  { minCount: 8,  maxCount: 9,  multiplier: 10 },
    midCount:  { minCount: 10, maxCount: 11, multiplier: 25 },
    highCount: { minCount: 12, maxCount: 30, multiplier: 50 },
  },
  BROWNIE: {
    lowCount:  { minCount: 8,  maxCount: 9,  multiplier: 5 },
    midCount:  { minCount: 10, maxCount: 11, multiplier: 10 },
    highCount: { minCount: 12, maxCount: 30, multiplier: 25 },
  },
  PIZZA: {
    lowCount:  { minCount: 8,  maxCount: 9,  multiplier: 3 },
    midCount:  { minCount: 10, maxCount: 11, multiplier: 7 },
    highCount: { minCount: 12, maxCount: 30, multiplier: 15 },
  },
  SMOOTHIE: {
    lowCount:  { minCount: 8,  maxCount: 9,  multiplier: 2 },
    midCount:  { minCount: 10, maxCount: 11, multiplier: 5 },
    highCount: { minCount: 12, maxCount: 30, multiplier: 10 },
  },
  COOKIE: {
    lowCount:  { minCount: 8,  maxCount: 9,  multiplier: 1.5 },
    midCount:  { minCount: 10, maxCount: 11, multiplier: 4 },
    highCount: { minCount: 12, maxCount: 30, multiplier: 8 },
  },
  MUFFIN: {
    lowCount:  { minCount: 8,  maxCount: 9,  multiplier: 1 },
    midCount:  { minCount: 10, maxCount: 11, multiplier: 2 },
    highCount: { minCount: 12, maxCount: 30, multiplier: 5 },
  },
  SPATULA: {
    lowCount:  { minCount: 8,  maxCount: 9,  multiplier: 0.5 },
    midCount:  { minCount: 10, maxCount: 11, multiplier: 1.5 },
    highCount: { minCount: 12, maxCount: 30, multiplier: 3 },
  },
  ROLLING: {
    lowCount:  { minCount: 8,  maxCount: 9,  multiplier: 0.25 },
    midCount:  { minCount: 10, maxCount: 11, multiplier: 1 },
    highCount: { minCount: 12, maxCount: 30, multiplier: 2 },
  },
};

// ============================================
// SYMBOL WEIGHTS (RNG Distribution)
// ============================================
export interface SymbolWeights {
  base: Record<SymbolId, number>;
  bonus: Record<SymbolId, number>;
}

export const SYMBOL_WEIGHTS: SymbolWeights = {
  base: {
    CHEF:       0.05,   // 5% - Premium, very rare
    BROWNIE:    0.08,   // 8% - High
    PIZZA:      0.08,   // 8% - High
    SMOOTHIE:   0.12,   // 12% - Mid
    COOKIE:     0.12,   // 12% - Mid
    MUFFIN:     0.17,   // 17% - Low
    SPATULA:    0.17,   // 17% - Low
    ROLLING:    0.17,   // 17% - Low
    SCATTER:    0.04,   // 4% - Scatter (triggers bonus)
    MULTIPLIER: 0,      // 0% - Not in base game
  },
  bonus: {
    CHEF:       0.05,
    BROWNIE:    0.08,
    PIZZA:      0.08,
    SMOOTHIE:   0.12,
    COOKIE:     0.12,
    MUFFIN:     0.15,
    SPATULA:    0.15,
    ROLLING:    0.15,
    SCATTER:    0.02,   // Lower in bonus
    MULTIPLIER: 0.08,   // 8% - Multiplier candies appear
  },
};

// ============================================
// BONUS / FREE SPINS CONFIGURATION
// ============================================
export const BONUS_CONFIG = {
  // Scatter trigger thresholds
  SCATTER_TRIGGER: {
    4: 10,  // 4 scatters = 10 free spins
    5: 15,  // 5 scatters = 15 free spins
    6: 20,  // 6+ scatters = 20 free spins
  },
  
  // Retrigger during bonus
  RETRIGGER_SCATTERS: 3,
  RETRIGGER_SPINS: 5,
  
  // Multiplier candy values and weights
  MULTIPLIER_VALUES: [2, 3, 5, 8, 10, 15, 25, 50, 100],
  MULTIPLIER_WEIGHTS: [
    0.30,  // x2 - 30%
    0.25,  // x3 - 25%
    0.20,  // x5 - 20%
    0.10,  // x8 - 10%
    0.07,  // x10 - 7%
    0.04,  // x15 - 4%
    0.025, // x25 - 2.5%
    0.01,  // x50 - 1%
    0.005, // x100 - 0.5%
  ],
  
  // Buy feature
  BUY_COST_MULTIPLIER: 100, // 100x bet
  BUY_FREE_SPINS: 10,
};

// ============================================
// BET CONFIGURATION
// ============================================
export const BET_CONFIG = {
  STEPS: [0.20, 0.40, 1, 2, 5, 10, 20, 50, 100, 200],
  DEFAULT_INDEX: 3, // $2
  MIN_BET: 0.20,
  MAX_BET: 200,
};

// ============================================
// WIN CATEGORIES
// ============================================
export const WIN_CATEGORIES = {
  NICE:   { minMultiplier: 1,   maxMultiplier: 10,  label: "NICE WIN" },
  BIG:    { minMultiplier: 10,  maxMultiplier: 50,  label: "BIG WIN" },
  MEGA:   { minMultiplier: 50,  maxMultiplier: 100, label: "MEGA WIN" },
  INSANE: { minMultiplier: 100, maxMultiplier: Infinity, label: "INSANE WIN" },
};

// ============================================
// ANIMATION TIMINGS (ms)
// ============================================
export const ANIMATION_CONFIG = {
  // Initial spin drop
  SPIN_DROP_DURATION: 450,
  SPIN_DROP_STAGGER: 30, // Per column delay
  
  // Win highlight
  WIN_HIGHLIGHT_DURATION: 500,
  
  // Symbol pop/burst
  POP_DURATION: 350,
  
  // Cascade fall
  CASCADE_DURATION: 400,
  CASCADE_STAGGER: 25,
  
  // Delay before checking next cascade
  CASCADE_CHECK_DELAY: 100,
  
  // Win counter animation
  WIN_COUNT_DURATION: 1500,
};

// ============================================
// RISK / CAP LIMITS
// ============================================
export const RISK_CONFIG = {
  MAX_WIN_PER_SPIN_X: 5000,    // 5000x max per spin
  MAX_WIN_PER_BONUS_X: 10000,  // 10000x max per bonus round
  MAX_CASCADES: 50,            // Safety limit
};

// ============================================
// CURRENCY CONFIGURATION
// ============================================
export type Currency = "TRY" | "USD" | "EUR" | "USDT";

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  decimals: number;
  denomination: number; // 1 credit = X currency
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  TRY:  { code: "TRY",  symbol: "₺",    decimals: 2, denomination: 1 },
  USD:  { code: "USD",  symbol: "$",    decimals: 2, denomination: 1 },
  EUR:  { code: "EUR",  symbol: "€",    decimals: 2, denomination: 1 },
  USDT: { code: "USDT", symbol: "USDT", decimals: 2, denomination: 1 },
};

export const DEFAULT_CURRENCY: Currency = "USD";

// ============================================
// VOLATILITY PROFILES
// ============================================
export type VolatilityProfile = "LOW" | "MID" | "DEGEN";

export interface VolatilityConfig {
  name: VolatilityProfile;
  targetRTP: number;
  hitFrequency: number;      // Approx % of spins with any win
  bonusFrequency: number;    // Approx % of spins triggering bonus
  description: string;
}

export const VOLATILITY_PROFILES: Record<VolatilityProfile, VolatilityConfig> = {
  LOW: {
    name: "LOW",
    targetRTP: 0.97,
    hitFrequency: 0.40,
    bonusFrequency: 0.004,
    description: "Casual - frequent small wins, low risk",
  },
  MID: {
    name: "MID",
    targetRTP: 0.965,
    hitFrequency: 0.33,
    bonusFrequency: 0.003,
    description: "Balanced - default experience",
  },
  DEGEN: {
    name: "DEGEN",
    targetRTP: 0.955,
    hitFrequency: 0.25,
    bonusFrequency: 0.0025,
    description: "High risk - big swings, rare huge wins",
  },
};

export const DEFAULT_VOLATILITY: VolatilityProfile = "MID";


