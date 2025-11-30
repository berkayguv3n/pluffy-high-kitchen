/**
 * GAME ENGINE - Main Export File
 * Central export point for all game modules
 */

// ============================================
// CONFIG
// ============================================

export * from "./config/symbolConfig";
export * from "./config/spinConfig";
export * from "./config/GameConfig";

// ============================================
// ENGINE
// ============================================

export * from "./engine/evaluateWin";
export * from "./engine/RNGEngine";
export * from "./engine/WinEngine";
export * from "./engine/CascadeEngine";
export * from "./engine/GameEngine";

// ============================================
// HOOKS
// ============================================

export * from "./hooks/useAutoplay";
export * from "./hooks/useGameState";
export * from "./hooks/useSound";

// ============================================
// UTILITIES
// ============================================

export * from "./utils/CurrencyUtils";

// ============================================
// SOUND
// ============================================

export { SoundManager } from "./SoundManager";

// ============================================
// SIMULATION (Dev only)
// ============================================

// Note: Simulator is available but not auto-exported
// Import directly: import { Simulator } from "@/game/simulation/Simulator"
