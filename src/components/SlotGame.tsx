import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameBoard } from "./game/GameBoard";
import { GameControls } from "./game/GameControls";
import { GameStats } from "./game/GameStats";
import { FreeSpinsModal } from "./game/FreeSpinsModal";
import { WinDisplay } from "./game/WinDisplay";
import { toast } from "sonner";

export type Symbol = {
  id: string;
  type: "strawberry" | "grape" | "watermelon" | "orange" | "lemon" | "cherry" | "banana" | "plum" | "bomb";
  multiplier?: number;
};

export type Cell = {
  symbol: Symbol;
  isWinning: boolean;
  id: string;
};

export const SlotGame = () => {
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [totalWin, setTotalWin] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [freeSpins, setFreeSpins] = useState(0);
  const [freeSpinMultiplier, setFreeSpinMultiplier] = useState(1);
  const [showFreeSpinsModal, setShowFreeSpinsModal] = useState(false);
  const [currentWin, setCurrentWin] = useState(0);
  const [grid, setGrid] = useState<Cell[][]>([]);

  const ROWS = 5;
  const COLS = 6;

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
      "strawberry",
      "grape",
      "watermelon",
      "orange",
      "lemon",
      "cherry",
      "banana",
      "plum",
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

    if (freeSpins === 0) {
      setBalance(balance - bet);
    } else {
      setFreeSpins(freeSpins - 1);
    }

    // Generate new grid
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

    // Check for wins after spin animation
    setTimeout(() => {
      checkWins(newGrid);
    }, 1500);
  };

  const checkWins = async (currentGrid: Cell[][]) => {
    let hasWins = false;
    let winAmount = 0;
    let totalMultiplier = freeSpinMultiplier;
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell, isWinning: false })));

    // Count symbols
    const symbolCounts: { [key: string]: number } = {};
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
          symbolCounts[cell.symbol.type] = (symbolCounts[cell.symbol.type] || 0) + 1;
        }
      });
    });

    // Calculate bomb multipliers
    bombPositions.forEach(bomb => {
      totalMultiplier *= bomb.multiplier;
    });

    // Check for winning combinations (8+ matching symbols)
    Object.entries(symbolCounts).forEach(([symbolType, count]) => {
      if (count >= 8) {
        hasWins = true;
        winAmount += count * bet * 0.5;

        // Mark winning cells
        newGrid.forEach(row => {
          row.forEach(cell => {
            if (cell.symbol.type === symbolType) {
              cell.isWinning = true;
            }
          });
        });
      }
    });

    // Check for free spins trigger (4+ bombs)
    if (bombPositions.length >= 4 && freeSpins === 0) {
      setFreeSpins(10);
      setFreeSpinMultiplier(1);
      setShowFreeSpinsModal(true);
      toast.success("🎉 Free Spins Triggered!");
    }

    if (hasWins) {
      const finalWin = Math.floor(winAmount * totalMultiplier);
      setCurrentWin(finalWin);
      setTotalWin(totalWin + finalWin);
      setBalance(balance + finalWin);
      setGrid(newGrid);

      // Cascade after delay
      setTimeout(() => {
        handleCascade(newGrid);
      }, 1500);
    } else {
      setIsSpinning(false);
    }
  };

  const handleCascade = async (currentGrid: Cell[][]) => {
    const newGrid = currentGrid.map(row => [...row]);

    // Remove winning symbols
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

      // Fill empty spaces from top
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

    // Check for new wins
    setTimeout(() => {
      checkWins(newGrid);
    }, 800);
  };

  return (
    <div className="min-h-screen gradient-primary p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-center mb-8 text-glow"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🍓 Sweet Fruit Bonanza 🍇
        </motion.h1>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <Card className="p-6 gradient-board shadow-card border-border">
            <GameBoard grid={grid} isSpinning={isSpinning} />
            <GameControls
              balance={balance}
              bet={bet}
              setBet={setBet}
              onSpin={handleSpin}
              isSpinning={isSpinning}
              freeSpins={freeSpins}
            />
          </Card>

          <GameStats
            balance={balance}
            totalWin={totalWin}
            currentWin={currentWin}
            freeSpins={freeSpins}
            freeSpinMultiplier={freeSpinMultiplier}
          />
        </div>

        <WinDisplay currentWin={currentWin} />
      </motion.div>

      <FreeSpinsModal
        open={showFreeSpinsModal}
        onOpenChange={setShowFreeSpinsModal}
        freeSpins={10}
      />
    </div>
  );
};
