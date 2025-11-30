/**
 * SPIN CONFIGURATION - Hız & Timing
 * Spin animasyonu ve timing ayarları
 */

// ============================================
// TYPES
// ============================================

export interface SpinConfig {
  baseVelocity: number;           // px/s civarı, sonra scale edilecek
  reelCycles: number[];           // Her reel için kaç tam tur hissi
  reelStopDelayMs: number;        // Her reel dururken aradaki gecikme
  mobileScale: number;            // Mobilde biraz yavaşlatmak için
  minTotalSpinDurationMs: number; // Spin + settle toplam minimum süre
}

export interface AnimationTimings {
  // Spin Phase
  minSpinDurationMs: number;
  symbolDropMs: number;
  symbolSpawnMs: number;
  columnStaggerMs: number;
  rowStaggerMs: number;
  
  // Win Phase
  winHighlightMs: number;
  winPauseMs: number;
  winCelebrationMs: number;
  
  // Pop/Burst Phase
  popDurationMs: number;
  symbolFadeOutMs: number;
  burstParticleMs: number;
  
  // Cascade Phase
  cascadeDelayMs: number;
  cascadeFallMs: number;
  cascadeStaggerMs: number;
  
  // Multiplier Phase
  multiplierDropMs: number;
  multiplierExplosionMs: number;
  multiplierGlowMs: number;
  
  // UI Phase
  balanceUpdateMs: number;
  buttonFeedbackMs: number;
}

// ============================================
// DEFAULT CONFIGS
// ============================================

export const spinConfig: SpinConfig = {
  baseVelocity: 4200,
  reelCycles: [3, 3.5, 4, 4.5, 5, 5.5], // 6 column için
  reelStopDelayMs: 120,
  mobileScale: 0.85,
  minTotalSpinDurationMs: 1800,
};

export const animationTimings: AnimationTimings = {
  // Spin - Yavaş ve müziğe uyumlu
  minSpinDurationMs: 1200,
  symbolDropMs: 550,
  symbolSpawnMs: 450,
  columnStaggerMs: 60,
  rowStaggerMs: 50,
  
  // Win - Kutlama için yeterli süre
  winHighlightMs: 650,
  winPauseMs: 550,
  winCelebrationMs: 1200,
  
  // Pop/Burst
  popDurationMs: 320,
  symbolFadeOutMs: 280,
  burstParticleMs: 400,
  
  // Cascade - Smooth tumble
  cascadeDelayMs: 380,
  cascadeFallMs: 420,
  cascadeStaggerMs: 40,
  
  // Multiplier
  multiplierDropMs: 500,
  multiplierExplosionMs: 600,
  multiplierGlowMs: 800,
  
  // UI
  balanceUpdateMs: 800,
  buttonFeedbackMs: 120,
};

// ============================================
// TIMING PRESETS
// ============================================

export type TimingPreset = "slow" | "normal" | "fast" | "turbo";

