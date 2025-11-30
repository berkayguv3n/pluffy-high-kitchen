/**
 * MONTE CARLO SIMULATOR
 * For RTP validation and volatility testing
 */

import { VolatilityProfile, GRID_CONFIG, BET_CONFIG, DEFAULT_VOLATILITY } from "../config/GameConfig";
import { generateGrid, GeneratedSymbol } from "../engine/RNGEngine";
import { calculateWins, checkScatterTrigger, calculateFinalWin } from "../engine/WinEngine";
import { applyCascade } from "../engine/CascadeEngine";

export interface SimulationResult {
  spins: number;
  totalBet: number;
  totalWin: number;
  rtp: number;
  hitFrequency: number;
  bonusFrequency: number;
  avgWinPerHit: number;
  avgCascadesPerWin: number;
  maxWinObservedX: number;
  winDistribution: {
    "0x": number;
    "0-1x": number;
    "1-5x": number;
    "5-10x": number;
    "10-25x": number;
    "25-50x": number;
    "50-100x": number;
    "100x+": number;
  };
  bonusStats: {
    triggered: number;
    avgSpinsAwarded: number;
    avgBonusWinX: number;
    maxBonusWinX: number;
  };
  executionTimeMs: number;
}

/**
 * Run a single spin simulation (no UI, pure math)
 */
function simulateSpin(
  isBonus: boolean,
  volatility: VolatilityProfile,
  bet: number,
  collectedMultipliers: number[] = []
): {
  totalWin: number;
  cascadeCount: number;
  scatterCount: number;
  finalMultipliers: number[];
} {
  let grid = generateGrid(isBonus, volatility, null);
  let totalWin = 0;
  let cascadeCount = 0;
  let maxScatterCount = 0;
  const allMultipliers = [...collectedMultipliers];
  
  // Cascade loop
  while (cascadeCount < 50) {
    const winResult = calculateWins(grid, bet);
    
    // Track scatters (only count on first cascade)
    if (cascadeCount === 0) {
      maxScatterCount = winResult.scatterCount;
    }
    
    // Collect multipliers
    if (winResult.multiplierCells.length > 0) {
      allMultipliers.push(...winResult.multiplierCells.map(m => m.value));
    }
    
    if (!winResult.hasWin) break;
    
    // Calculate win
    const multiplierSum = isBonus && allMultipliers.length > 0 
      ? allMultipliers.reduce((a, b) => a + b, 0) 
      : 1;
    
    const stepWin = calculateFinalWin(winResult.totalWinMultiplier, isBonus ? multiplierSum : 0, bet);
    totalWin += stepWin;
    
    // Apply cascade
    const cascadeResult = applyCascade(grid, winResult.winningCells, isBonus, volatility);
    grid = cascadeResult.newGrid;
    cascadeCount++;
  }
  
  return {
    totalWin,
    cascadeCount,
    scatterCount: maxScatterCount,
    finalMultipliers: allMultipliers,
  };
}

/**
 * Run full simulation
 */
