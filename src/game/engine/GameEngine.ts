/**
 * GAME ENGINE - Main Game Loop Controller
 * Orchestrates spin flow, cascades, bonus, and state management
 */

import {
  GRID_CONFIG,
  BONUS_CONFIG,
  BET_CONFIG,
  RISK_CONFIG,
  VolatilityProfile,
  DEFAULT_VOLATILITY,
  SymbolId,
} from "../config/GameConfig";
import { GeneratedSymbol, generateGrid, generateRandomSymbol } from "./RNGEngine";
import { calculateWins, calculateFinalWin, checkScatterTrigger, checkRetrigger, WinResult, getWinCategory, WinCategory } from "./WinEngine";
import { applyCascade, CascadeResult } from "./CascadeEngine";

// ============================================
// GAME STATE TYPES
// ============================================
export type GameMode = "BASE" | "BONUS";

export interface GameState {
  // Core state
  balance: number;
  bet: number;
  betIndex: number;
  mode: GameMode;
  volatility: VolatilityProfile;
  
  // Grid
  grid: GeneratedSymbol[][];
  
  // Current spin state
  isSpinning: boolean;
  isCascading: boolean;
  
  // Win tracking
  currentSpinWin: number;
  lastSpinWin: number;
  totalSessionWin: number;
  
  // Bonus state
  freeSpinsRemaining: number;
  totalBonusWin: number;
  currentMultiplierSum: number;
  collectedMultipliers: number[];
  
  // Pending actions
  pendingFreeSpins: number;
}

export interface SpinResult {
  success: boolean;
  error?: string;
  initialGrid: GeneratedSymbol[][];
  cascadeSequence: CascadeStep[];
  totalWin: number;
  winCategory: WinCategory;
  triggeredBonus: boolean;
  bonusSpinsAwarded: number;
}

export interface CascadeStep {
  grid: GeneratedSymbol[][];
  winResult: WinResult;
  cascadeResult?: CascadeResult;
  stepWin: number;
  multiplierSum: number;
}

// ============================================
// GAME ENGINE CLASS
// ============================================
export class GameEngine {
  private state: GameState;
  private onStateChange?: (state: GameState) => void;
  
  constructor(initialBalance: number = 10000) {
    this.state = this.createInitialState(initialBalance);
  }
  
  /**
   * Create initial game state
   */
  private createInitialState(balance: number): GameState {
    const initialGrid = generateGrid(false, DEFAULT_VOLATILITY, null);
    
    return {
      balance,
      bet: BET_CONFIG.STEPS[BET_CONFIG.DEFAULT_INDEX],
      betIndex: BET_CONFIG.DEFAULT_INDEX,
      mode: "BASE",
      volatility: DEFAULT_VOLATILITY,
      grid: initialGrid,
      isSpinning: false,
      isCascading: false,
      currentSpinWin: 0,
      lastSpinWin: 0,
      totalSessionWin: 0,
      freeSpinsRemaining: 0,
      totalBonusWin: 0,
      currentMultiplierSum: 0,
      collectedMultipliers: [],
      pendingFreeSpins: 0,
    };
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }
  
  /**
   * Emit state change
   */
  private emit(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }
  
  /**
   * Get current state (immutable copy)
   */
  getState(): GameState {
    return { ...this.state };
  }
  
  // ============================================
  // BET CONTROLS
  // ============================================
  
  increaseBet(): boolean {
    if (this.state.isSpinning || this.state.mode === "BONUS") return false;
    
    if (this.state.betIndex < BET_CONFIG.STEPS.length - 1) {
      this.state.betIndex++;
      this.state.bet = BET_CONFIG.STEPS[this.state.betIndex];
      this.emit();
      return true;
    }
    return false;
  }
  
  decreaseBet(): boolean {
    if (this.state.isSpinning || this.state.mode === "BONUS") return false;
    
    if (this.state.betIndex > 0) {
      this.state.betIndex--;
      this.state.bet = BET_CONFIG.STEPS[this.state.betIndex];
      this.emit();
      return true;
    }
    return false;
  }
  
  setBet(bet: number): boolean {
    if (this.state.isSpinning || this.state.mode === "BONUS") return false;
    
    const index = BET_CONFIG.STEPS.indexOf(bet);
    if (index !== -1) {
      this.state.betIndex = index;
      this.state.bet = bet;
      this.emit();
      return true;
    }
    return false;
  }
  
