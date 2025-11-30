/**
 * WIN EVALUATION ENGINE - Cluster + Tumble Logic
 * Sweet Bonanza tarzı scatter-pay win detection
 */

import { 
  SymbolId, 
  getSymbolData, 
  getWinMultiplier,
  generateMultiplierValue,
} from "../config/symbolConfig";

// ============================================
// TYPES
// ============================================

export interface CellPosition {
  row: number;
  col: number;
}

export interface WinningCluster {
  id: number;
  symbolId: SymbolId;
  positions: CellPosition[];
  clusterSize: number;
  winAmount: number;          // Bet multiplier cinsinden
  appliedMultiplier: number;  // Bomb multiplier (başlangıçta 1)
}

export interface MultiplierOnBoard {
  row: number;
  col: number;
  value: number;
}

// Board: row-major, [row][col]
export type Board = (SymbolId | null)[][];

export interface EvaluateWinOptions {
  minClusterSize: number;  // Minimum 8 for Sweet Bonanza style
  betPerSpin: number;
}

export interface EvaluateWinResult {
  totalWin: number;
  winningClusters: WinningCluster[];
  finalBoard: Board;
  scatterCount: number;
  scatterPositions: CellPosition[];
  multipliers: MultiplierOnBoard[];
  totalMultiplierSum: number;
  cascadeCount: number;
}

// ============================================
// MAIN EVALUATION FUNCTION
// ============================================

/**
 * Ana fonksiyon: board'daki tüm cluster'ları bulur,
 * tumble uygular, total win'i hesaplar.
 */
export function evaluateWinWithTumble(
  board: Board,
  options: EvaluateWinOptions
): EvaluateWinResult {
  let workingBoard: Board = cloneBoard(board);
  const allClusters: WinningCluster[] = [];
  let totalWin = 0;
  let clusterId = 0;
  let cascadeCount = 0;

  // Scatter ve multiplier'ları topla
  const { scatterCount, scatterPositions, multipliers } = findSpecialSymbols(workingBoard);
  const totalMultiplierSum = multipliers.reduce((sum, m) => sum + m.value, 0);

  // Cascade loop
  while (true) {
    const { clusters, boardAfterRemoval } = findAndResolveClustersOnce(
      workingBoard,
      options,
      clusterId
    );

    if (clusters.length === 0) {
      break;
    }

    clusterId += clusters.length;
    cascadeCount++;
    
    // Gravity uygula
    workingBoard = applyGravity(boardAfterRemoval);

    // Bu cascade'in kazancını topla
    const stepWin = clusters.reduce((sum, c) => sum + c.winAmount, 0);
    totalWin += stepWin;
    allClusters.push(...clusters);
  }

  return {
    totalWin,
    winningClusters: allClusters,
    finalBoard: workingBoard,
    scatterCount,
    scatterPositions,
    multipliers,
    totalMultiplierSum,
    cascadeCount,
  };
}

/**
 * Sadece win check (tumble olmadan)
 */
export function evaluateWinOnce(
  board: Board,
  options: EvaluateWinOptions
): {
  hasWin: boolean;
  clusters: WinningCluster[];
  totalWinMultiplier: number;
  winningPositions: CellPosition[];
} {
  const { clusters } = findAndResolveClustersOnce(board, options, 0);
  const totalWinMultiplier = clusters.reduce((sum, c) => sum + c.winAmount, 0);
  
  const winningPositions: CellPosition[] = [];
  clusters.forEach(c => winningPositions.push(...c.positions));
  
  return {
    hasWin: clusters.length > 0,
    clusters,
    totalWinMultiplier,
    winningPositions,
  };
}

// ============================================
// CLUSTER FINDING
// ============================================

function findAndResolveClustersOnce(
  board: Board,
  options: EvaluateWinOptions,
  startClusterId: number
): {
  clusters: WinningCluster[];
  boardAfterRemoval: Board;
} {
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;
  
  // Her sembol türünün pozisyonlarını topla
  const symbolPositions = new Map<SymbolId, CellPosition[]>();
  
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const symbolId = board[r][c];
      if (!symbolId) continue;
      
      const config = getSymbolData(symbolId);
      
      // Bonus ve multiplier sembolleri cluster'a dahil değil
      if (config.type === "bonus" || config.type === "multiplier") {
        continue;
      }
      
      // Wild sembolleri ayrı tutulacak
      if (config.isWild) {
        continue;
      }
      
      const positions = symbolPositions.get(symbolId) || [];
      positions.push({ row: r, col: c });
      symbolPositions.set(symbolId, positions);
    }
  }
  
  // Her sembol için cluster kontrolü (8+ aynı sembol)
  const clusters: WinningCluster[] = [];
  const boardAfter = cloneBoard(board);
  let nextId = startClusterId;
  
  symbolPositions.forEach((positions, symbolId) => {
    if (positions.length >= options.minClusterSize) {
      const multiplier = getWinMultiplier(symbolId, positions.length);
      const winAmount = multiplier; // Bet ile çarpma SlotGame'de yapılacak
      
      clusters.push({
        id: nextId++,
        symbolId,
        positions: [...positions],
        clusterSize: positions.length,
        winAmount,
        appliedMultiplier: 1,
      });
      
      // Bu sembolleri board'dan kaldır
      for (const pos of positions) {
        boardAfter[pos.row][pos.col] = null;
      }
    }
  });
  
  return { clusters, boardAfterRemoval: boardAfter };
}