export const TIMING_PRESETS: Record<TimingPreset, Partial<AnimationTimings>> = {
  slow: {
    minSpinDurationMs: 1600,
    symbolDropMs: 700,
    cascadeDelayMs: 500,
    winHighlightMs: 800,
    winPauseMs: 700,
  },
  normal: {
    // Default values
  },
  fast: {
    minSpinDurationMs: 800,
    symbolDropMs: 350,
    cascadeDelayMs: 250,
    winHighlightMs: 450,
    winPauseMs: 350,
    popDurationMs: 220,
  },
  turbo: {
    minSpinDurationMs: 400,
    symbolDropMs: 200,
    cascadeDelayMs: 150,
    winHighlightMs: 300,
    winPauseMs: 200,
    popDurationMs: 150,
    symbolFadeOutMs: 150,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Cell height'a göre efektif velocity hesapla
 */
export function getEffectiveVelocity(
  itemHeight: number,
  isMobile: boolean
): number {
  const baseScale = itemHeight / 80; // 80px referans
  const deviceScale = isMobile ? spinConfig.mobileScale : 1;
  return spinConfig.baseVelocity * baseScale * deviceScale;
}

/**
 * Column için stagger delay hesapla
 */
export function getColumnStaggerDelay(
  columnIndex: number,
  baseDelay: number = animationTimings.columnStaggerMs,
  randomVariation: number = 20
): number {
  const variation = Math.random() * randomVariation - randomVariation / 2;
  return columnIndex * baseDelay + variation;
}

/**
 * Row için stagger delay hesapla (yukarıdan aşağı)
 */
export function getRowStaggerDelay(
  rowIndex: number,
  totalRows: number,
  baseDelay: number = animationTimings.rowStaggerMs
): number {
  // Üstteki row'lar önce düşer
  return (totalRows - rowIndex - 1) * baseDelay;
}

/**
 * Düşüş mesafesine göre duration hesapla
 */
export function calculateFallDuration(
  fallDistance: number,
  baseDuration: number = animationTimings.cascadeFallMs
): number {
  // Kare kök ilişkisi - daha gerçekçi yerçekimi hissi
  return baseDuration * Math.sqrt(fallDistance / 3);
}

/**
 * Timing preset uygula
 */
export function applyTimingPreset(preset: TimingPreset): AnimationTimings {
  return {
    ...animationTimings,
    ...TIMING_PRESETS[preset],
  };
}

/**
 * Mobil için timing'leri scale et
 */
export function getMobileTimings(): AnimationTimings {
  const scale = 1.1; // Mobilde %10 daha yavaş
  return {
    minSpinDurationMs: animationTimings.minSpinDurationMs * scale,
    symbolDropMs: animationTimings.symbolDropMs * scale,
    symbolSpawnMs: animationTimings.symbolSpawnMs * scale,
    columnStaggerMs: animationTimings.columnStaggerMs * scale,
    rowStaggerMs: animationTimings.rowStaggerMs * scale,
    winHighlightMs: animationTimings.winHighlightMs * scale,
    winPauseMs: animationTimings.winPauseMs * scale,
    winCelebrationMs: animationTimings.winCelebrationMs,
    popDurationMs: animationTimings.popDurationMs * scale,
    symbolFadeOutMs: animationTimings.symbolFadeOutMs * scale,
    burstParticleMs: animationTimings.burstParticleMs,
    cascadeDelayMs: animationTimings.cascadeDelayMs * scale,
    cascadeFallMs: animationTimings.cascadeFallMs * scale,
    cascadeStaggerMs: animationTimings.cascadeStaggerMs * scale,
    multiplierDropMs: animationTimings.multiplierDropMs * scale,
    multiplierExplosionMs: animationTimings.multiplierExplosionMs,
    multiplierGlowMs: animationTimings.multiplierGlowMs,
    balanceUpdateMs: animationTimings.balanceUpdateMs,
    buttonFeedbackMs: animationTimings.buttonFeedbackMs,
  };
}

// ============================================
// EASING CURVES
// ============================================

export const EASING = {
  // Drop animations
  drop: [0.22, 1, 0.36, 1] as const,        // Smooth ease-out
  dropBounce: [0.34, 1.56, 0.64, 1] as const, // Slight bounce at end
  
  // Pop/burst
  pop: [0.4, 0, 0.2, 1] as const,
  burst: [0.68, -0.55, 0.265, 1.55] as const,
  
  // Highlights
  glow: [0.4, 0, 0.2, 1] as const,
  pulse: [0.4, 0, 0.6, 1] as const,
  
  // UI
  button: [0.25, 0.1, 0.25, 1] as const,
  counter: [0.16, 1, 0.3, 1] as const,
};

// ============================================
// UTILITY
// ============================================

/**
 * Promise-based wait
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Minimum süre garantisi
 */
export async function ensureMinDuration(
  startTime: number,
  minDuration: number
): Promise<void> {
  const elapsed = performance.now() - startTime;
  const remaining = minDuration - elapsed;
  if (remaining > 0) {
    await wait(remaining);
  }
}