  setMaxBet(): boolean {
    return this.setBet(BET_CONFIG.STEPS[BET_CONFIG.STEPS.length - 1]);
  }
  
  // ============================================
  // MAIN SPIN LOGIC
  // ============================================
  
  /**
   * Check if spin is allowed
   */
  canSpin(): { allowed: boolean; reason?: string } {
    if (this.state.isSpinning) {
      return { allowed: false, reason: "Spin in progress" };
    }
    
    if (this.state.mode === "BASE" && this.state.balance < this.state.bet) {
      return { allowed: false, reason: "Insufficient balance" };
    }
    
    return { allowed: true };
  }
  
  /**
   * Execute a spin
   */
  async spin(): Promise<SpinResult> {
    const canSpinResult = this.canSpin();
    if (!canSpinResult.allowed) {
      return {
        success: false,
        error: canSpinResult.reason,
        initialGrid: this.state.grid,
        cascadeSequence: [],
        totalWin: 0,
        winCategory: { category: "NONE", label: "" },
        triggeredBonus: false,
        bonusSpinsAwarded: 0,
      };
    }
    
    // Lock spin
    this.state.isSpinning = true;
    this.state.currentSpinWin = 0;
    this.state.currentMultiplierSum = 0;
    this.state.collectedMultipliers = [];
    
    // Deduct bet (only in base game)
    if (this.state.mode === "BASE") {
      this.state.balance -= this.state.bet;
    } else {
      // Decrement free spins
      this.state.freeSpinsRemaining--;
    }
    
    this.emit();
    
    // Generate initial grid
    const isBonus = this.state.mode === "BONUS";
    const initialGrid = generateGrid(isBonus, this.state.volatility, null);
    this.state.grid = initialGrid;
    
    // Process cascades
    const cascadeSequence: CascadeStep[] = [];
    let currentGrid = initialGrid;
    let totalWin = 0;
    let cascadeCount = 0;
    let triggeredBonus = false;
    let bonusSpinsAwarded = 0;
    
    while (cascadeCount < RISK_CONFIG.MAX_CASCADES) {
      // Calculate wins
      const winResult = calculateWins(currentGrid, this.state.bet);
      
      // Collect multipliers
      if (winResult.multiplierCells.length > 0) {
        const newMultipliers = winResult.multiplierCells.map(m => m.value);
        this.state.collectedMultipliers.push(...newMultipliers);
        this.state.currentMultiplierSum = this.state.collectedMultipliers.reduce((a, b) => a + b, 0);
      }
      
      // Check for bonus trigger (only in base game, first cascade)
      if (this.state.mode === "BASE" && cascadeCount === 0) {
        const scatterResult = checkScatterTrigger(winResult.scatterCount);
        if (scatterResult.triggered) {
          triggeredBonus = true;
          bonusSpinsAwarded = scatterResult.freeSpins;
          this.state.pendingFreeSpins = scatterResult.freeSpins;
        }
      }
      
      // Check for retrigger (in bonus)
      if (this.state.mode === "BONUS") {
        const retriggerResult = checkRetrigger(winResult.scatterCount);
        if (retriggerResult.retriggered) {
          this.state.freeSpinsRemaining += retriggerResult.additionalSpins;
          bonusSpinsAwarded += retriggerResult.additionalSpins;
        }
      }
      
      if (!winResult.hasWin) {
        // No more wins, cascade loop ends
        cascadeSequence.push({
          grid: currentGrid,
          winResult,
          stepWin: 0,
          multiplierSum: this.state.currentMultiplierSum,
        });
        break;
      }
      
      // Calculate step win
      const stepWin = calculateFinalWin(
        winResult.totalWinMultiplier,
        this.state.mode === "BONUS" ? this.state.currentMultiplierSum : 0,
        this.state.bet
      );
      totalWin += stepWin;
      
      // Apply cascade
      const cascadeResult = applyCascade(
        currentGrid,
        winResult.winningCells,
        isBonus,
        this.state.volatility
      );
      
      cascadeSequence.push({
        grid: currentGrid,
        winResult,
        cascadeResult,
        stepWin,
        multiplierSum: this.state.currentMultiplierSum,
      });
      
      currentGrid = cascadeResult.newGrid;
      cascadeCount++;
    }
    
    // Update final grid
    this.state.grid = currentGrid;
    
    // Apply max win cap
    const maxWin = this.state.mode === "BONUS" 
      ? RISK_CONFIG.MAX_WIN_PER_BONUS_X * this.state.bet
      : RISK_CONFIG.MAX_WIN_PER_SPIN_X * this.state.bet;
    totalWin = Math.min(totalWin, maxWin);
    
    // Update state
    this.state.currentSpinWin = totalWin;
    this.state.lastSpinWin = totalWin;
    this.state.balance += totalWin;
    this.state.totalSessionWin += totalWin;
    
    if (this.state.mode === "BONUS") {
      this.state.totalBonusWin += totalWin;
    }
    
    // Get win category
    const winMultiplier = totalWin / this.state.bet;
    const winCategory = getWinCategory(winMultiplier);
    
    // Unlock spin
    this.state.isSpinning = false;
    this.emit();
    
    return {
      success: true,
      initialGrid,
      cascadeSequence,
      totalWin,
      winCategory,
      triggeredBonus,
      bonusSpinsAwarded,
    };
  }
  