export async function runSimulation(
  volatility: VolatilityProfile = DEFAULT_VOLATILITY,
  spins: number = 100000,
  bet: number = BET_CONFIG.STEPS[BET_CONFIG.DEFAULT_INDEX],
  progressCallback?: (progress: number) => void
): Promise<SimulationResult> {
  const startTime = Date.now();
  
  let totalBet = 0;
  let totalWin = 0;
  let winningSpins = 0;
  let totalCascades = 0;
  let maxWinX = 0;
  
  const winDistribution = {
    "0x": 0,
    "0-1x": 0,
    "1-5x": 0,
    "5-10x": 0,
    "10-25x": 0,
    "25-50x": 0,
    "50-100x": 0,
    "100x+": 0,
  };
  
  const bonusStats = {
    triggered: 0,
    totalSpinsAwarded: 0,
    totalBonusWin: 0,
    maxBonusWinX: 0,
  };
  
  // Run base game spins
  for (let i = 0; i < spins; i++) {
    totalBet += bet;
    
    const result = simulateSpin(false, volatility, bet);
    totalWin += result.totalWin;
    
    if (result.totalWin > 0) {
      winningSpins++;
      totalCascades += result.cascadeCount;
    }
    
    const winX = result.totalWin / bet;
    maxWinX = Math.max(maxWinX, winX);
    
    // Categorize win
    if (winX === 0) winDistribution["0x"]++;
    else if (winX < 1) winDistribution["0-1x"]++;
    else if (winX < 5) winDistribution["1-5x"]++;
    else if (winX < 10) winDistribution["5-10x"]++;
    else if (winX < 25) winDistribution["10-25x"]++;
    else if (winX < 50) winDistribution["25-50x"]++;
    else if (winX < 100) winDistribution["50-100x"]++;
    else winDistribution["100x+"]++;
    
    // Check for bonus trigger
    const scatterResult = checkScatterTrigger(result.scatterCount);
    if (scatterResult.triggered) {
      bonusStats.triggered++;
      bonusStats.totalSpinsAwarded += scatterResult.freeSpins;
      
      // Simulate bonus round
      let bonusWin = 0;
      let freeSpinsLeft = scatterResult.freeSpins;
      let bonusMultipliers: number[] = [];
      
      while (freeSpinsLeft > 0) {
        const bonusResult = simulateSpin(true, volatility, bet, bonusMultipliers);
        bonusWin += bonusResult.totalWin;
        bonusMultipliers = bonusResult.finalMultipliers;
        freeSpinsLeft--;
        
        // Check retrigger
        if (bonusResult.scatterCount >= 3) {
          freeSpinsLeft += 5;
          bonusStats.totalSpinsAwarded += 5;
        }
      }
      
      totalWin += bonusWin;
      bonusStats.totalBonusWin += bonusWin;
      bonusStats.maxBonusWinX = Math.max(bonusStats.maxBonusWinX, bonusWin / bet);
    }
    
    // Progress callback
    if (progressCallback && i % 1000 === 0) {
      progressCallback((i / spins) * 100);
    }
  }
  
  const executionTimeMs = Date.now() - startTime;
  
  return {
    spins,
    totalBet,
    totalWin,
    rtp: totalWin / totalBet,
    hitFrequency: winningSpins / spins,
    bonusFrequency: bonusStats.triggered / spins,
    avgWinPerHit: winningSpins > 0 ? totalWin / winningSpins : 0,
    avgCascadesPerWin: winningSpins > 0 ? totalCascades / winningSpins : 0,
    maxWinObservedX: maxWinX,
    winDistribution,
    bonusStats: {
      triggered: bonusStats.triggered,
      avgSpinsAwarded: bonusStats.triggered > 0 
        ? bonusStats.totalSpinsAwarded / bonusStats.triggered 
        : 0,
      avgBonusWinX: bonusStats.triggered > 0 
        ? (bonusStats.totalBonusWin / bonusStats.triggered) / bet 
        : 0,
      maxBonusWinX: bonusStats.maxBonusWinX,
    },
    executionTimeMs,
  };
}

/**
 * Format simulation results for console
 */
export function formatSimulationResults(result: SimulationResult): string {
  return `
╔══════════════════════════════════════════════════════════════╗
║              PLUFFY: HIGH KITCHEN - SIMULATION               ║
╠══════════════════════════════════════════════════════════════╣
║ Spins: ${result.spins.toLocaleString().padStart(12)}                                    ║
║ Execution Time: ${(result.executionTimeMs / 1000).toFixed(2)}s                                ║
╠══════════════════════════════════════════════════════════════╣
║ CORE METRICS                                                 ║
╠══════════════════════════════════════════════════════════════╣
║ RTP: ${(result.rtp * 100).toFixed(2)}%                                              ║
║ Hit Frequency: ${(result.hitFrequency * 100).toFixed(2)}%                                   ║
║ Bonus Frequency: 1 in ${Math.round(1 / result.bonusFrequency)} spins                        ║
║ Max Win Observed: ${result.maxWinObservedX.toFixed(1)}x                                    ║
╠══════════════════════════════════════════════════════════════╣
║ WIN DISTRIBUTION                                             ║
╠══════════════════════════════════════════════════════════════╣
║ 0x (no win):    ${((result.winDistribution["0x"] / result.spins) * 100).toFixed(1)}%                                     ║
║ 0-1x:           ${((result.winDistribution["0-1x"] / result.spins) * 100).toFixed(1)}%                                     ║
║ 1-5x:           ${((result.winDistribution["1-5x"] / result.spins) * 100).toFixed(1)}%                                     ║
║ 5-10x:          ${((result.winDistribution["5-10x"] / result.spins) * 100).toFixed(1)}%                                     ║
║ 10-25x:         ${((result.winDistribution["10-25x"] / result.spins) * 100).toFixed(2)}%                                    ║
║ 25-50x:         ${((result.winDistribution["25-50x"] / result.spins) * 100).toFixed(2)}%                                    ║
║ 50-100x:        ${((result.winDistribution["50-100x"] / result.spins) * 100).toFixed(3)}%                                   ║
║ 100x+:          ${((result.winDistribution["100x+"] / result.spins) * 100).toFixed(3)}%                                   ║
╠══════════════════════════════════════════════════════════════╣
║ BONUS STATS                                                  ║
╠══════════════════════════════════════════════════════════════╣
║ Times Triggered: ${result.bonusStats.triggered}                                      ║
║ Avg Spins Awarded: ${result.bonusStats.avgSpinsAwarded.toFixed(1)}                                   ║
║ Avg Bonus Win: ${result.bonusStats.avgBonusWinX.toFixed(1)}x                                       ║
║ Max Bonus Win: ${result.bonusStats.maxBonusWinX.toFixed(1)}x                                       ║
╚══════════════════════════════════════════════════════════════╝
`;
}


