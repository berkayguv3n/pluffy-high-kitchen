/**
 * SYMBOL CONFIGURATION - Sembol Beyni
 * Tüm sembol tanımları, ağırlıklar ve ödeme tablosu
 */

// ============================================
// TYPES
// ============================================

export type SymbolId =
  | "cupcake"      // Low tier - en sık
  | "pizza"        // Low-mid tier
  | "brownie"      // Mid tier
  | "burger"       // High tier
  | "fries"        // Premium tier
  | "pluffyWild"   // Wild - joker
  | "bonusOven"    // Bonus - free spin trigger
  | "bombMultiplier"; // Multiplier bomb

export type SymbolType = "regular" | "wild" | "bonus" | "multiplier";

export interface PayoutTable {
  [clusterSize: number]: number; // clusterSize => multiplier (x bet)
}

export interface SymbolConfigEntry {
  id: SymbolId;
  type: SymbolType;
  weight: number;        // RNG ağırlığı (ne kadar sık düşeceği)
  bonusWeight: number;   // Free spin modunda ağırlık
  image: string;         // Asset path
  displayName: string;   // UI'da gösterilecek isim
  isWild: boolean;
  isBonus: boolean;
  payouts: PayoutTable;
}

// ============================================
// SYMBOL DEFINITIONS
// ============================================

const SYMBOLS: Record<SymbolId, SymbolConfigEntry> = {
  cupcake: {
    id: "cupcake",
    type: "regular",
    weight: 18,
    bonusWeight: 16,
    image: "/src/assets/symbol-muffin.png",
    displayName: "Muffin",
    isWild: false,
    isBonus: false,
    payouts: {
      8: 0.5,    // 8-9 cluster: 0.5x bet
      10: 1,     // 10-11: 1x
      12: 2,     // 12+: 2x
    },
  },
  pizza: {
    id: "pizza",
    type: "regular",
    weight: 15,
    bonusWeight: 14,
    image: "/src/assets/symbol-pizza.png",
    displayName: "Pizza",
    isWild: false,
    isBonus: false,
    payouts: {
      8: 1,
      10: 2,
      12: 5,
    },
  },
  brownie: {
    id: "brownie",
    type: "regular",
    weight: 12,
    bonusWeight: 11,
    image: "/src/assets/symbol-brownie.png",
    displayName: "Brownie",
    isWild: false,
    isBonus: false,
    payouts: {
      8: 2,
      10: 5,
      12: 10,
    },
  },
  burger: {
    id: "burger",
    type: "regular",
    weight: 8,
    bonusWeight: 8,
    image: "/src/assets/symbol-cookie.png",
    displayName: "Cookie",
    isWild: false,
    isBonus: false,
    payouts: {
      8: 3,
      10: 8,
      12: 20,
    },
  },
  fries: {
    id: "fries",
    type: "regular",
    weight: 5,
    bonusWeight: 5,
    image: "/src/assets/symbol-chef.png",
    displayName: "Pluffy Chef",
    isWild: false,
    isBonus: false,
    payouts: {
      8: 10,
      10: 25,
      12: 50,
    },
  },
  pluffyWild: {
    id: "pluffyWild",
    type: "wild",
    weight: 0,      // Base game'de wild yok
    bonusWeight: 0, // Bonus'ta da yok (opsiyonel eklenebilir)
    image: "/src/assets/symbol-chef.png",
    displayName: "Wild",
    isWild: true,
    isBonus: false,
    payouts: {
      8: 0,
      10: 0,
      12: 0,
    },
  },
  bonusOven: {
    id: "bonusOven",
    type: "bonus",
    weight: 2,       // Base game'de scatter şansı
    bonusWeight: 1,  // Bonus'ta daha az (retrigger için)
    image: "/src/assets/symbol-oven.png",
    displayName: "Bonus Oven",
    isWild: false,
    isBonus: true,
    payouts: {
      8: 0,
      10: 0,
      12: 0,
    },
  },
  bombMultiplier: {
    id: "bombMultiplier",
    type: "multiplier",
    weight: 0,       // Base game'de multiplier yok
    bonusWeight: 5,  // Sadece bonus'ta çıkar
    image: "/src/assets/symbol-oven.png", // Özel multiplier görseli
    displayName: "Multiplier Bomb",
    isWild: false,
    isBonus: false,
    payouts: {
      8: 0,
      10: 0,
      12: 0,
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sembol verisini ID ile al
 */
export function getSymbolData(id: SymbolId): SymbolConfigEntry {
  const entry = SYMBOLS[id];
  if (!entry) {
    throw new Error(`Unknown symbol id: ${id}`);
  }
  return entry;
}

/**
 * Cluster size'a göre win multiplier hesapla
 */
export function getWinMultiplier(symbolId: SymbolId, clusterSize: number): number {
  const config = getSymbolData(symbolId);
  const payoutTable = config.payouts;

  if (!payoutTable) return 0;

  // En yakın (aşağı) cluster size'ı bul
  const sizes = Object.keys(payoutTable)
    .map(Number)
    .sort((a, b) => a - b);

  let bestSize = 0;
  for (const size of sizes) {
    if (clusterSize >= size) {
      bestSize = size;
    }
  }

  if (bestSize === 0) return 0;
  return payoutTable[bestSize] ?? 0;
}

/**
 * RNG için ağırlıklı sembol seçimi
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
  
  return entries[0].id; // Fallback
}

/**
 * Sadece regular sembolleri al
 */
export function getRegularSymbols(): SymbolConfigEntry[] {
  return Object.values(SYMBOLS).filter(s => s.type === "regular");
}

/**
 * Sembol display name'ini al
 */
export function getSymbolDisplayName(id: SymbolId): string {
  return SYMBOLS[id]?.displayName || id;
}

/**
 * Sembol tier'ını belirle (payout'a göre)
 */
export function getSymbolTier(id: SymbolId): "low" | "mid" | "high" | "premium" | "special" {
  const config = SYMBOLS[id];
  if (config.type !== "regular") return "special";
  
  const maxPayout = Math.max(...Object.values(config.payouts));
  if (maxPayout >= 40) return "premium";
  if (maxPayout >= 15) return "high";
  if (maxPayout >= 5) return "mid";
  return "low";
}

// ============================================
// MULTIPLIER BOMB CONFIG
// ============================================

export const MULTIPLIER_VALUES = [2, 3, 5, 8, 10, 15, 25, 50, 100];
export const MULTIPLIER_WEIGHTS = [35, 25, 18, 10, 6, 3, 2, 0.8, 0.2];

/**
 * Random multiplier değeri üret
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

// ============================================
// EXPORTS
// ============================================

export const ALL_SYMBOLS = SYMBOLS;
export const SYMBOL_IDS = Object.keys(SYMBOLS) as SymbolId[];

// Legacy mapping for existing code compatibility
export const LEGACY_TYPE_MAP: Record<string, SymbolId> = {
  "banana": "cupcake",
  "blue": "cupcake",
  "green": "pizza",
  "grape": "brownie",
  "heart": "brownie",
  "red": "burger",
  "plum": "burger",
  "purple": "fries",
  "scatter": "bonusOven",
  "multiplier": "bombMultiplier",
};

/**
 * Legacy type'ı yeni SymbolId'ye çevir
 */
export function legacyTypeToSymbolId(legacyType: string): SymbolId {
  return LEGACY_TYPE_MAP[legacyType] || "cupcake";
}