  // ============================================
  // BONUS CONTROLS
  // ============================================
  
  /**
   * Start bonus round
   */
  startBonus(freeSpins: number): void {
    this.state.mode = "BONUS";
    this.state.freeSpinsRemaining = freeSpins;
    this.state.totalBonusWin = 0;
    this.state.collectedMultipliers = [];
    this.state.currentMultiplierSum = 0;
    this.state.pendingFreeSpins = 0;
    this.emit();
  }
  
  /**
   * End bonus round
   */
  endBonus(): { totalBonusWin: number } {
    const totalBonusWin = this.state.totalBonusWin;
    this.state.mode = "BASE";
    this.state.freeSpinsRemaining = 0;
    this.state.collectedMultipliers = [];
    this.state.currentMultiplierSum = 0;
    this.emit();
    return { totalBonusWin };
  }
  
  /**
   * Check if bonus should end
   */
  shouldEndBonus(): boolean {
    return this.state.mode === "BONUS" && this.state.freeSpinsRemaining <= 0;
  }
  
  /**
   * Check if bonus was triggered
   */
  hasPendingBonus(): boolean {
    return this.state.pendingFreeSpins > 0;
  }
  
  /**
   * Activate pending bonus
   */
  activatePendingBonus(): number {
    const spins = this.state.pendingFreeSpins;
    if (spins > 0) {
      this.startBonus(spins);
    }
    return spins;
  }
  
  // ============================================
  // BUY FEATURE
  // ============================================
  
  /**
   * Check if buy feature is available
   */
  canBuyBonus(): { allowed: boolean; cost: number; reason?: string } {
    const cost = this.state.bet * BONUS_CONFIG.BUY_COST_MULTIPLIER;
    
    if (this.state.isSpinning) {
      return { allowed: false, cost, reason: "Spin in progress" };
    }
    
    if (this.state.mode === "BONUS") {
      return { allowed: false, cost, reason: "Already in bonus" };
    }
    
    if (this.state.balance < cost) {
      return { allowed: false, cost, reason: "Insufficient balance" };
    }
    
    return { allowed: true, cost };
  }
  
  /**
   * Buy bonus feature
   */
  buyBonus(): { success: boolean; error?: string } {
    const canBuy = this.canBuyBonus();
    if (!canBuy.allowed) {
      return { success: false, error: canBuy.reason };
    }
    
    // Deduct cost
    this.state.balance -= canBuy.cost;
    
    // Start bonus
    this.startBonus(BONUS_CONFIG.BUY_FREE_SPINS);
    
    return { success: true };
  }
  
  // ============================================
  // UTILITY
  // ============================================
  
  /**
   * Set volatility profile
   */
  setVolatility(profile: VolatilityProfile): void {
    if (!this.state.isSpinning && this.state.mode === "BASE") {
      this.state.volatility = profile;
      this.emit();
    }
  }
  
  /**
   * Add balance (for testing/deposits)
   */
  addBalance(amount: number): void {
    this.state.balance += amount;
    this.emit();
  }
  
  /**
   * Reset game
   */
  reset(balance?: number): void {
    this.state = this.createInitialState(balance || this.state.balance);
    this.emit();
  }
}

// Singleton instance
let gameEngineInstance: GameEngine | null = null;

export function getGameEngine(initialBalance?: number): GameEngine {
  if (!gameEngineInstance) {
    gameEngineInstance = new GameEngine(initialBalance);
  }
  return gameEngineInstance;
}

export function resetGameEngine(initialBalance?: number): GameEngine {
  gameEngineInstance = new GameEngine(initialBalance);
  return gameEngineInstance;
}

