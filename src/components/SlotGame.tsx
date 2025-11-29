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
    // RTP 96.5'e göre ağırlıklandırılmış sembol dağılımı
    // En pahalı semboller en az, en ucuz semboller en çok gelir
    const weightedSymbols = [
      // Premium (Chef) - En az %5
      ...Array(5).fill("purple"),
      
      // High symbols - %10
      ...Array(10).fill("plum"),
      ...Array(10).fill("red"),
      
      // Mid symbols - %20
      ...Array(20).fill("heart"),
      ...Array(20).fill("grape"),
      
      // Low symbols - %35 (En çok)
      ...Array(35).fill("green"),
      ...Array(35).fill("blue"),
      ...Array(35).fill("banana"),
    ];
    
    if (allowBomb && Math.random() < 0.15) {
      return {
        id: Math.random().toString(36),
        type: "bomb",
        multiplier: Math.floor(Math.random() * 5) + 2,
      };
    }

    const randomType = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)] as Symbol["type"];
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

    // ASLA yeni grid oluşturma! Sadece mevcut grid'in sembollerini değiştir
    const updatedGrid = grid.map((row, rowIndex) => 
      row.map((cell, colIndex) => ({
        ...cell,
        symbol: generateRandomSymbol(freeSpins > 0),
        isWinning: false,
        id: `${rowIndex}-${colIndex}-${Date.now()}` // ID değiştir ki React animasyon yapsın
      }))
    );
    
    setGrid(updatedGrid);

    setTimeout(() => {
      setIsSpinning(false);
      checkWins(updatedGrid);
    }, 800);
  };

  const checkWins = async (currentGrid: Cell[][]) => {
    let hasWins = false;
    let winAmount = 0;
    let totalMultiplier = freeSpinMultiplier;
    
    // ÖNEMLİ: Mevcut grid'i kullan, isWinning durumunu korumadan yeni hesapla
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));

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

    // Apply bomb multipliers
    bombPositions.forEach(bomb => {
      totalMultiplier *= bomb.multiplier;
    });

    // SWEET BONANZA STYLE: 8+ of SAME symbol anywhere = WIN
    // Daha gerçekçi paytable - sadece 8-9 symbol çok az kazanç verir
    const symbolValues: { [key: string]: { [count: number]: number } } = {
      purple: { 8: 0.5, 9: 0.7, 10: 1.2, 11: 2.0, 12: 3.5, 13: 6.0, 14: 10.0, 15: 20.0 },
      plum: { 8: 0.4, 9: 0.6, 10: 1.0, 11: 1.5, 12: 2.5, 13: 4.0, 14: 7.0, 15: 15.0 },
      red: { 8: 0.35, 9: 0.5, 10: 0.9, 11: 1.3, 12: 2.2, 13: 3.5, 14: 6.0, 15: 12.0 },
      heart: { 8: 0.3, 9: 0.45, 10: 0.8, 11: 1.2, 12: 2.0, 13: 3.0, 14: 5.0, 15: 10.0 },
      grape: { 8: 0.25, 9: 0.4, 10: 0.7, 11: 1.0, 12: 1.7, 13: 2.5, 14: 4.0, 15: 8.0 },
      green: { 8: 0.2, 9: 0.3, 10: 0.5, 11: 0.8, 12: 1.3, 13: 2.0, 14: 3.0, 15: 6.0 },
      blue: { 8: 0.15, 9: 0.25, 10: 0.4, 11: 0.7, 12: 1.2, 13: 1.8, 14: 2.5, 15: 5.0 },
      banana: { 8: 0.1, 9: 0.2, 10: 0.35, 11: 0.6, 12: 1.0, 13: 1.5, 14: 2.0, 15: 4.0 },
    };

    Object.entries(symbolCounts).forEach(([symbolType, data]) => {
      if (data.count >= 8) {
        hasWins = true;
        // Count'a göre kazanç - 8-9 sembol çok az kazanç verir
        const payoutMultiplier = symbolValues[symbolType]?.[data.count] || 
                                 symbolValues[symbolType]?.[15] || 0.1;
        winAmount += bet * payoutMultiplier;

        // Mark ALL matching symbols as winning
        data.positions.forEach(pos => {
          newGrid[pos.row][pos.col].isWinning = true;
        });
      }
    });

    // Check for free spins (4+ bombs)
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

      setTimeout(() => {
        handleCascade(newGrid);
      }, 600);
    } else {
      setIsSpinning(false);
    }
  };

  const handleCascade = async (currentGrid: Cell[][]) => {
    // Adım 1: Kazanan pozisyonları NULL yap (data-level'da)
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (currentGrid[row][col].isWinning) {
          currentGrid[row][col].symbol = null as any;
          currentGrid[row][col].isWinning = false;
        }
      }
    }

    // Adım 2: Her KOLONDA gravity uygula (column-based)
    for (let col = 0; col < COLS; col++) {
      // Bu kolondaki non-null sembolleri topla (ALTTAN YUKARIYA)
      const columnSymbols: Symbol[] = [];
      for (let row = ROWS - 1; row >= 0; row--) {
        if (currentGrid[row][col].symbol !== null) {
          columnSymbols.push(currentGrid[row][col].symbol);
        }
      }
      
      // Kaç boş yer var?
      const emptyCount = ROWS - columnSymbols.length;
      
      // Yeni kolonu oluştur: [yeni semboller (üst), mevcut semboller (alt)]
      const newColumn: Symbol[] = [];
      
      // Üstte yeni semboller spawn et
      for (let i = 0; i < emptyCount; i++) {
        newColumn.push(generateRandomSymbol(freeSpins > 0));
      }
      
      // Alttan itibaren mevcut sembolleri yerleştir
      for (let i = columnSymbols.length - 1; i >= 0; i--) {
        newColumn.push(columnSymbols[i]);
      }
      
      // Kolonu grid'e yaz - SADECE symbol'leri değiştir
      for (let row = 0; row < ROWS; row++) {
        currentGrid[row][col].symbol = newColumn[row];
      }
    }

    // React'ı güncelle
    setGrid([...currentGrid]);

    // Yeni win kontrolü
    setTimeout(() => {
      checkWins(currentGrid);
    }, 400);
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
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-8 pb-40">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <img 
              src={loadingLogo} 
              alt="Pluffy High Kitchen"
              className="h-24 md:h-28 w-auto drop-shadow-2xl"
              style={{
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(100,255,100,0.6))"
              }}
            />
          </motion.div>

          <GameBoard grid={grid} isSpinning={isSpinning} />
        </div>
      </div>

      <BottomBar
        balance={balance}
        bet={bet}
        onSpin={handleSpin}
        isSpinning={isSpinning}
        lastSpinWin={lastSpinWin}
      />

      <WinDisplay currentWin={currentWin} onDismiss={() => setCurrentWin(0)} />

      <FreeSpinsModal
        open={showFreeSpinsModal}
        onOpenChange={setShowFreeSpinsModal}
        freeSpins={10}
      />
    </div>
  );
};
