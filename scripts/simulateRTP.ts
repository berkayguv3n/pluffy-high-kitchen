/**
 * RTP & VOLATILITY SIMULATION SCRIPT
 * 
 * Dev-only script to validate game math and RTP
 * Run with: npx ts-node scripts/simulateRTP.ts
 * Or: npx tsx scripts/simulateRTP.ts
 * 
 * Usage:
 *   npx tsx scripts/simulateRTP.ts              # Default 100k spins
 *   npx tsx scripts/simulateRTP.ts 1000000      # 1M spins
 *   npx tsx scripts/simulateRTP.ts 100000 10    # 100k spins, bet=10
 */

// ============================================
// TYPES (Inline to avoid import issues)
// ============================================

type SymbolId = 
  | "chef" | "brownie" | "pizza" | "smoothie" | "cookie" 
  | "muffin" | "spatula" | "rolling" | "scatter" | "multiplier";

interface PayoutTable {
  [clusterSize: number]: number;
}

interface SymbolConfig {
  id: SymbolId;
  weight: number;
  bonusWeight: number;
  payouts: PayoutTable;
}

// ============================================
// SYMBOL CONFIG (Mirrored from symbolConfig.ts)
// ============================================

const SYMBOLS: Record<SymbolId, SymbolConfig> = {
  chef: { id: "chef", weight: 5, bonusWeight: 5, payouts: { 8: 10, 10: 25, 12: 50 } },
  brownie: { id: "brownie", weight: 8, bonusWeight: 8, payouts: { 8: 5, 10: 10, 12: 25 } },
  pizza: { id: "pizza", weight: 8, bonusWeight: 8, payouts: { 8: 3, 10: 7, 12: 15 } },
  smoothie: { id: "smoothie", weight: 12, bonusWeight: 12, payouts: { 8: 2, 10: 5, 12: 10 } },
  cookie: { id: "cookie", weight: 12, bonusWeight: 12, payouts: { 8: 1.5, 10: 4, 12: 8 } },
  muffin: { id: "muffin", weight: 17, bonusWeight: 15, payouts: { 8: 1, 10: 2, 12: 5 } },
  spatula: { id: "spatula", weight: 17, bonusWeight: 15, payouts: { 8: 0.5, 10: 1.5, 12: 3 } },
  rolling: { id: "rolling", weight: 17, bonusWeight: 15, payouts: { 8: 0.25, 10: 1, 12: 2 } },
  scatter: { id: "scatter", weight: 2, bonusWeight: 1, payouts: {} },
  multiplier: { id: "multiplier", weight: 0, bonusWeight: 5, payouts: {} },
};

const MULTIPLIER_VALUES = [2, 3, 5, 8, 10, 15, 25, 50, 100];
const MULTIPLIER_WEIGHTS = [35, 25, 18, 10, 6, 3, 2, 0.8, 0.2];

// ============================================
// RNG FUNCTIONS
// ============================================

function getWeightedRandomSymbol(isBonus: boolean): SymbolId {
  const entries = Object.values(SYMBOLS);
  const weights = entries.map(e => isBonus ? e.bonusWeight : e.weight);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  let random = Math.random() * totalWeight;
  for (let i = 0; i < entries.length; i++) {
    random -= weights[i];
    if (random <= 0) return entries[i].id;
  }
  return "muffin";
}

function generateMultiplierValue(): number {
  const totalWeight = MULTIPLIER_WEIGHTS.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < MULTIPLIER_VALUES.length; i++) {
    random -= MULTIPLIER_WEIGHTS[i];
    if (random <= 0) return MULTIPLIER_VALUES[i];
  }
  return MULTIPLIER_VALUES[0];
}

function getWinMultiplier(symbolId: SymbolId, count: number): number {
  const config = SYMBOLS[symbolId];
  if (!config.payouts) return 0;
  
  const thresholds = Object.keys(config.payouts).map(Number).sort((a, b) => a - b);
  let best = 0;
  for (const t of thresholds) {
    if (count >= t) best = t;
  }
  return best > 0 ? (config.payouts[best] ?? 0) : 0;
}

// ============================================
// BOARD GENERATION
// ============================================

type Board = (SymbolId | null)[][];

function generateBoard(rows: number, cols: number, isBonus: boolean): Board {
  const board: Board = [];
  for (let r = 0; r < rows; r++) {
    const row: (SymbolId | null)[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(getWeightedRandomSymbol(isBonus));
    }
    board.push(row);
  }
  return board;
}

function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

