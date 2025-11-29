import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GameBoard } from "./game/GameBoard";
import { BottomBar } from "./game/BottomBar";
import { FreeSpinsModal } from "./game/FreeSpinsModal";
import { WinDisplay } from "./game/WinDisplay";
import { toast } from "sonner";
import gameBackground from "@/assets/game-background.png";
import loadingLogo from "@/assets/loading-logo.png";

export type Symbol = {
  id: string;
  type: "purple" | "grape" | "green" | "red" | "heart" | "plum" | "blue" | "banana" | "bomb";
  multiplier?: number;
};

export type Cell = {
  symbol: Symbol;
  isWinning: boolean;
  id: string;
};

export const SlotGame = () => {
  const [balance, setBalance] = useState(100000);
  const [bet, setBet] = useState(2);
  const [totalWin, setTotalWin] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [freeSpins, setFreeSpins] = useState(0);
  const [freeSpinMultiplier, setFreeSpinMultiplier] = useState(1);
  const [showFreeSpinsModal, setShowFreeSpinsModal] = useState(false);
  const [currentWin, setCurrentWin] = useState(0);
  const [lastSpinWin, setLastSpinWin] = useState(0);
  const [grid, setGrid] = useState<Cell[][]>([]);

  const ROWS = 4;
  const COLS = 5;

  // Paytable according to documentation
  const paytable = {
    purple: { 3: 5, 4: 25, 5: 100 },      // Pluffy Chef
    plum: { 3: 3, 4: 15, 5: 70 },         // Brownie Tray
    red: { 3: 2.5, 4: 12, 5: 60 },        // Pizza
    heart: { 3: 2, 4: 10, 5: 50 },        // Smoothie
    grape: { 3: 1.5, 4: 8, 5: 35 },       // Cookie Jar
    green: { 3: 1, 4: 5, 5: 20 },         // Muffin
    blue: { 3: 0.8, 4: 3, 5: 15 },        // Spatula
    banana: { 3: 0.5, 4: 2, 5: 10 },      // Rolling Pin
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid: Cell[][] = [];
    for (let row = 0; row < ROWS; row++) {
      const newRow: Cell[] = [];
      for (let col = 0; col < COLS; col++) {
        newRow.push({
          symbol: generateRandomSymbol(),
          isWinning: false,
          id: `${row}-${col}-${Date.now()}`,
        });
      }
      newGrid.push(newRow);
    }
    setGrid(newGrid);
  };

  const generateRandomSymbol = (allowBomb = false): Symbol => {
    const types: Symbol["type"][] = [
      "purple", "grape", "green", "red", "heart", "plum", "blue", "banana",
    ];
    
    if (allowBomb && Math.random() < 0.15) {
      return {
        id: Math.random().toString(36),
        type: "bomb",
        multiplier: Math.floor(Math.random() * 5) + 2,
      };
    }

    const randomType = types[Math.floor(Math.random() * types.length)];
    return {
      id: Math.random().toString(36),
      type: randomType,
    };
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    
    if (freeSpins === 0 && balance < bet) {
      toast.error("Insufficient balance!");
      return;
    }

    setIsSpinning(true);
    setCurrentWin(0);
    setLastSpinWin(0);

    if (freeSpins === 0) {
      setBalance(balance - bet);
    } else {
      setFreeSpins(freeSpins - 1);
    }

    const newGrid: Cell[][] = [];
    for (let row = 0; row < ROWS; row++) {
      const newRow: Cell[] = [];
      for (let col = 0; col < COLS; col++) {
        newRow.push({
          symbol: generateRandomSymbol(freeSpins > 0),
          isWinning: false,
          id: `${row}-${col}-${Date.now()}`,
        });
      }
      newGrid.push(newRow);
    }
    setGrid(newGrid);

    setTimeout(() => {
      checkWins(newGrid);
    }, 1500);
  };

  const checkWins = async (currentGrid: Cell[][]) => {
    let hasWins = false;
    let winAmount = 0;
    let totalMultiplier = freeSpinMultiplier;
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell, isWinning: false })));

    // Count each symbol type with positions
    const symbolCounts: { [key: string]: { count: number; positions: { row: number; col: number }[] } } = {};
    const bombPositions: { row: number; col: number; multiplier: number }[] = [];

    currentGrid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.symbol.type === "bomb") {
          bombPositions.push({
            row: rowIndex,
            col: colIndex,
            multiplier: cell.symbol.multiplier || 2,
          });
        } else {
          if (!symbolCounts[cell.symbol.type]) {
            symbolCounts[cell.symbol.type] = { count: 0, positions: [] };
          }
          symbolCounts[cell.symbol.type].count++;
          symbolCounts[cell.symbol.type].positions.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    // Apply bomb multipliers
    bombPositions.forEach(bomb => {
      totalMultiplier *= bomb.multiplier;
    });

    // Check wins using paytable (3, 4, or 5 of a kind)
    Object.entries(symbolCounts).forEach(([symbolType, data]) => {
      const count = data.count;
      const payouts = paytable[symbolType as keyof typeof paytable];
      
      if (payouts) {
        let payout = 0;
        if (count >= 5) payout = payouts[5];
        else if (count >= 4) payout = payouts[4];
        else if (count >= 3) payout = payouts[3];
        
        if (payout > 0) {
          hasWins = true;
          winAmount += payout * bet;
          
          // Mark winning cells
          data.positions.forEach(pos => {
            newGrid[pos.row][pos.col].isWinning = true;
          });
        }
      }
    });

    // Check for Overbaked Spins trigger (3+ ovens)
    if (bombPositions.length >= 3 && freeSpins === 0) {
      setFreeSpins(10);
      setFreeSpinMultiplier(1);
      setShowFreeSpinsModal(true);
      toast.success("🎉 Overbaked Spins Triggered!");
    }

    if (hasWins) {
      const finalWin = Math.floor(winAmount * totalMultiplier);
      setCurrentWin(finalWin);
      setLastSpinWin(prev => prev + finalWin);
      setTotalWin(totalWin + finalWin);
      setBalance(prev => prev + finalWin);
      setGrid(newGrid);

      setTimeout(() => {
        handleCascade(newGrid);
      }, 1500);
    } else {
      setIsSpinning(false);
    }
  };

  const handleCascade = async (currentGrid: Cell[][]) => {
    const newGrid = currentGrid.map(row => [...row]);

    for (let col = 0; col < COLS; col++) {
      let writePos = ROWS - 1;
      
      for (let row = ROWS - 1; row >= 0; row--) {
        if (!newGrid[row][col].isWinning) {
          if (writePos !== row) {
            newGrid[writePos][col] = { ...newGrid[row][col], id: `${writePos}-${col}-${Date.now()}` };
          }
          writePos--;
        }
      }

      while (writePos >= 0) {
        newGrid[writePos][col] = {
          symbol: generateRandomSymbol(freeSpins > 0),
          isWinning: false,
          id: `${writePos}-${col}-${Date.now()}`,
        };
        writePos--;
      }
    }

    setGrid(newGrid);

    setTimeout(() => {
      checkWins(newGrid);
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
         style={{
           backgroundImage: `url(${gameBackground})`,
           backgroundSize: "cover",
           backgroundPosition: "center",
           backgroundRepeat: "no-repeat"
         }}>
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-20 pb-40">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <img 
            src={loadingLogo} 
            alt="Pluffy High Kitchen"
            className="h-20 w-auto drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(100,255,100,0.6))"
            }}
          />
        </motion.div>

        {/* Game Board */}
        <GameBoard grid={grid} isSpinning={isSpinning} />
      </div>

      {/* Bottom Bar */}
      <BottomBar
        balance={balance}
        bet={bet}
        onSpin={handleSpin}
        isSpinning={isSpinning}
        lastSpinWin={lastSpinWin}
      />

      <WinDisplay currentWin={currentWin} />

      <FreeSpinsModal
        open={showFreeSpinsModal}
        onOpenChange={setShowFreeSpinsModal}
        freeSpins={10}
      />
    </div>
  );
};
