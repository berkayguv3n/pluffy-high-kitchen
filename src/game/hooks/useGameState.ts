/**
 * GAME STATE MACHINE
 * Central state management for the slot game
 * 
 * Handles:
 * - Spin state transitions (IDLE -> SPINNING -> RESOLVING -> IDLE)
 * - Balance and bet management
 * - Win tracking
 * - Free spins mode
 * - Autoplay integration
 */

import { useState, useCallback, useRef, useEffect } from "react";

// ============================================
// TYPES
// ============================================

export type SpinState = 
  | "IDLE"           // Ready for new spin
  | "SPINNING"       // Reels are spinning
  | "RESOLVING_WINS" // Evaluating wins and cascades
  | "SHOWING_WIN"    // Displaying win animation
  | "FREE_SPINS"     // In free spins mode
  | "BLOCKED";       // UI blocked (e.g., during buy bonus)

export type GameMode = "base" | "freespins";

export interface GameState {
  // Core state
  spinState: SpinState;
  gameMode: GameMode;
  
  // Economy
  balance: number;
  currentBet: number;
  lastWinAmount: number;
  totalWinSession: number;
  
  // Free spins
  freeSpinsRemaining: number;
  freeSpinsTotal: number;
  freeSpinsTotalWin: number;
  
  // Autoplay
  isAutoplay: boolean;
  autoSpinsRemaining: number;
  
  // UI flags
  canSpin: boolean;
  canChangeBet: boolean;
  canBuyBonus: boolean;
}

export interface GameStateActions {
  // Spin lifecycle
  startSpin: () => boolean;
  finishSpin: (winAmount: number) => void;
  startResolvingWins: () => void;
  finishResolvingWins: () => void;
  showWin: () => void;
  hideWin: () => void;
  
  // Economy
  setBalance: (balance: number) => void;
  addToBalance: (amount: number) => void;
  deductBet: () => boolean;
  setBet: (bet: number) => void;
  increaseBet: () => void;
  decreaseBet: () => void;
  
  // Free spins
  startFreeSpins: (count: number) => void;
  useFreeSpin: () => boolean;
  addFreeSpins: (count: number) => void;
  endFreeSpins: () => void;
  addFreeSpinWin: (amount: number) => void;
  
  // Autoplay
  startAutoplay: (spins: number) => void;
  stopAutoplay: () => void;
  useAutoSpin: () => boolean;
  
  // Utility
  reset: () => void;
  setSpinState: (state: SpinState) => void;
}

// ============================================
// CONSTANTS
// ============================================

export const BET_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
export const DEFAULT_BET = 10;
export const DEFAULT_BALANCE = 100000;

// ============================================
// INITIAL STATE
// ============================================

const createInitialState = (initialBalance?: number, initialBet?: number): GameState => ({
  spinState: "IDLE",
  gameMode: "base",
  balance: initialBalance ?? DEFAULT_BALANCE,
  currentBet: initialBet ?? DEFAULT_BET,
  lastWinAmount: 0,
  totalWinSession: 0,
  freeSpinsRemaining: 0,
  freeSpinsTotal: 0,
  freeSpinsTotalWin: 0,
  isAutoplay: false,
  autoSpinsRemaining: 0,
  canSpin: true,
  canChangeBet: true,
  canBuyBonus: true,
});

// ============================================
// HOOK
// ============================================

export interface UseGameStateOptions {
  initialBalance?: number;
  initialBet?: number;
  onSpinStart?: () => void;
  onSpinEnd?: (winAmount: number) => void;
  onFreeSpinsStart?: (count: number) => void;
  onFreeSpinsEnd?: (totalWin: number) => void;
  onBalanceChange?: (newBalance: number) => void;
}