function applyGravity(board: Board): Board {
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;
  const result = cloneBoard(board);

  for (let c = 0; c < numCols; c++) {
    let writeRow = numRows - 1;
    for (let r = numRows - 1; r >= 0; r--) {
      if (result[r][c] !== null) {
        result[writeRow][c] = result[r][c];
        if (writeRow !== r) result[r][c] = null;
        writeRow--;
      }
    }
    for (let r = writeRow; r >= 0; r--) {
      result[r][c] = null;
    }
  }
  return result;
}

function fillEmptyCells(board: Board, isBonus: boolean): Board {
  const result = cloneBoard(board);
  for (let r = 0; r < result.length; r++) {
    for (let c = 0; c < result[r].length; c++) {
      if (result[r][c] === null) {
        result[r][c] = getWeightedRandomSymbol(isBonus);
      }
    }
  }
  return result;
}

// ============================================
// WIN EVALUATION
// ============================================

interface CascadeResult {
  totalWin: number;
  scatterCount: number;
  multiplierSum: number;
  cascadeCount: number;
}

function evaluateWithCascade(board: Board, bet: number, isBonus: boolean): CascadeResult {
  let workingBoard = cloneBoard(board);
  let totalWin = 0;
  let cascadeCount = 0;
  let scatterCount = 0;
  let multiplierSum = 0;

  // Count specials on initial board
  for (const row of workingBoard) {
    for (const cell of row) {
      if (cell === "scatter") scatterCount++;
      if (cell === "multiplier") multiplierSum += generateMultiplierValue();
    }
  }

  // Cascade loop
  while (true) {
    const symbolCounts = new Map<SymbolId, number>();
    
    for (const row of workingBoard) {
      for (const cell of row) {
        if (cell && cell !== "scatter" && cell !== "multiplier") {
          symbolCounts.set(cell, (symbolCounts.get(cell) || 0) + 1);
        }
      }
    }

    let hasWin = false;
    let cascadeWin = 0;
    const winningSymbols = new Set<SymbolId>();

    symbolCounts.forEach((count, symbolId) => {
      if (count >= 8) {
        hasWin = true;
        const multiplier = getWinMultiplier(symbolId, count);
        cascadeWin += multiplier * bet;
        winningSymbols.add(symbolId);
      }
    });

    if (!hasWin) break;

    cascadeCount++;
    totalWin += cascadeWin;

    // Remove winning symbols
    for (let r = 0; r < workingBoard.length; r++) {
      for (let c = 0; c < workingBoard[r].length; c++) {
        const cell = workingBoard[r][c];
        if (cell && winningSymbols.has(cell)) {
          workingBoard[r][c] = null;
        }
      }
    }

    // Apply gravity and fill
    workingBoard = applyGravity(workingBoard);
    workingBoard = fillEmptyCells(workingBoard, isBonus);

    // Count new specials from cascade
    for (const row of workingBoard) {
      for (const cell of row) {
        if (cell === "multiplier") {
          multiplierSum += generateMultiplierValue();
        }
      }
    }
  }

  return { totalWin, scatterCount, multiplierSum, cascadeCount };
}

// ============================================
// FREE SPINS SIMULATION
// ============================================

function simulateFreeSpins(bet: number, initialSpins: number): number {
  let spinsRemaining = initialSpins;
  let totalWin = 0;

  while (spinsRemaining > 0) {
    spinsRemaining--;
    
    const board = generateBoard(5, 6, true);
    const result = evaluateWithCascade(board, bet, true);
    
    // Apply multiplier sum to spin win
    let spinWin = result.totalWin;
    if (result.multiplierSum > 0 && spinWin > 0) {
      spinWin *= result.multiplierSum;
    }
    totalWin += spinWin;

    // Retrigger check (3+ scatters = +5 spins)
    if (result.scatterCount >= 3) {
      spinsRemaining += 5;
    }
  }

  return totalWin;
}

// ============================================
// MAIN SIMULATION
// ============================================

interface SimulationResult {
  spins: number;
  totalBet: number;
  totalWin: number;
  rtp: number;
  hitRate: number;
  bonusRate: number;
  avgWinMultiplier: number;
  maxWinMultiplier: number;
  winDistribution: Record<string, number>;
  avgCascades: number;
}

