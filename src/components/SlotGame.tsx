import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GameBoard } from "./game/GameBoard";
import { Sidebar } from "./game/Sidebar";
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
      "purple",
      "grape", 
      "green",
      "red",
      "heart",
      "plum",
      "blue",
      "banana",
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

    // Count each symbol type
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

    // Calculate bomb multipliers
    bombPositions.forEach(bomb => {
      totalMultiplier *= bomb.multiplier;
    });

    // Check for winning combinations (8+ of the SAME symbol)
    Object.entries(symbolCounts).forEach(([symbolType, data]) => {
      if (data.count >= 8) {
        hasWins = true;
        // Progressive payout based on count
        const baseWin = bet * 0.5;
        winAmount += data.count * baseWin;

        // Mark winning cells for this specific symbol type
        data.positions.forEach(pos => {
          newGrid[pos.row][pos.col].isWinning = true;
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
      setLastSpinWin(prev => prev + finalWin);
      setTotalWin(totalWin + finalWin);
      setBalance(prev => prev + finalWin);
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

    // Remove winning symbols and drop down
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
    <div className="min-h-screen relative overflow-hidden"
         style={{
           backgroundImage: `url(${gameBackground})`,
           backgroundSize: "cover",
           backgroundPosition: "center",
           backgroundRepeat: "no-repeat"
         }}>
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="relative z-10 flex h-screen">
        {/* Left Sidebar */}
        <Sidebar
          balance={balance}
          bet={bet}
          setBet={setBet}
          freeSpins={freeSpins}
          freeSpinMultiplier={freeSpinMultiplier}
        />

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 pb-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <img 
              src={loadingLogo} 
              alt="Pluffy High Kitchen"
              className="h-24 md:h-32 w-auto drop-shadow-2xl"
              style={{
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(100,255,100,0.6))"
              }}
            />
          </motion.div>

          <GameBoard grid={grid} isSpinning={isSpinning} />
        </div>

        {/* Right decorative space */}
        <div className="w-24 hidden lg:block" />
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