// ============================================
// SPECIAL SYMBOLS
// ============================================

function findSpecialSymbols(board: Board): {
  scatterCount: number;
  scatterPositions: CellPosition[];
  multipliers: MultiplierOnBoard[];
} {
  const scatterPositions: CellPosition[] = [];
  const multipliers: MultiplierOnBoard[] = [];
  
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;
  
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const symbolId = board[r][c];
      if (!symbolId) continue;
      
      const config = getSymbolData(symbolId);
      
      if (config.isBonus) {
        scatterPositions.push({ row: r, col: c });
      }
      
      if (config.type === "multiplier") {
        multipliers.push({
          row: r,
          col: c,
          value: generateMultiplierValue(), // Her multiplier için random değer
        });
      }
    }
  }
  
  return {
    scatterCount: scatterPositions.length,
    scatterPositions,
    multipliers,
  };
}

// ============================================
// GRAVITY / TUMBLE
// ============================================

function applyGravity(board: Board): Board {
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;
  const result = cloneBoard(board);

  for (let c = 0; c < numCols; c++) {
    let writeRow = numRows - 1;
    
    // Alttan yukarı tara
    for (let r = numRows - 1; r >= 0; r--) {
      if (result[r][c] !== null) {
        result[writeRow][c] = result[r][c];
        if (writeRow !== r) {
          result[r][c] = null;
        }
        writeRow--;
      }
    }
    
    // Üstte kalan boşluklar null kalsın
    for (let r = writeRow; r >= 0; r--) {
      result[r][c] = null;
    }
  }

  return result;
}

// ============================================
// BOARD UTILITIES
// ============================================

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

/**
 * Boş hücreleri yeni sembollerle doldur
 */
export function fillEmptyCells(
  board: Board,
  getNewSymbol: () => SymbolId
): {
  filledBoard: Board;
  newSymbolPositions: CellPosition[];
} {
  const result = cloneBoard(board);
  const newPositions: CellPosition[] = [];
  
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;
  
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (result[r][c] === null) {
        result[r][c] = getNewSymbol();
        newPositions.push({ row: r, col: c });
      }
    }
  }
  
  return {
    filledBoard: result,
    newSymbolPositions: newPositions,
  };
}

/**
 * Board'u SymbolId formatına çevir (legacy uyumluluk)
 */
export function convertLegacyBoard(
  legacyGrid: { symbol: { type: string } | null }[][]
): Board {
  return legacyGrid.map(row =>
    row.map(cell => {
      if (!cell.symbol) return null;
      // Legacy type'ı SymbolId'ye çevir
      const typeMap: Record<string, SymbolId> = {
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
      return typeMap[cell.symbol.type] || "cupcake";
    })
  );
}

// ============================================
// SCATTER TRIGGER CHECK
// ============================================

export function checkScatterTrigger(scatterCount: number): {
  triggered: boolean;
  freeSpins: number;
} {
  if (scatterCount >= 6) return { triggered: true, freeSpins: 20 };
  if (scatterCount >= 5) return { triggered: true, freeSpins: 15 };
  if (scatterCount >= 4) return { triggered: true, freeSpins: 10 };
  return { triggered: false, freeSpins: 0 };
}

export function checkRetrigger(scatterCount: number): {
  retriggered: boolean;
  additionalSpins: number;
} {
  if (scatterCount >= 3) {
    return { retriggered: true, additionalSpins: 5 };
  }
  return { retriggered: false, additionalSpins: 0 };
}

// ============================================
// WIN CATEGORY
// ============================================

export type WinCategory = "none" | "nice" | "big" | "mega" | "insane";

export function getWinCategory(winMultiplier: number): {
  category: WinCategory;
  label: string;
} {
  if (winMultiplier >= 100) return { category: "insane", label: "INSANE WIN!" };
  if (winMultiplier >= 50) return { category: "mega", label: "MEGA WIN!" };
  if (winMultiplier >= 10) return { category: "big", label: "BIG WIN!" };
  if (winMultiplier >= 1) return { category: "nice", label: "NICE WIN!" };
  return { category: "none", label: "" };
}