function runSimulation(
  numSpins: number, 
  bet: number,
  progressCallback?: (progress: number) => void
): SimulationResult {
  let totalBet = 0;
  let totalWin = 0;
  let winCount = 0;
  let bonusCount = 0;
  let maxWin = 0;
  let totalCascades = 0;

  const winDistribution: Record<string, number> = {
    "0x": 0,
    "0-1x": 0,
    "1-5x": 0,
    "5-10x": 0,
    "10-25x": 0,
    "25-50x": 0,
    "50-100x": 0,
    "100x+": 0,
  };

  const progressStep = Math.floor(numSpins / 20);

  for (let i = 0; i < numSpins; i++) {
    totalBet += bet;

    const board = generateBoard(5, 6, false);
    const result = evaluateWithCascade(board, bet, false);
    
    let spinWin = result.totalWin;
    totalCascades += result.cascadeCount;

    // Check for bonus trigger
    if (result.scatterCount >= 4) {
      bonusCount++;
      const freeSpins = result.scatterCount >= 6 ? 20 : result.scatterCount >= 5 ? 15 : 10;
      spinWin += simulateFreeSpins(bet, freeSpins);
    }

    totalWin += spinWin;

    if (spinWin > 0) {
      winCount++;
      const multiplier = spinWin / bet;
      if (multiplier > maxWin) maxWin = multiplier;

      // Distribution
      if (multiplier < 1) winDistribution["0-1x"]++;
      else if (multiplier < 5) winDistribution["1-5x"]++;
      else if (multiplier < 10) winDistribution["5-10x"]++;
      else if (multiplier < 25) winDistribution["10-25x"]++;
      else if (multiplier < 50) winDistribution["25-50x"]++;
      else if (multiplier < 100) winDistribution["50-100x"]++;
      else winDistribution["100x+"]++;
    } else {
      winDistribution["0x"]++;
    }

    // Progress callback
    if (progressCallback && i % progressStep === 0) {
      progressCallback((i / numSpins) * 100);
    }
  }

  return {
    spins: numSpins,
    totalBet,
    totalWin,
    rtp: (totalWin / totalBet) * 100,
    hitRate: (winCount / numSpins) * 100,
    bonusRate: (bonusCount / numSpins) * 100,
    avgWinMultiplier: winCount > 0 ? (totalWin / winCount) / bet : 0,
    maxWinMultiplier: maxWin,
    winDistribution,
    avgCascades: totalCascades / numSpins,
  };
}

// ============================================
// CLI
// ============================================

function formatNumber(n: number, decimals: number = 2): string {
  return n.toLocaleString("en-US", { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
}

function printResults(result: SimulationResult): void {
  console.log("\n" + "=".repeat(60));
  console.log("  PLUFFY HIGH KITCHEN - RTP SIMULATION RESULTS");
  console.log("=".repeat(60) + "\n");

  console.log(`📊 SIMULATION PARAMETERS`);
  console.log(`   Spins:       ${result.spins.toLocaleString()}`);
  console.log(`   Total Bet:   ${formatNumber(result.totalBet)}`);
  console.log(`   Total Win:   ${formatNumber(result.totalWin)}`);
  console.log("");

  console.log(`🎰 KEY METRICS`);
  console.log(`   RTP:                 ${formatNumber(result.rtp)}%`);
  console.log(`   Hit Rate:            ${formatNumber(result.hitRate)}% (1 in ${Math.round(100 / result.hitRate)})`);
  console.log(`   Bonus Rate:          ${formatNumber(result.bonusRate)}% (1 in ${Math.round(100 / result.bonusRate)})`);
  console.log(`   Avg Win (when hit):  ${formatNumber(result.avgWinMultiplier)}x`);
  console.log(`   Max Win Observed:    ${formatNumber(result.maxWinMultiplier)}x`);
  console.log(`   Avg Cascades/Spin:   ${formatNumber(result.avgCascades)}`);
  console.log("");

  console.log(`📈 WIN DISTRIBUTION`);
  Object.entries(result.winDistribution).forEach(([range, count]) => {
    const pct = (count / result.spins) * 100;
    const bar = "█".repeat(Math.round(pct / 2));
    console.log(`   ${range.padEnd(8)} ${formatNumber(pct, 1).padStart(6)}% ${bar}`);
  });

  console.log("\n" + "=".repeat(60) + "\n");
}

// Main execution
const args = process.argv.slice(2);
const numSpins = parseInt(args[0]) || 100000;
const bet = parseInt(args[1]) || 10;

console.log(`\n🎲 Starting simulation: ${numSpins.toLocaleString()} spins @ ${bet} bet...\n`);

const startTime = Date.now();
const result = runSimulation(numSpins, bet, (progress) => {
  process.stdout.write(`\r   Progress: ${progress.toFixed(0)}%`);
});
const duration = (Date.now() - startTime) / 1000;

console.log(`\r   Completed in ${duration.toFixed(2)}s`);

printResults(result);

// Exit code based on RTP (for CI/CD)
const targetRTP = 96.5;
const tolerance = 2.0;
if (Math.abs(result.rtp - targetRTP) > tolerance) {
  console.log(`⚠️  RTP ${formatNumber(result.rtp)}% is outside target range (${targetRTP}% ± ${tolerance}%)`);
  process.exit(1);
} else {
  console.log(`✅ RTP ${formatNumber(result.rtp)}% is within target range`);
  process.exit(0);
}


