/**
 * AUTOPLAY HOOK
 * Otomatik spin yönetimi için state machine
 */

import { useCallback, useState, useRef, useEffect } from "react";

// ============================================
// TYPES
// ============================================

export type SpinState = "idle" | "spinning" | "resolvingWins" | "cascading";

export interface AutoplayConfig {
  maxSpins: number;           // 0 = sınırsız
  stopOnWinAbove: number;     // Bu kazancın üstünde dur (0 = kapalı)
  stopOnBalanceBelow: number; // Balance bu değerin altına düşerse dur
  stopOnFreeSpins: boolean;   // Free spin tetiklenirse dur
  delayBetweenSpins: number;  // Spinler arası bekleme (ms)
}

export interface AutoplayStats {
  spinsCompleted: number;
  totalWon: number;
  totalBet: number;
  startingBalance: number;
  biggestWin: number;
}

export type AutoplayStopReason =
  | "user_stopped"
  | "max_spins"
  | "balance_low"
  | "win_limit"
  | "free_spins"
  | "error";

// ============================================
// DEFAULT CONFIG
// ============================================

export const DEFAULT_AUTOPLAY_CONFIG: AutoplayConfig = {
  maxSpins: 50,
  stopOnWinAbove: 0,
  stopOnBalanceBelow: 0,
  stopOnFreeSpins: true,
  delayBetweenSpins: 600,
};

// ============================================
// HOOK
// ============================================

interface UseAutoplayOptions {
  onSpinStart: () => Promise<void>;
  onStop?: (reason: AutoplayStopReason, stats: AutoplayStats) => void;
  getCurrentBalance: () => number;
  getCurrentBet: () => number;
  isSpinInProgress: () => boolean;
  isFreeSpinsActive: () => boolean;
}