export function useGameState(options: UseGameStateOptions = {}): [GameState, GameStateActions] {
  const [state, setState] = useState<GameState>(() => 
    createInitialState(options.initialBalance, options.initialBet)
  );
  
  // Refs for callbacks to avoid stale closures
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // ==========================================
  // DERIVED STATE
  // ==========================================
  
  const updateDerivedState = useCallback((newState: Partial<GameState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      
      // Compute derived flags
      const isIdle = updated.spinState === "IDLE";
      const hasBalance = updated.balance >= updated.currentBet;
      const notInFreeSpins = updated.gameMode === "base";
      
      updated.canSpin = isIdle && (hasBalance || updated.gameMode === "freespins");
      updated.canChangeBet = isIdle && notInFreeSpins && !updated.isAutoplay;
      updated.canBuyBonus = isIdle && notInFreeSpins && updated.balance >= updated.currentBet * 100;
      
      return updated;
    });
  }, []);
  
  // ==========================================
  // SPIN LIFECYCLE
  // ==========================================
  
  const startSpin = useCallback((): boolean => {
    const current = stateRef.current;
    
    if (current.spinState !== "IDLE") {
      console.warn("Cannot start spin: not in IDLE state");
      return false;
    }
    
    if (current.gameMode === "base" && current.balance < current.currentBet) {
      console.warn("Cannot start spin: insufficient balance");
      return false;
    }
    
    updateDerivedState({
      spinState: "SPINNING",
      lastWinAmount: 0,
    });
    
    options.onSpinStart?.();
    return true;
  }, [updateDerivedState, options]);
  
  const startResolvingWins = useCallback(() => {
    updateDerivedState({ spinState: "RESOLVING_WINS" });
  }, [updateDerivedState]);
  
  const finishResolvingWins = useCallback(() => {
    // Stay in RESOLVING_WINS, will transition to SHOWING_WIN or IDLE
  }, []);
  
  const showWin = useCallback(() => {
    updateDerivedState({ spinState: "SHOWING_WIN" });
  }, [updateDerivedState]);
  
  const hideWin = useCallback(() => {
    updateDerivedState({ spinState: "IDLE" });
  }, [updateDerivedState]);
  
  const finishSpin = useCallback((winAmount: number) => {
    const current = stateRef.current;
    
    const newBalance = current.balance + winAmount;
    const newTotalWin = current.totalWinSession + winAmount;
    
    updateDerivedState({
      spinState: "IDLE",
      balance: newBalance,
      lastWinAmount: winAmount,
      totalWinSession: newTotalWin,
    });
    
    options.onSpinEnd?.(winAmount);
    options.onBalanceChange?.(newBalance);
  }, [updateDerivedState, options]);
  
  // ==========================================
  // ECONOMY
  // ==========================================
  
  const setBalance = useCallback((balance: number) => {
    updateDerivedState({ balance });
    options.onBalanceChange?.(balance);
  }, [updateDerivedState, options]);
  
  const addToBalance = useCallback((amount: number) => {
    setState(prev => {
      const newBalance = prev.balance + amount;
      options.onBalanceChange?.(newBalance);
      return { ...prev, balance: newBalance };
    });
  }, [options]);
  
  const deductBet = useCallback((): boolean => {
    const current = stateRef.current;
    
    // Don't deduct during free spins
    if (current.gameMode === "freespins") {
      return true;
    }
    
    if (current.balance < current.currentBet) {
      return false;
    }
    
    const newBalance = current.balance - current.currentBet;
    updateDerivedState({ balance: newBalance });
    options.onBalanceChange?.(newBalance);
    return true;
  }, [updateDerivedState, options]);
  
  const setBet = useCallback((bet: number) => {
    const current = stateRef.current;
    if (!current.canChangeBet) return;
    
    const validBet = BET_STEPS.includes(bet) ? bet : DEFAULT_BET;
    updateDerivedState({ currentBet: validBet });
  }, [updateDerivedState]);
  
  const increaseBet = useCallback(() => {
    const current = stateRef.current;
    if (!current.canChangeBet) return;
    
    const currentIndex = BET_STEPS.indexOf(current.currentBet);
    if (currentIndex < BET_STEPS.length - 1) {
      updateDerivedState({ currentBet: BET_STEPS[currentIndex + 1] });
    }
  }, [updateDerivedState]);
  
  const decreaseBet = useCallback(() => {
    const current = stateRef.current;
    if (!current.canChangeBet) return;
    
    const currentIndex = BET_STEPS.indexOf(current.currentBet);
    if (currentIndex > 0) {
      updateDerivedState({ currentBet: BET_STEPS[currentIndex - 1] });
    }
  }, [updateDerivedState]);
  
  // ==========================================
  // FREE SPINS
  // ==========================================
  
  const startFreeSpins = useCallback((count: number) => {
    updateDerivedState({
      gameMode: "freespins",
      freeSpinsRemaining: count,
      freeSpinsTotal: count,
      freeSpinsTotalWin: 0,
    });
    options.onFreeSpinsStart?.(count);
  }, [updateDerivedState, options]);
  
  const useFreeSpin = useCallback((): boolean => {
    const current = stateRef.current;
    
    if (current.gameMode !== "freespins" || current.freeSpinsRemaining <= 0) {
      return false;
    }
    
    updateDerivedState({
      freeSpinsRemaining: current.freeSpinsRemaining - 1,
    });
    
    return true;
  }, [updateDerivedState]);
  
  const addFreeSpins = useCallback((count: number) => {
    setState(prev => ({
      ...prev,
      freeSpinsRemaining: prev.freeSpinsRemaining + count,
      freeSpinsTotal: prev.freeSpinsTotal + count,
    }));
  }, []);
  
  const addFreeSpinWin = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      freeSpinsTotalWin: prev.freeSpinsTotalWin + amount,
    }));
  }, []);
  
  const endFreeSpins = useCallback(() => {
    const current = stateRef.current;
    const totalWin = current.freeSpinsTotalWin;
    
    updateDerivedState({
      gameMode: "base",
      freeSpinsRemaining: 0,
      freeSpinsTotal: 0,
      freeSpinsTotalWin: 0,
    });
    
    options.onFreeSpinsEnd?.(totalWin);
  }, [updateDerivedState, options]);
  
  // ==========================================
  // AUTOPLAY
  // ==========================================
  
  const startAutoplay = useCallback((spins: number) => {
    updateDerivedState({
      isAutoplay: true,
      autoSpinsRemaining: spins,
    });
  }, [updateDerivedState]);
  
  const stopAutoplay = useCallback(() => {
    updateDerivedState({
      isAutoplay: false,
      autoSpinsRemaining: 0,
    });
  }, [updateDerivedState]);
  
  const useAutoSpin = useCallback((): boolean => {
    const current = stateRef.current;
    
    if (!current.isAutoplay || current.autoSpinsRemaining <= 0) {
      return false;
    }
    
    const remaining = current.autoSpinsRemaining - 1;
    updateDerivedState({
      autoSpinsRemaining: remaining,
      isAutoplay: remaining > 0,
    });
    
    return true;
  }, [updateDerivedState]);
  
  // ==========================================
  // UTILITY
  // ==========================================
  
  const reset = useCallback(() => {
    setState(createInitialState(options.initialBalance, options.initialBet));
  }, [options.initialBalance, options.initialBet]);
  
  const setSpinState = useCallback((spinState: SpinState) => {
    updateDerivedState({ spinState });
  }, [updateDerivedState]);
  
  // ==========================================
  // RETURN
  // ==========================================
  
  const actions: GameStateActions = {
    startSpin,
    finishSpin,
    startResolvingWins,
    finishResolvingWins,
    showWin,
    hideWin,
    setBalance,
    addToBalance,
    deductBet,
    setBet,
    increaseBet,
    decreaseBet,
    startFreeSpins,
    useFreeSpin,
    addFreeSpins,
    endFreeSpins,
    addFreeSpinWin,
    startAutoplay,
    stopAutoplay,
    useAutoSpin,
    reset,
    setSpinState,
  };
  
  return [state, actions];
}

// ============================================
// EXPORTS
// ============================================

export type { GameState, GameStateActions };