export function useAutoplay(options: UseAutoplayOptions) {
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [spinState, setSpinState] = useState<SpinState>("idle");
  const [config, setConfig] = useState<AutoplayConfig>(DEFAULT_AUTOPLAY_CONFIG);
  const [stats, setStats] = useState<AutoplayStats>({
    spinsCompleted: 0,
    totalWon: 0,
    totalBet: 0,
    startingBalance: 0,
    biggestWin: 0,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppingRef = useRef(false);
  
  // Bet değiştirme kontrolü
  const canChangeBet = spinState === "idle" && !isAutoplay;
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Stop autoplay
  const stopAutoplay = useCallback((reason: AutoplayStopReason = "user_stopped") => {
    isStoppingRef.current = true;
    setIsAutoplay(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    options.onStop?.(reason, stats);
    isStoppingRef.current = false;
  }, [options, stats]);
  
  // Check stop conditions
  const checkStopConditions = useCallback((lastWin: number, freeSpinsTriggered: boolean): AutoplayStopReason | null => {
    if (isStoppingRef.current) return "user_stopped";
    
    const balance = options.getCurrentBalance();
    const bet = options.getCurrentBet();
    
    // Max spins
    if (config.maxSpins > 0 && stats.spinsCompleted >= config.maxSpins) {
      return "max_spins";
    }
    
    // Balance check
    if (balance < bet) {
      return "balance_low";
    }
    
    if (config.stopOnBalanceBelow > 0 && balance < config.stopOnBalanceBelow) {
      return "balance_low";
    }
    
    // Win limit
    if (config.stopOnWinAbove > 0 && lastWin >= config.stopOnWinAbove) {
      return "win_limit";
    }
    
    // Free spins
    if (config.stopOnFreeSpins && freeSpinsTriggered) {
      return "free_spins";
    }
    
    return null;
  }, [config, stats.spinsCompleted, options]);
  
  // Execute next spin
  const executeNextSpin = useCallback(async () => {
    if (!isAutoplay || isStoppingRef.current) return;
    
    const balance = options.getCurrentBalance();
    const bet = options.getCurrentBet();
    
    if (balance < bet) {
      stopAutoplay("balance_low");
      return;
    }
    
    // Free spins aktifse bekle
    if (options.isFreeSpinsActive()) {
      timeoutRef.current = setTimeout(executeNextSpin, 500);
      return;
    }
    
    // Spin başlat
    setSpinState("spinning");
    
    try {
      await options.onSpinStart();
    } catch (error) {
      console.error("Autoplay spin error:", error);
      stopAutoplay("error");
    }
  }, [isAutoplay, options, stopAutoplay]);
  
  // Notify spin complete
  const notifySpinComplete = useCallback((winAmount: number, freeSpinsTriggered: boolean = false) => {
    if (!isAutoplay) return;
    
    // Stats güncelle
    setStats(prev => ({
      ...prev,
      spinsCompleted: prev.spinsCompleted + 1,
      totalWon: prev.totalWon + winAmount,
      totalBet: prev.totalBet + options.getCurrentBet(),
      biggestWin: Math.max(prev.biggestWin, winAmount),
    }));
    
    setSpinState("idle");
    
    // Stop condition check
    const stopReason = checkStopConditions(winAmount, freeSpinsTriggered);
    if (stopReason) {
      stopAutoplay(stopReason);
      return;
    }
    
    // Schedule next spin
    timeoutRef.current = setTimeout(executeNextSpin, config.delayBetweenSpins);
  }, [isAutoplay, options, config.delayBetweenSpins, checkStopConditions, stopAutoplay, executeNextSpin]);
  
  // Start autoplay
  const startAutoplay = useCallback((customConfig?: Partial<AutoplayConfig>) => {
    if (isAutoplay || options.isSpinInProgress()) return false;
    
    const balance = options.getCurrentBalance();
    const bet = options.getCurrentBet();
    
    if (balance < bet) return false;
    
    // Config set
    if (customConfig) {
      setConfig(prev => ({ ...prev, ...customConfig }));
    }
    
    // Stats reset
    setStats({
      spinsCompleted: 0,
      totalWon: 0,
      totalBet: 0,
      startingBalance: balance,
      biggestWin: 0,
    });
    
    setIsAutoplay(true);
    isStoppingRef.current = false;
    
    // İlk spin'i başlat
    timeoutRef.current = setTimeout(executeNextSpin, 100);
    
    return true;
  }, [isAutoplay, options, executeNextSpin]);
  
  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    if (isAutoplay) {
      stopAutoplay("user_stopped");
    } else {
      startAutoplay();
    }
  }, [isAutoplay, startAutoplay, stopAutoplay]);
  
  // Update spin state (cascade vs normal)
  const updateSpinState = useCallback((state: SpinState) => {
    setSpinState(state);
  }, []);
  
  return {
    // State
    isAutoplay,
    spinState,
    canChangeBet,
    stats,
    config,
    
    // Actions
    startAutoplay,
    stopAutoplay,
    toggleAutoplay,
    notifySpinComplete,
    updateSpinState,
    setConfig,
  };
}

// ============================================
// PRESETS
// ============================================

export const AUTOPLAY_PRESETS = {
  quick10: {
    maxSpins: 10,
    delayBetweenSpins: 400,
  } as Partial<AutoplayConfig>,
  
  normal25: {
    maxSpins: 25,
    delayBetweenSpins: 600,
    stopOnFreeSpins: true,
  } as Partial<AutoplayConfig>,
  
  long50: {
    maxSpins: 50,
    delayBetweenSpins: 500,
  } as Partial<AutoplayConfig>,
  
  marathon100: {
    maxSpins: 100,
    delayBetweenSpins: 400,
    stopOnFreeSpins: false,
  } as Partial<AutoplayConfig>,
  
  untilBonus: {
    maxSpins: 0, // Sınırsız
    delayBetweenSpins: 450,
    stopOnFreeSpins: true,
  } as Partial<AutoplayConfig>,
};


