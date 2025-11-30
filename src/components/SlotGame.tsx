import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameBoard } from "./game/GameBoard";
import { FreeSpinsModal } from "./game/FreeSpinsModal";
import { FreeSpinsEndModal } from "./game/FreeSpinsEndModal";
import { BuyBonusModal } from "./game/BuyBonusModal";
import { WinDisplay } from "./game/WinDisplay";
import { WinBreakdownPanel, WinLine, WinBreakdown } from "./game/WinBreakdownPanel";
import { WinAnimations } from "./game/WinAnimations";
import { SoundManager } from "@/game/SoundManager";
import { toast } from "sonner";
// Import from centralized symbol config
import { 
  getWinMultiplier, 
  legacyTypeToSymbolId, 
  getSymbolDisplayName,
  SYMBOL_LABELS,
  LEGACY_TYPE_TO_SYMBOL_ID,
} from "@/game/config/symbolConfig";
import gameBackground from "@/assets/game-background.png";
import loadingLogoNew from "@/assets/loading-logo-new.png";
import btnSpinNormal from "@/assets/btn-spin-normal.png";
import btnSpinPressed from "@/assets/btn-spin-pressed.png";
import btnSquareNormal from "@/assets/btn-square-normal.png";
import btnIconInfo from "@/assets/btn-icon-info.png";
import btnIconSettings from "@/assets/btn-icon-settings.png";
import btnRectNormal from "@/assets/btn-rect-normal.png";
import btnRectHover from "@/assets/btn-rect-hover.png";
import btnRectPressed from "@/assets/btn-rect-pressed.png";
import btnTextBuyBonus from "@/assets/btn-text-buybonus.png";
import btnTextFreeSpins from "@/assets/btn-text-freespins.png";
import btnTextAuto from "@/assets/btn-text-auto.png";
// Import centralized timing config
import { animationTimings, wait as waitMs } from "@/game/config/spinConfig";

// ==================== TIMING CONFIG (from spinConfig.ts) ====================
// These values are now sourced from the centralized config
const SPIN_TIMING = {
  minSpinDurationMs: animationTimings.minSpinDurationMs,
  cascadeDelayMs: animationTimings.cascadeDelayMs,
  symbolDropMs: animationTimings.symbolDropMs,
  symbolSpawnMs: animationTimings.symbolSpawnMs,
  winPauseMs: animationTimings.winPauseMs,
  winHighlightMs: animationTimings.winHighlightMs,
  symbolFadeOutMs: animationTimings.symbolFadeOutMs,
  popAnimationMs: animationTimings.popDurationMs,
  multiplierDropMs: animationTimings.multiplierDropMs,
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type Symbol = {
  id: string;
  type: "purple" | "grape" | "green" | "red" | "heart" | "plum" | "blue" | "banana" | "scatter" | "multiplier";
  multiplier?: number;
};

export type CellState = "idle" | "winning" | "popping" | "falling" | "spawning";

export type Cell = {
  symbol: Symbol | null;
  state: CellState;
  id: string;
  fallDistance?: number;
};

export type GameMode = "base" | "freespins";

const BET_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

// Symbol labels now imported from symbolConfig
// Legacy labels for backward compatibility during transition
const LEGACY_SYMBOL_LABELS: Record<string, string> = {
  purple: "Pluffy Chef", plum: "Brownie", red: "Pizza", heart: "Smoothie",
  grape: "Cookie", green: "Muffin", blue: "Spatula", banana: "Rolling Pin",
  scatter: "Oven", multiplier: "Multiplier",
};

// Hook for detecting mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

// Cascade History Item Component (Sweet Bonanza style)
interface CascadeItem {
  id: string;
  symbolLabel: string;
  count: number;
  payout: number;
}

const CascadeHistoryBox = ({ items, currencySymbol = "₺" }: { items: CascadeItem[]; currencySymbol?: string }) => {
  if (items.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        position: "absolute",
        left: "clamp(8px, 2vw, 16px)",
        bottom: "clamp(140px, 22vh, 180px)",
        width: "clamp(140px, 35vw, 180px)",
        maxHeight: "clamp(120px, 20vh, 160px)",
        padding: "clamp(8px, 1.5vw, 12px)",
        borderRadius: "clamp(10px, 2vw, 14px)",
        background: "linear-gradient(180deg, rgba(37, 16, 61, 0.95), rgba(18, 7, 34, 0.98))",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(124, 255, 163, 0.2)",
        border: "1px solid rgba(124, 255, 163, 0.3)",
        zIndex: 40,
        overflowY: "auto",
      }}
    >
      <div style={{ fontSize: "clamp(8px, 2vw, 10px)", fontWeight: 700, color: "#ffe898", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Cascades
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {items.slice(-5).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "clamp(9px, 2.2vw, 11px)",
              padding: "4px 6px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ color: "#f7f2ff" }}>{item.count}x {item.symbolLabel.split(' ')[0]}</span>
            <span style={{ color: "#7dff70", fontWeight: 600 }}>{currencySymbol}{item.payout.toFixed(0)}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export const SlotGame = () => {
  // Loading screen state
  const [isLoading, setIsLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  
  const [balance, setBalance] = useState(100000);
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCascading, setIsCascading] = useState(false);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameMode, setGameMode] = useState<GameMode>("base");
  
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [freeSpinsTotal, setFreeSpinsTotal] = useState(0);
  const [freeSpinsTotalWin, setFreeSpinsTotalWin] = useState(0);
  const [showFreeSpinsModal, setShowFreeSpinsModal] = useState(false);
  const [showFreeSpinsEndModal, setShowFreeSpinsEndModal] = useState(false);
  const [pendingFreeSpins, setPendingFreeSpins] = useState(0);
  
  const [currentWin, setCurrentWin] = useState(0);
  const [lastSpinWin, setLastSpinWin] = useState(0);
  
  const [showBuyBonusModal, setShowBuyBonusModal] = useState(false);
  
  const [buyBonusHover, setBuyBonusHover] = useState(false);
  const [buyBonusPressed, setBuyBonusPressed] = useState(false);
  const [superFreeSpinsHover, setSuperFreeSpinsHover] = useState(false);
  const [superFreeSpinsPressed, setSuperFreeSpinsPressed] = useState(false);
  
  const [winBreakdown, setWinBreakdown] = useState<WinBreakdown>([]);
  const [cascadeHistory, setCascadeHistory] = useState<CascadeItem[]>([]);
  
  // Autoplay state
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [autoplaySpinsRemaining, setAutoplaySpinsRemaining] = useState(0);
  
  // Win FX animation state
  const [showWinFx, setShowWinFx] = useState(false);
  const [showBigWin, setShowBigWin] = useState(false);
  const tumbleIndexRef = useRef(0);
  const spinIdRef = useRef(0);
  const spinStartTimeRef = useRef(0);
  
  const cascadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const freeSpinsRemainingRef = useRef(0);
  const gameModeRef = useRef<GameMode>("base");
  const isProcessingRef = useRef(false);
  const freeSpinsTotalWinRef = useRef(0);
  
  const currentSpinBaseWinRef = useRef(0);
  const collectedMultipliersRef = useRef<number[]>([]);
  const betRef = useRef(bet);
  const pendingFreeSpinsRef = useRef(0);
  const balanceRef = useRef(balance);

  const isMobile = useIsMobile();

  const [musicStarted, setMusicStarted] = useState(false);
  const gameMusicRef = useRef<HTMLAudioElement | null>(null);

  // Initialize game music - plays throughout the entire game session
  useEffect(() => {
    // Create game music audio element
    const audio = new Audio("/sounds/budur.mp3");
    audio.loop = true; // Loop continuously
    audio.volume = 0.7;
    gameMusicRef.current = audio;
    
    // Try to auto-play
    audio.play().then(() => {
      setMusicStarted(true);
    }).catch(() => {
      // Browser blocked autoplay - will need user interaction
      // We'll try again on first user interaction
    });
    
    // Cleanup on unmount
    return () => {
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
        gameMusicRef.current.currentTime = 0;
      }
    };
  }, []);
  
  // Try to start music on first user interaction if autoplay was blocked
  useEffect(() => {
    if (musicStarted) return;
    
    const startMusicOnInteraction = () => {
      if (gameMusicRef.current && !musicStarted) {
        gameMusicRef.current.play().then(() => {
          setMusicStarted(true);
        }).catch(() => {});
      }
    };
    
    document.addEventListener('click', startMusicOnInteraction, { once: true });
    document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', startMusicOnInteraction);
      document.removeEventListener('touchstart', startMusicOnInteraction);
    };
  }, [musicStarted]);

  useEffect(() => { freeSpinsRemainingRef.current = freeSpinsRemaining; }, [freeSpinsRemaining]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  useEffect(() => { freeSpinsTotalWinRef.current = freeSpinsTotalWin; }, [freeSpinsTotalWin]);
  useEffect(() => { betRef.current = bet; }, [bet]);
  useEffect(() => { pendingFreeSpinsRef.current = pendingFreeSpins; }, [pendingFreeSpins]);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  
  // Handle entering game (dismiss loading screen) - music continues playing
  const handleEnterGame = useCallback(() => {
    // Try to start music if not already playing (for browsers that blocked autoplay)
    if (gameMusicRef.current && !musicStarted) {
      gameMusicRef.current.play().then(() => {
        setMusicStarted(true);
      }).catch(() => {});
    }
    setIsLoading(false);
  }, [musicStarted]);
  
  // Toggle game music on/off
  const handleToggleSound = useCallback(() => {
    if (gameMusicRef.current) {
      if (isSoundMuted) {
        // Unmute - resume playing
        gameMusicRef.current.play().catch(() => {});
        setIsSoundMuted(false);
      } else {
        // Mute - pause music
        gameMusicRef.current.pause();
        setIsSoundMuted(true);
      }
    }
  }, [isSoundMuted]);

  const ROWS = 5;
  const COLS = 6;

  const generateRandomSymbol = useCallback((isFreeSpinMode = false): Symbol => {
    const rand = Math.random() * 100;
    if (isFreeSpinMode && rand < 5) {
      const multRand = Math.random() * 100;
      let value = 2;
      if (multRand < 40) value = 2; else if (multRand < 65) value = 3; else if (multRand < 80) value = 5;
      else if (multRand < 90) value = 10; else if (multRand < 95) value = 15; else if (multRand < 98) value = 25;
      else if (multRand < 99.5) value = 50; else value = 100;
      return { id: Math.random().toString(36), type: "multiplier", multiplier: value };
    }
    if (!isFreeSpinMode && rand < 2) return { id: Math.random().toString(36), type: "scatter" };
    const symbolRand = Math.random() * 100;
    if (symbolRand < 4) return { id: Math.random().toString(36), type: "purple" };
    if (symbolRand < 11) return { id: Math.random().toString(36), type: "plum" };
    if (symbolRand < 20) return { id: Math.random().toString(36), type: "red" };
    if (symbolRand < 34) return { id: Math.random().toString(36), type: "heart" };
    if (symbolRand < 48) return { id: Math.random().toString(36), type: "grape" };
    if (symbolRand < 65) return { id: Math.random().toString(36), type: "green" };
    if (symbolRand < 82) return { id: Math.random().toString(36), type: "blue" };
    return { id: Math.random().toString(36), type: "banana" };
  }, []);

  const generateGrid = useCallback((isFreeSpinMode: boolean): Cell[][] => {
    const newGrid: Cell[][] = []; const symbolCounts: Record<string, number> = {};
    const winChance = isFreeSpinMode ? 0.35 : 0.25; const shouldWin = Math.random() < winChance;
    for (let r = 0; r < ROWS; r++) { const row: Cell[] = []; for (let c = 0; c < COLS; c++) { row.push({ symbol: null as any, state: "spawning", id: `${r}-${c}-${Date.now()}-${Math.random()}`, fallDistance: r + 1 }); } newGrid.push(row); }
    if (shouldWin) {
      const winTypes: Symbol["type"][] = ["banana", "blue", "green", "grape", "heart", "red", "plum", "purple"];
      const weights = [25, 20, 18, 12, 10, 8, 5, 2]; let randWin = Math.random() * weights.reduce((a, b) => a + b, 0); let winSymbol: Symbol["type"] = "banana";
      for (let i = 0; i < winTypes.length; i++) { randWin -= weights[i]; if (randWin <= 0) { winSymbol = winTypes[i]; break; } }
      const winCount = 8 + Math.floor(Math.random() * 4); const positions: number[] = [];
      for (let i = 0; i < ROWS * COLS; i++) positions.push(i);
      for (let i = positions.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [positions[i], positions[j]] = [positions[j], positions[i]]; }
      for (let i = 0; i < winCount; i++) { const pos = positions[i]; const r = Math.floor(pos / COLS), c = pos % COLS; newGrid[r][c].symbol = { id: Math.random().toString(36), type: winSymbol }; symbolCounts[winSymbol] = (symbolCounts[winSymbol] || 0) + 1; }
      for (let i = winCount; i < positions.length; i++) { const pos = positions[i]; const r = Math.floor(pos / COLS), c = pos % COLS; let sym = generateRandomSymbol(isFreeSpinMode); let attempts = 0; while ((symbolCounts[sym.type] || 0) >= 7 && attempts < 20) { sym = generateRandomSymbol(isFreeSpinMode); attempts++; } symbolCounts[sym.type] = (symbolCounts[sym.type] || 0) + 1; newGrid[r][c].symbol = sym; }
    } else { for (let r = 0; r < ROWS; r++) { for (let c = 0; c < COLS; c++) { let sym = generateRandomSymbol(isFreeSpinMode); let attempts = 0; while ((symbolCounts[sym.type] || 0) >= 7 && attempts < 20) { sym = generateRandomSymbol(isFreeSpinMode); attempts++; } symbolCounts[sym.type] = (symbolCounts[sym.type] || 0) + 1; newGrid[r][c].symbol = sym; } } }
    return newGrid;
  }, [generateRandomSymbol]);

  const initializeGrid = useCallback(() => { const newGrid: Cell[][] = []; for (let row = 0; row < ROWS; row++) { const newRow: Cell[] = []; for (let col = 0; col < COLS; col++) { newRow.push({ symbol: generateRandomSymbol(false), state: "idle", id: `${row}-${col}-init-${Math.random()}` }); } newGrid.push(newRow); } setGrid(newGrid); }, [generateRandomSymbol]);
  useEffect(() => { initializeGrid(); }, [initializeGrid]);

  // Paytable now comes from centralized symbolConfig
  // This wrapper converts legacy types to new SymbolIds for the lookup
  const getPayoutMultiplier = (symbolType: string, count: number): number => {
    const symbolId = legacyTypeToSymbolId(symbolType);
    return getWinMultiplier(symbolId, count);
  };
  
  // Get display label for a symbol (supports both legacy and new types)
  const getSymbolLabel = (symbolType: string): string => {
    return LEGACY_SYMBOL_LABELS[symbolType] || symbolType;
  };

  const endFreeSpins = useCallback(() => { 
    setShowFreeSpinsEndModal(true); 
    setGameMode("base"); 
    gameModeRef.current = "base"; 
    setFreeSpinsRemaining(0); 
    freeSpinsRemainingRef.current = 0; 
    setFreeSpinsTotal(0); 
    collectedMultipliersRef.current = [];
    isProcessingRef.current = false; 
    setWinBreakdown([]); 
    setCascadeHistory([]);
  }, []);
  
  const handleFreeSpinsEndClose = useCallback(() => { 
    setShowFreeSpinsEndModal(false); 
    setFreeSpinsTotalWin(0); 
    freeSpinsTotalWinRef.current = 0; 
  }, []);

  // Use a ref for finishSpinCycle to avoid stale closure issues
  const finishSpinCycleRef = useRef<() => Promise<void>>();
  
  const finishSpinCycle = useCallback(async () => {
    setIsCascading(false); 
    isProcessingRef.current = false;
    
    const baseWin = currentSpinBaseWinRef.current;
    const multipliers = collectedMultipliersRef.current;
    const multiplierSum = multipliers.length > 0 ? multipliers.reduce((a, b) => a + b, 0) : 1;
    const finalWin = Math.round(baseWin * multiplierSum * 100) / 100;
    
    console.log("=== FINISH SPIN CYCLE ===");
    console.log("Base Win:", baseWin);
    console.log("Multiplier Sum:", multiplierSum);
    console.log("Final Win:", finalWin);
    console.log("Current Balance (ref):", balanceRef.current);
    
    if (finalWin > 0) { 
      // Sound effects disabled - only background music plays
      // SoundManager.stop("spin_start");
      // SoundManager.stop("reel_tumble");
      // if (finalWin >= betRef.current * 20) { SoundManager.play("win_big"); } else { SoundManager.play("win_small"); }
      
      // Trigger BigWin animation for large wins (10x+ bet)
      if (finalWin >= betRef.current * 10) {
        setShowBigWin(true);
        setTimeout(() => setShowBigWin(false), 3000); // Show for 3 seconds
      }
      
      // Update win displays
      setCurrentWin(finalWin); 
      setLastSpinWin(finalWin); 
      
      // CRITICAL: Add win to balance
      setBalance(prevBalance => {
        const newBalance = prevBalance + finalWin;
        console.log("BALANCE UPDATE:", prevBalance, "+", finalWin, "=", newBalance);
        balanceRef.current = newBalance; // Keep ref in sync
        return newBalance;
      }); 
      
      // Update free spins total if in free spins mode
      if (gameModeRef.current === "freespins") { 
        setFreeSpinsTotalWin(prev => { 
          const newTotal = prev + finalWin; 
          freeSpinsTotalWinRef.current = newTotal; 
          return newTotal; 
        }); 
      } 
      
      await wait(SPIN_TIMING.winPauseMs);
    } else {
      // No win - just reset last spin win display
      setLastSpinWin(0);
    }
    
    // Reset accumulators for next spin
    currentSpinBaseWinRef.current = 0;
    collectedMultipliersRef.current = [];
    
    // Check for pending free spins trigger
    if (pendingFreeSpinsRef.current > 0 && gameModeRef.current === "base") { 
      // SoundManager.play("free_spins_start"); // Sound effects disabled
      setShowFreeSpinsModal(true); 
      return; 
    }
    
    // Continue free spins if in free spins mode
    if (gameModeRef.current === "freespins") { 
      const remaining = freeSpinsRemainingRef.current; 
      if (remaining > 0) { 
    setTimeout(() => {
          if (gameModeRef.current === "freespins" && freeSpinsRemainingRef.current > 0) { 
            triggerFreeSpin(); 
          } 
        }, finalWin > betRef.current * 10 ? 1000 : 600); 
      } else { 
        setTimeout(() => { endFreeSpins(); }, 800); 
      } 
    }
  }, [endFreeSpins]);
  
  // Keep the ref updated
  useEffect(() => {
    finishSpinCycleRef.current = finishSpinCycle;
  }, [finishSpinCycle]);

  const checkWins = useCallback((currentGrid: Cell[][]) => {
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
    const symbolCounts: Record<string, { count: number; positions: { row: number; col: number }[] }> = {};
    const scatterPositions: { row: number; col: number }[] = []; 
    const newMultipliers: number[] = [];

    currentGrid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (!cell.symbol) return; 
        if (cell.symbol.type === "scatter") scatterPositions.push({ row: rowIndex, col: colIndex }); 
        else if (cell.symbol.type === "multiplier") newMultipliers.push(cell.symbol.multiplier || 2); 
        else { 
          if (!symbolCounts[cell.symbol.type]) symbolCounts[cell.symbol.type] = { count: 0, positions: [] }; 
          symbolCounts[cell.symbol.type].count++;
          symbolCounts[cell.symbol.type].positions.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    if (newMultipliers.length > 0) { 
      // SoundManager.play("bomb_explode"); // Sound effects disabled
      collectedMultipliersRef.current = [...collectedMultipliersRef.current, ...newMultipliers];
    }
    
    let hasWins = false; 
    let cascadeWin = 0; 
    const newBreakdownLines: WinLine[] = [];
    const currentBet = betRef.current;

    Object.entries(symbolCounts).forEach(([symbolType, data]) => {
      if (data.count >= 8) {
        hasWins = true;
        const payout = currentBet * getPayoutMultiplier(symbolType, data.count); 
        cascadeWin += payout; 
        data.positions.forEach(pos => { newGrid[pos.row][pos.col].state = "winning"; }); 
        const breakdownLine = { 
          id: `${spinIdRef.current}-${tumbleIndexRef.current}-${symbolType}`, 
          symbolId: symbolType, 
          symbolLabel: getSymbolLabel(symbolType), 
          count: data.count, 
          payout: payout 
        };
        newBreakdownLines.push(breakdownLine);
        // Add to cascade history
        setCascadeHistory(prev => [...prev, breakdownLine]);
      } 
    });
    
    if (newBreakdownLines.length > 0) { 
      setWinBreakdown(prev => [...prev, ...newBreakdownLines]); 
      tumbleIndexRef.current++; 
    }
    
    if (cascadeWin > 0) {
      currentSpinBaseWinRef.current += cascadeWin;
      console.log("Win detected:", cascadeWin, "Total base win:", currentSpinBaseWinRef.current);
    }
    
    if (gameModeRef.current === "base" && scatterPositions.length >= 4 && pendingFreeSpinsRef.current === 0) { 
      const spinsToAward = scatterPositions.length === 4 ? 10 : scatterPositions.length === 5 ? 15 : 20; 
      setPendingFreeSpins(spinsToAward); 
      pendingFreeSpinsRef.current = spinsToAward;
      scatterPositions.forEach(pos => { newGrid[pos.row][pos.col].state = "winning"; }); 
      hasWins = true; 
    }
    
    if (gameModeRef.current === "freespins" && scatterPositions.length >= 3) { 
      setFreeSpinsRemaining(prev => prev + 5); 
      freeSpinsRemainingRef.current += 5; 
      setFreeSpinsTotal(prev => prev + 5); 
      toast.success("🎉 +5 Free Spins!"); 
      scatterPositions.forEach(pos => { newGrid[pos.row][pos.col].state = "winning"; }); 
    }
    
    if (hasWins) { 
      // Sound effects disabled - only background music plays
      // SoundManager.stop("spin_start");
      // SoundManager.stop("reel_tumble");
      
      // Show win FX animation
      setShowWinFx(true);
      setTimeout(() => setShowWinFx(false), 1200); // Hide after animation
      
      setGrid(newGrid); 
      setIsCascading(true); 
      cascadeTimeoutRef.current = setTimeout(() => { 
        // SoundManager.play("symbol_pop"); // Sound effects disabled
        const poppingGrid = newGrid.map(row => row.map(cell => ({ ...cell, state: cell.state === "winning" ? "popping" as CellState : cell.state }))); 
        setGrid(poppingGrid); 
        cascadeTimeoutRef.current = setTimeout(() => { handleCascade(poppingGrid); }, SPIN_TIMING.popAnimationMs); 
      }, SPIN_TIMING.winHighlightMs); 
    } else { 
      // Use ref to always get latest finishSpinCycle
      if (finishSpinCycleRef.current) {
        finishSpinCycleRef.current();
      }
    }
  }, []);

  const handleCascade = useCallback((currentGrid: Cell[][]) => {
    // SoundManager.play("reel_tumble"); // Sound effects disabled
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
    for (let row = 0; row < ROWS; row++) { for (let col = 0; col < COLS; col++) { if (newGrid[row][col].state === "popping") { newGrid[row][col].symbol = null; newGrid[row][col].state = "idle"; } } }
    for (let col = 0; col < COLS; col++) { let emptyBelow = 0; for (let row = ROWS - 1; row >= 0; row--) { if (newGrid[row][col].symbol === null) emptyBelow++; else if (emptyBelow > 0) { const targetRow = row + emptyBelow; newGrid[targetRow][col] = { ...newGrid[row][col], state: "falling", fallDistance: emptyBelow }; newGrid[row][col] = { symbol: null, state: "idle", id: `empty-${row}-${col}-${Date.now()}` }; } } let spawnIndex = 0; for (let row = 0; row < ROWS; row++) { if (newGrid[row][col].symbol === null) { spawnIndex++; newGrid[row][col] = { symbol: generateRandomSymbol(gameModeRef.current === "freespins"), state: "spawning", id: `spawn-${row}-${col}-${Date.now()}-${Math.random()}`, fallDistance: spawnIndex }; } } }
    setGrid(newGrid); 
    cascadeTimeoutRef.current = setTimeout(() => { 
      const idleGrid = newGrid.map(row => row.map(cell => ({ ...cell, state: "idle" as CellState, fallDistance: 0 }))); 
      setGrid(idleGrid); 
      cascadeTimeoutRef.current = setTimeout(() => { checkWins(idleGrid); }, SPIN_TIMING.cascadeDelayMs); 
    }, SPIN_TIMING.symbolDropMs + SPIN_TIMING.symbolSpawnMs);
  }, [generateRandomSymbol, checkWins]);

  const triggerFreeSpin = useCallback(async () => {
    if (isSpinning || isCascading || isProcessingRef.current) return;
    const remaining = freeSpinsRemainingRef.current; 
    if (remaining <= 0) { endFreeSpins(); return; }
    
    console.log("=== STARTING FREE SPIN ===");
    console.log("Remaining free spins:", remaining);
    
    isProcessingRef.current = true; 
    setIsSpinning(true); 
    spinStartTimeRef.current = performance.now(); 
    // SoundManager.play("spin_start"); // Sound effects disabled
    
    // Reset win displays for new spin (but NOT balance - free spins don't cost anything)
    setCurrentWin(0); 
    setLastSpinWin(0); 
    
    // Reset win accumulators
    currentSpinBaseWinRef.current = 0;
    collectedMultipliersRef.current = [];
    
    // Reset breakdown displays
    setWinBreakdown([]); 
    setCascadeHistory([]);
    spinIdRef.current++; 
    tumbleIndexRef.current = 0;
    
    const newRemaining = remaining - 1; 
    setFreeSpinsRemaining(newRemaining); 
    freeSpinsRemainingRef.current = newRemaining;
    
    const newGrid = generateGrid(true); 
    setGrid(newGrid);
    
    const elapsed = performance.now() - spinStartTimeRef.current; 
    const remainingTime = SPIN_TIMING.minSpinDurationMs - elapsed; 
    if (remainingTime > 0) { await wait(remainingTime); }
    
    const idleGrid = newGrid.map(row => row.map(cell => ({ ...cell, state: "idle" as CellState, fallDistance: 0 }))); 
    setGrid(idleGrid); 
    setIsSpinning(false); 
    await wait(100); 
    checkWins(idleGrid);
  }, [isSpinning, isCascading, generateGrid, checkWins, endFreeSpins]);

  const handleSpin = useCallback(async () => {
    if (isSpinning || isCascading || isProcessingRef.current) return;
    if (balance < bet) { toast.error("Insufficient balance!"); return; }
    
    console.log("=== STARTING NEW SPIN ===");
    console.log("Balance before bet deduction:", balance);
    
    isProcessingRef.current = true; 
    setIsSpinning(true); 
    spinStartTimeRef.current = performance.now(); 
    // SoundManager.play("spin_start"); // Sound effects disabled
    
    // Reset win displays for new spin
    setCurrentWin(0); 
    setLastSpinWin(0); 
    
    // Reset win accumulators
    currentSpinBaseWinRef.current = 0;
    collectedMultipliersRef.current = [];
    
    // Deduct bet from balance
    setBalance(prevBalance => {
      const newBalance = prevBalance - bet;
      console.log("BET DEDUCTED:", prevBalance, "-", bet, "=", newBalance);
      balanceRef.current = newBalance; // Keep ref in sync
      return newBalance;
    }); 
    
    // Reset breakdown displays
    setWinBreakdown([]); 
    setCascadeHistory([]);
    spinIdRef.current++; 
    tumbleIndexRef.current = 0;
    
    const newGrid = generateGrid(false); 
    setGrid(newGrid);
    
    const elapsed = performance.now() - spinStartTimeRef.current; 
    const remainingTime = SPIN_TIMING.minSpinDurationMs - elapsed; 
    if (remainingTime > 0) { await wait(remainingTime); }
    
    const idleGrid = newGrid.map(row => row.map(cell => ({ ...cell, state: "idle" as CellState, fallDistance: 0 }))); 
    setGrid(idleGrid); 
    setIsSpinning(false); 
    await wait(100); 
    checkWins(idleGrid);
  }, [isSpinning, isCascading, balance, bet, generateGrid, checkWins]);

  const startFreeSpins = useCallback(() => { 
    setShowFreeSpinsModal(false); 
    setGameMode("freespins"); 
    gameModeRef.current = "freespins"; 
    const spins = pendingFreeSpins; 
    setFreeSpinsRemaining(spins); 
    freeSpinsRemainingRef.current = spins; 
    setFreeSpinsTotal(spins); 
    setFreeSpinsTotalWin(0); 
    freeSpinsTotalWinRef.current = 0; 
    setPendingFreeSpins(0); 
    pendingFreeSpinsRef.current = 0;
    collectedMultipliersRef.current = [];
    setWinBreakdown([]); 
    setCascadeHistory([]);
    setTimeout(() => { triggerFreeSpin(); }, 400); 
  }, [pendingFreeSpins, triggerFreeSpin]);
  
  const handleBuyBonus = () => { if (isSpinning || isCascading || gameMode === "freespins") return; setShowBuyBonusModal(true); };
  
  const confirmBuyBonus = () => { 
    const cost = bet * 100; 
    if (balance < cost) { toast.error("Insufficient balance!"); return; } 
    setBalance(prev => prev - cost); 
    setShowBuyBonusModal(false); 
    setPendingFreeSpins(10); 
    pendingFreeSpinsRef.current = 10;
    // SoundManager.play("free_spins_start"); // Sound effects disabled
    setShowFreeSpinsModal(true); 
  };
  
  const handleIncreaseBet = () => { const idx = BET_STEPS.indexOf(bet); if (idx < BET_STEPS.length - 1) setBet(BET_STEPS[idx + 1]); };
  const handleDecreaseBet = () => { const idx = BET_STEPS.indexOf(bet); if (idx > 0) setBet(BET_STEPS[idx - 1]); };
  
  // Autoplay toggle
  const toggleAutoplay = useCallback(() => {
    if (isAutoplay) {
      // Stop autoplay
      setIsAutoplay(false);
      setAutoplaySpinsRemaining(0);
    } else {
      // Start autoplay with 50 spins
      setIsAutoplay(true);
      setAutoplaySpinsRemaining(50);
    }
  }, [isAutoplay]);
  
  // Autoplay effect - trigger next spin when current spin finishes
  useEffect(() => {
    if (!isAutoplay || autoplaySpinsRemaining <= 0) return;
    if (isSpinning || isCascading || isProcessingRef.current) return;
    if (gameMode === "freespins") return; // Don't interfere with free spins
    if (balance < bet) {
      // Stop autoplay if insufficient balance
      setIsAutoplay(false);
      setAutoplaySpinsRemaining(0);
      toast.error("Autoplay stopped: Insufficient balance");
      return;
    }
    
    // Trigger next spin after a short delay
    const timer = setTimeout(() => {
      if (isAutoplay && autoplaySpinsRemaining > 0 && !isSpinning && !isCascading) {
        setAutoplaySpinsRemaining(prev => prev - 1);
        handleSpin();
      }
    }, 800); // 800ms delay between spins
    
    return () => clearTimeout(timer);
  }, [isAutoplay, autoplaySpinsRemaining, isSpinning, isCascading, gameMode, balance, bet, handleSpin]);
  
  useEffect(() => { return () => { if (cascadeTimeoutRef.current) clearTimeout(cascadeTimeoutRef.current); }; }, []);

  const isFreeSpinMode = gameMode === "freespins";
  const totalMultiplier = collectedMultipliersRef.current.length > 0 ? collectedMultipliersRef.current.reduce((a, b) => a + b, 0) : 0;
  const getBuyBonusBg = () => buyBonusPressed ? btnRectPressed : buyBonusHover ? btnRectHover : btnRectNormal;
  const getSuperFreeSpinsBg = () => superFreeSpinsPressed ? btnRectPressed : superFreeSpinsHover ? btnRectHover : btnRectNormal;

  // ==================== LOADING SCREEN ====================
  if (isLoading) {
    return (
      <div 
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(180deg, #1a0a2e 0%, #16082a 50%, #0d0515 100%)",
          zIndex: 9999,
        }}
      >
        {/* Animated background particles */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: 4 + Math.random() * 6,
                height: 4 + Math.random() * 6,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${Math.random() > 0.5 ? 'rgba(168,85,247,0.6)' : 'rgba(74,222,128,0.6)'} 0%, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <motion.img
          src={loadingLogoNew}
          alt="Pluffy High Kitchen"
          style={{
            width: isMobile ? "70vw" : "min(400px, 50vw)",
            maxWidth: "400px",
            filter: "drop-shadow(0 0 30px rgba(168,85,247,0.5))",
            marginBottom: "40px",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.95, 1.05, 0.95],
            opacity: 1,
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5 },
          }}
        />

        {/* Loading bar */}
        <div style={{
          width: isMobile ? "70vw" : "300px",
          height: "8px",
          borderRadius: "4px",
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden",
          marginBottom: "30px",
        }}>
          <motion.div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #7c3aed, #a855f7, #22c55e, #7c3aed)",
              backgroundSize: "200% 100%",
              borderRadius: "4px",
            }}
            initial={{ width: "0%" }}
            animate={{ 
              width: "100%",
              backgroundPosition: ["0% 0%", "100% 0%"],
            }}
            transition={{
              width: { duration: 2, ease: "easeOut" },
              backgroundPosition: { duration: 1, repeat: Infinity, ease: "linear" },
            }}
          />
        </div>


        {/* Enter button */}
        <motion.button
          onClick={handleEnterGame}
          style={{
            padding: isMobile ? "16px 40px" : "18px 50px",
            fontSize: isMobile ? "18px" : "22px",
            fontWeight: 800,
            color: "white",
            background: "linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)",
            border: "3px solid rgba(168,85,247,0.5)",
            borderRadius: "16px",
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(168,85,247,0.4), 0 8px 0 #4c1d95",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 0 40px rgba(168,85,247,0.6), 0 8px 0 #4c1d95" 
          }}
          whileTap={{ 
            scale: 0.95, 
            boxShadow: "0 0 20px rgba(168,85,247,0.4), 0 4px 0 #4c1d95" 
          }}
        >
          TAP TO PLAY
        </motion.button>

      </div>
    );
  }

  // ==================== SETTINGS MODAL ====================
  const SettingsModal = () => (
    <AnimatePresence>
      {showSettingsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowSettingsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, rgba(37, 16, 61, 0.98), rgba(18, 7, 34, 0.99))",
              borderRadius: "20px",
              padding: "30px",
              minWidth: isMobile ? "85vw" : "320px",
              border: "2px solid rgba(168,85,247,0.4)",
              boxShadow: "0 0 40px rgba(168,85,247,0.3)",
            }}
          >
            {/* Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "24px",
            }}>
              <h2 style={{ 
                color: "white", 
                fontSize: "22px", 
                fontWeight: 800,
                margin: 0,
              }}>
                ⚙️ Settings
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettingsModal(false)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </motion.button>
            </div>

            {/* Sound Toggle */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              marginBottom: "12px",
            }}>
              <span style={{ color: "white", fontSize: "16px", fontWeight: 600 }}>
                🔊 Sound Effects
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleSound}
                style={{
                  width: "60px",
                  height: "32px",
                  borderRadius: "16px",
                  background: isSoundMuted 
                    ? "rgba(255,255,255,0.2)" 
                    : "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <motion.div
                  animate={{ x: isSoundMuted ? 2 : 28 }}
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: "0",
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                />
              </motion.button>
            </div>

            {/* Sound status text */}
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "12px",
              textAlign: "center",
              margin: "16px 0 0 0",
            }}>
              {isSoundMuted ? "🔇 Sound is OFF" : "🔊 Sound is ON"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ==================== MOBILE LAYOUT (COMPLETELY REDESIGNED) ====================
  if (isMobile) {
  return (
      <div 
         style={{
          position: "fixed",
          inset: 0,
          width: "100vw", 
          height: "100dvh", // Dynamic viewport height for mobile (fallback to 100vh)
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
           backgroundImage: `url(${gameBackground})`,
           backgroundSize: "cover",
           backgroundPosition: "center",
          touchAction: "manipulation",
        }}
      >
        {/* Free Spins Overlay */}
        <AnimatePresence>
          {isFreeSpinMode && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 0,
                background: `radial-gradient(ellipse at 50% 30%, rgba(74,222,128,0.35) 0%, transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(88,28,135,0.4) 100%)`
              }}
            />
          )}
        </AnimatePresence>

        {/* ==================== TOP BAR ==================== */}
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            padding: "clamp(6px, 2vw, 12px) clamp(10px, 3vw, 16px)",
            paddingTop: "max(env(safe-area-inset-top), clamp(6px, 2vw, 12px))",
            background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)",
            zIndex: 50,
            flexShrink: 0,
          }}
        >
          {/* Logo - Top Left, 20% larger */}
          <img 
            src={loadingLogoNew} 
            alt="Logo" 
              style={{
              height: "clamp(40px, 10vw, 55px)", // 20% larger
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))",
              objectFit: "contain",
            }} 
          />
          
          {/* Right side: Free Spins Counter + Balance */}
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 14px)" }}>
            {/* Free Spins Counter */}
            {isFreeSpinMode && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ 
                  background: "linear-gradient(180deg, rgba(22,163,74,0.95) 0%, rgba(21,128,61,0.9) 100%)", 
                  padding: "clamp(4px, 1vw, 8px) clamp(10px, 2.5vw, 16px)", 
                  borderRadius: "clamp(10px, 2vw, 14px)", 
                  border: "2px solid rgba(74,222,128,0.7)",
                  boxShadow: "0 0 15px rgba(74,222,128,0.4)",
                }}
              >
                <div style={{ fontSize: "clamp(8px, 2vw, 10px)", color: "#a7f3d0", fontWeight: 600, textAlign: "center" }}>FREE SPINS</div>
                <div style={{ fontSize: "clamp(16px, 4vw, 22px)", color: "white", fontWeight: 900, textAlign: "center", textShadow: "0 0 10px rgba(74,222,128,0.8)" }}>
                  {freeSpinsRemaining}<span style={{ fontSize: "clamp(10px, 2.5vw, 14px)", color: "#86efac" }}>/{freeSpinsTotal}</span>
                </div>
          </motion.div>
            )}
            
            {/* Balance */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "clamp(8px, 2vw, 10px)", color: "#9ca3af", textTransform: "uppercase", fontWeight: 600 }}>Balance</div>
              <div style={{ fontSize: "clamp(14px, 3.5vw, 18px)", color: "white", fontWeight: 700 }}>₺{balance.toLocaleString()}</div>
            </div>
        </div>
      </div>

        {/* ==================== MAIN GAME AREA ==================== */}
        <div 
          style={{ 
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "clamp(4px, 1.5vw, 10px)",
            minHeight: 0, // Important for flex shrinking
            position: "relative",
          }}
        >
          {/* Free Spins Total Win Banner */}
          {isFreeSpinMode && freeSpinsTotalWin > 0 && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{ 
                position: "absolute",
                top: "clamp(4px, 1vw, 10px)",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 30,
                background: "linear-gradient(180deg, rgba(22,163,74,0.95) 0%, rgba(21,128,61,0.9) 100%)", 
                padding: "clamp(6px, 1.5vw, 10px) clamp(16px, 4vw, 28px)", 
                borderRadius: "clamp(12px, 3vw, 18px)", 
                border: "2px solid rgba(74,222,128,0.7)",
                boxShadow: "0 4px 20px rgba(74,222,128,0.4)",
              }}
            >
              <div style={{ fontSize: "clamp(8px, 2vw, 10px)", color: "#fef08a", fontWeight: 700, textAlign: "center" }}>TOTAL WIN</div>
              <div style={{ fontSize: "clamp(18px, 5vw, 26px)", color: "#fbbf24", fontWeight: 900, textAlign: "center" }}>₺{freeSpinsTotalWin.toLocaleString()}</div>
              {totalMultiplier > 0 && (
                <div style={{ fontSize: "clamp(12px, 3vw, 16px)", color: "#c4b5fd", fontWeight: 700, textAlign: "center" }}>x{totalMultiplier}</div>
              )}
            </motion.div>
          )}

          {/* GAME BOARD - 80% of screen width, centered */}
          <motion.div 
            style={{
              width: "min(80vw, 95vh * 0.7)", // 80% width but respect aspect ratio
              maxWidth: "600px",
              aspectRatio: "6 / 5", // Match grid ratio
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "clamp(4px, 1vw, 8px)",
              borderRadius: "clamp(12px, 2.5vw, 18px)",
            }}
            animate={{ 
              background: isFreeSpinMode 
                ? "linear-gradient(135deg, #16a34a 0%, #166534 100%)" 
                : "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
              boxShadow: isFreeSpinMode 
                ? "0 0 40px rgba(74,222,128,0.5), inset 0 0 20px rgba(74,222,128,0.1)" 
                : "0 0 40px rgba(126,58,242,0.4), inset 0 0 20px rgba(126,58,242,0.1)",
            }}
          >
            <div 
              style={{ 
                width: "100%", 
                height: "100%",
                borderRadius: "clamp(8px, 2vw, 14px)",
                overflow: "hidden",
                transform: "scale(0.95)", // Slight padding inside
                transformOrigin: "center center",
              }}
            >
              <GameBoard grid={grid} isSpinning={isSpinning} isFreeSpinMode={isFreeSpinMode} />
            </div>
            
            {/* Win FX Animations Overlay */}
            <AnimatePresence>
              <WinAnimations showWinningFx={showWinFx} showBigWin={showBigWin} />
            </AnimatePresence>
          </motion.div>

          {/* Cascade History Box - Bottom Left */}
          <AnimatePresence>
            {cascadeHistory.length > 0 && (
              <CascadeHistoryBox items={cascadeHistory} currencySymbol="₺" />
            )}
          </AnimatePresence>
        </div>

        {/* ==================== BONUS BUTTONS (Below Board) ==================== */}
        {!isFreeSpinMode && (
          <div 
            style={{ 
              display: "flex", 
              gap: "clamp(12px, 3vw, 20px)", 
              justifyContent: "center",
              padding: "clamp(8px, 2vw, 14px) clamp(12px, 3vw, 20px)",
              flexShrink: 0,
            }}
          >
            {/* Buy Bonus Button */}
            <motion.button 
              whileTap={{ scale: 0.95 }} 
              onClick={handleBuyBonus}
              style={{ 
                flex: 1, 
                maxWidth: "clamp(140px, 40vw, 180px)", 
                height: "clamp(54px, 14vw, 70px)", 
                position: "relative",
                touchAction: "manipulation",
              }}
            >
              <img src={btnRectNormal} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontWeight: 700, fontSize: "clamp(10px, 2.5vw, 13px)" }}>BUY BONUS</span>
                <span style={{ color: "white", fontWeight: 900, fontSize: "clamp(14px, 3.5vw, 18px)" }}>₺{(bet * 100).toLocaleString()}</span>
              </div>
            </motion.button>

            {/* Super Free Spins Button */}
            <motion.button 
              whileTap={{ scale: 0.95 }}
              style={{ 
                flex: 1, 
                maxWidth: "clamp(140px, 40vw, 180px)", 
                height: "clamp(54px, 14vw, 70px)", 
                position: "relative",
                touchAction: "manipulation",
              }}
            >
              <img src={btnRectNormal} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#c4b5fd", fontWeight: 700, fontSize: "clamp(8px, 2vw, 10px)" }}>SUPER</span>
                <span style={{ color: "white", fontWeight: 700, fontSize: "clamp(10px, 2.5vw, 13px)" }}>FREE SPINS</span>
                <span style={{ color: "white", fontWeight: 900, fontSize: "clamp(14px, 3.5vw, 18px)" }}>₺{(bet * 200).toLocaleString()}</span>
              </div>
            </motion.button>
          </div>
        )}

        {/* ==================== BOTTOM CONTROL PANEL (Fixed) ==================== */}
        <div 
          style={{ 
            background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.95) 100%)",
            padding: "clamp(10px, 2.5vw, 16px) clamp(12px, 3vw, 20px)",
            paddingBottom: "max(env(safe-area-inset-bottom), clamp(10px, 2.5vw, 16px))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "clamp(8px, 2vw, 16px)",
            flexShrink: 0,
            zIndex: 50,
          }}
        >
          {/* Left: Bet Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.5vw, 12px)" }}>
            {/* Decrease Bet Button */}
            <motion.button 
              whileTap={{ scale: 0.85 }} 
              onClick={handleDecreaseBet} 
              disabled={isFreeSpinMode || isSpinning}
              style={{ 
                width: "clamp(40px, 10vw, 52px)", 
                height: "clamp(40px, 10vw, 52px)", 
                borderRadius: "50%", 
                background: "linear-gradient(180deg, #6b7280 0%, #4b5563 100%)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "white", 
                fontWeight: 900, 
                fontSize: "clamp(20px, 5vw, 28px)",
                opacity: (isFreeSpinMode || isSpinning) ? 0.4 : 1,
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 0 #374151, 0 6px 12px rgba(0,0,0,0.3)",
                touchAction: "manipulation",
              }}
            >−</motion.button>
            
            {/* Bet Display */}
            <div style={{ textAlign: "center", minWidth: "clamp(60px, 18vw, 90px)" }}>
              <div style={{ fontSize: "clamp(9px, 2.2vw, 11px)", color: "#9ca3af", textTransform: "uppercase", fontWeight: 600 }}>Bet</div>
              <div style={{ fontSize: "clamp(16px, 4.5vw, 22px)", color: "white", fontWeight: 800 }}>₺{bet}</div>
            </div>
            
            {/* Increase Bet Button */}
            <motion.button 
              whileTap={{ scale: 0.85 }} 
              onClick={handleIncreaseBet} 
              disabled={isFreeSpinMode || isSpinning}
              style={{ 
                width: "clamp(40px, 10vw, 52px)", 
                height: "clamp(40px, 10vw, 52px)", 
                borderRadius: "50%", 
                background: "linear-gradient(180deg, #6b7280 0%, #4b5563 100%)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "white", 
                fontWeight: 900, 
                fontSize: "clamp(20px, 5vw, 28px)",
                opacity: (isFreeSpinMode || isSpinning) ? 0.4 : 1,
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 0 #374151, 0 6px 12px rgba(0,0,0,0.3)",
                touchAction: "manipulation",
              }}
            >+</motion.button>
          </div>

          {/* Center: Win Display */}
          <div style={{ textAlign: "center", minWidth: "clamp(70px, 20vw, 100px)" }}>
            <div style={{ fontSize: "clamp(9px, 2.2vw, 11px)", color: "#9ca3af", textTransform: "uppercase", fontWeight: 600 }}>Win</div>
            <div 
              style={{ 
                fontSize: "clamp(18px, 5vw, 26px)", 
                fontWeight: 900, 
                color: lastSpinWin > 0 ? "#fbbf24" : "#ffffff",
                textShadow: lastSpinWin > 0 ? "0 0 10px rgba(251,191,36,0.5)" : "none",
              }}
            >₺{lastSpinWin.toLocaleString()}</div>
          </div>

          {/* Right: Autoplay + Spin Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 12px)" }}>
            {/* Autoplay Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={toggleAutoplay}
              disabled={isFreeSpinMode || isSpinning || isCascading}
              style={{ 
                width: "clamp(50px, 12vw, 65px)", 
                height: "clamp(50px, 12vw, 65px)", 
                position: "relative",
                opacity: (isFreeSpinMode || isSpinning || isCascading) ? 0.5 : 1,
                touchAction: "manipulation",
                flexShrink: 0,
              }}
            >
              <img 
                src={btnSquareNormal} 
                alt="" 
                style={{ 
                  position: "absolute", 
                  inset: 0, 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "contain",
                  filter: isAutoplay ? "brightness(1.2) hue-rotate(80deg)" : "none",
                }} 
              />
              <div style={{ 
                position: "absolute", 
                inset: 0, 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center",
              }}>
                <img 
                  src={btnTextAuto} 
                  alt="Auto" 
                  style={{ 
                    width: "70%", 
                    height: "auto", 
                    objectFit: "contain",
                  }} 
                />
                {isAutoplay && autoplaySpinsRemaining > 0 && (
                  <span style={{ 
                    fontSize: "clamp(8px, 2vw, 10px)", 
                    color: "#4ade80", 
                    fontWeight: 700,
                    marginTop: "2px",
                  }}>
                    {autoplaySpinsRemaining}
                  </span>
                )}
              </div>
            </motion.button>
            
            {/* Spin Button (Large) */}
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={isFreeSpinMode ? triggerFreeSpin : handleSpin} 
              disabled={isSpinning || isCascading}
              style={{ 
                width: "clamp(70px, 18vw, 95px)", 
                height: "clamp(70px, 18vw, 95px)", 
                opacity: (isSpinning || isCascading) ? 0.6 : 1,
                touchAction: "manipulation",
                flexShrink: 0,
              }}
            >
              <img 
                src={isSpinning ? btnSpinPressed : btnSpinNormal} 
                alt="Spin" 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "contain", 
                  filter: isFreeSpinMode 
                    ? "drop-shadow(0 0 20px rgba(74,222,128,0.7))" 
                    : "drop-shadow(0 6px 12px rgba(0,0,0,0.5))" 
                }} 
              />
            </motion.button>
          </div>
        </div>

        {/* ==================== WIN BREAKDOWN PANEL (Right side, responsive) ==================== */}
        <WinBreakdownPanel breakdown={winBreakdown} currencySymbol="₺" />

        {/* ==================== MODALS ==================== */}
        <WinDisplay currentWin={currentWin} bet={bet} onDismiss={() => setCurrentWin(0)} />
        <FreeSpinsModal open={showFreeSpinsModal} onOpenChange={setShowFreeSpinsModal} freeSpins={pendingFreeSpins} onStart={startFreeSpins} />
        <FreeSpinsEndModal open={showFreeSpinsEndModal} onClose={handleFreeSpinsEndClose} totalWin={freeSpinsTotalWin} bet={bet} />
        <BuyBonusModal open={showBuyBonusModal} onOpenChange={setShowBuyBonusModal} cost={bet * 100} onConfirm={confirmBuyBonus} />
        <SettingsModal />
      </div>
    );
  }

  // ==================== DESKTOP LAYOUT ====================
  return (
    <div 
      className="game-wrapper"
      style={{ 
        position: "relative",
        width: "100vw", 
        height: "100vh", 
        display: "flex",
        overflow: "hidden",
        backgroundImage: `url(${gameBackground})`, 
        backgroundSize: "cover", 
        backgroundPosition: "center" 
      }}
    >
      {/* Free Spins Overlay */}
      <AnimatePresence>
        {isFreeSpinMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-0"
            style={{ background: `radial-gradient(ellipse at 30% 20%, rgba(74,222,128,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.4) 0%, transparent 50%), linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(88,28,135,0.5) 100%)` }}
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR */}
      <div className="left-sidebar" style={{ width: "260px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px", zIndex: 30 }}>
        <img src={loadingLogoNew} alt="Logo" className="logo" style={{ width: "200px", marginBottom: "50px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))" }} />

        {isFreeSpinMode && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-52 rounded-2xl p-4 text-center mb-6"
            style={{ background: "linear-gradient(180deg, rgba(22,163,74,0.95) 0%, rgba(21,128,61,0.9) 100%)", border: "3px solid rgba(74,222,128,0.6)", boxShadow: "0 0 30px rgba(74,222,128,0.4)" }}>
            <div className="text-green-200 text-xs font-bold uppercase">Free Spins</div>
            <div className="text-4xl font-black text-white" style={{ textShadow: "0 0 15px rgba(74,222,128,0.8)" }}>{freeSpinsRemaining}<span className="text-lg text-green-300">/{freeSpinsTotal}</span></div>
            <div className="mt-2 pt-2 border-t border-green-400/30"><div className="text-yellow-200 text-xs font-bold">Total Win</div><div className="text-xl font-black text-yellow-400">₺{freeSpinsTotalWin.toLocaleString()}</div></div>
            {totalMultiplier > 0 && (<div className="mt-2 pt-2 border-t border-green-400/30"><div className="text-purple-200 text-xs font-bold">Multiplier</div><div className="text-xl font-black text-purple-300">x{totalMultiplier}</div></div>)}
          </motion.div>
        )}

        <div className="bonus-buttons" style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "auto", marginBottom: "140px" }}>
          {!isFreeSpinMode && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleBuyBonus}
              onMouseEnter={() => setBuyBonusHover(true)} onMouseLeave={() => { setBuyBonusHover(false); setBuyBonusPressed(false); }}
              onMouseDown={() => setBuyBonusPressed(true)} onMouseUp={() => setBuyBonusPressed(false)}
              className="relative" style={{ width: "220px", height: "90px" }}>
              <img src={getBuyBonusBg()} alt="" className="absolute inset-0 w-full h-full object-contain" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <img src={btnTextBuyBonus} alt="Buy Bonus" className="h-6 object-contain" />
                <span className="text-white font-black text-xl mt-1" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>₺{(bet * 100).toLocaleString()}</span>
              </div>
            </motion.button>
          )}
          {!isFreeSpinMode && (
            <motion.button whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setSuperFreeSpinsHover(true)} onMouseLeave={() => { setSuperFreeSpinsHover(false); setSuperFreeSpinsPressed(false); }}
              onMouseDown={() => setSuperFreeSpinsPressed(true)} onMouseUp={() => setSuperFreeSpinsPressed(false)}
              className="relative" style={{ width: "220px", height: "90px" }}>
              <img src={getSuperFreeSpinsBg()} alt="" className="absolute inset-0 w-full h-full object-contain" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-purple-200 text-[10px] font-bold uppercase" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>Super</span>
                <img src={btnTextFreeSpins} alt="Free Spins" className="h-5 object-contain" />
                <span className="text-white font-black text-xl mt-1" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>₺{(bet * 200).toLocaleString()}</span>
              </div>
            </motion.button>
          )}
        </div>
      </div>

      {/* CENTER: GAME BOARD */}
      <div className="game-center" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", paddingBottom: "120px" }}>
        <motion.div className="game-board rounded-2xl p-1.5" style={{ transformOrigin: "center top", transform: "scale(1.05)", position: "relative" }}
          animate={{ background: isFreeSpinMode ? "linear-gradient(135deg, #16a34a 0%, #166534 100%)" : "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", boxShadow: isFreeSpinMode ? "0 0 60px rgba(74,222,128,0.5)" : "0 0 60px rgba(126,58,242,0.4)" }}>
          <div className="rounded-xl overflow-hidden">
            <GameBoard grid={grid} isSpinning={isSpinning} isFreeSpinMode={isFreeSpinMode} />
          </div>
          
          {/* Win FX Animations Overlay */}
          <AnimatePresence>
            <WinAnimations showWinningFx={showWinFx} showBigWin={showBigWin} />
          </AnimatePresence>
        </motion.div>
      </div>

      {/* WIN BREAKDOWN PANEL */}
      <WinBreakdownPanel breakdown={winBreakdown} currencySymbol="₺" />

      {/* BOTTOM LEFT BUTTONS */}
      <div className="absolute left-6 bottom-6 flex items-center gap-3 z-30">
        <motion.button 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }} 
          onClick={() => setShowSettingsModal(true)}
          className="relative w-12 h-12"
        >
          <img src={btnSquareNormal} alt="" className="w-full h-full object-contain" />
          <img src={btnIconSettings} alt="Settings" className="absolute inset-0 w-7 h-7 m-auto object-contain" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative w-12 h-12">
          <img src={btnSquareNormal} alt="" className="w-full h-full object-contain" />
          <img src={btnIconInfo} alt="Info" className="absolute inset-0 w-7 h-7 m-auto object-contain" />
        </motion.button>
      </div>

      {/* BOTTOM PANEL */}
      <div className="bottom-panel" style={{ position: "absolute", bottom: 0, width: "100%", height: "100px", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)", zIndex: 20 }}>
        <div className="flex items-center gap-16 px-8">
          <div className="text-center">
            <div className="text-gray-400 text-xs uppercase tracking-wide">Credit</div>
            <div className="text-2xl font-bold text-white">₺{balance.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs uppercase tracking-wide">Bet</div>
            <div className="text-2xl font-bold text-white">₺{bet.toLocaleString()}</div>
          </div>
          <div className="text-center min-w-[120px]">
            <div className="text-gray-400 text-xs uppercase tracking-wide">Win</div>
            <div className="text-2xl font-bold" style={{ color: lastSpinWin > 0 ? "#fbbf24" : "#ffffff" }}>₺{lastSpinWin.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT BUTTONS */}
      <div className="absolute right-8 bottom-5 flex items-center gap-4 z-30">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleDecreaseBet} disabled={isFreeSpinMode || isSpinning}
          className="w-11 h-11 rounded-full flex items-center justify-center text-2xl font-bold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(180deg, #6b7280 0%, #4b5563 100%)", boxShadow: "0 3px 0 #374151" }}>−</motion.button>
        
        {/* Autoplay Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={toggleAutoplay}
          disabled={isFreeSpinMode || isSpinning || isCascading}
          className="relative w-14 h-14 disabled:opacity-50"
        >
          <img 
            src={btnSquareNormal} 
            alt="" 
            className="w-full h-full object-contain"
            style={{ filter: isAutoplay ? "brightness(1.2) hue-rotate(80deg)" : "none" }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <img src={btnTextAuto} alt="Auto" className="w-8 h-auto object-contain" />
            {isAutoplay && autoplaySpinsRemaining > 0 && (
              <span className="text-[10px] text-green-400 font-bold">{autoplaySpinsRemaining}</span>
            )}
          </div>
        </motion.button>
        
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={isFreeSpinMode ? triggerFreeSpin : handleSpin} disabled={isSpinning || isCascading}
          className="relative w-20 h-20 disabled:opacity-60">
          <img src={isSpinning ? btnSpinPressed : btnSpinNormal} alt="Spin" className="w-full h-full object-contain"
            style={{ filter: isFreeSpinMode ? "drop-shadow(0 0 20px rgba(74,222,128,0.6))" : "drop-shadow(0 4px 10px rgba(0,0,0,0.5))" }} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleIncreaseBet} disabled={isFreeSpinMode || isSpinning}
          className="w-11 h-11 rounded-full flex items-center justify-center text-2xl font-bold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(180deg, #6b7280 0%, #4b5563 100%)", boxShadow: "0 3px 0 #374151" }}>+</motion.button>
      </div>

      {/* MODALS */}
      <WinDisplay currentWin={currentWin} bet={bet} onDismiss={() => setCurrentWin(0)} />
      <FreeSpinsModal open={showFreeSpinsModal} onOpenChange={setShowFreeSpinsModal} freeSpins={pendingFreeSpins} onStart={startFreeSpins} />
      <FreeSpinsEndModal open={showFreeSpinsEndModal} onClose={handleFreeSpinsEndClose} totalWin={freeSpinsTotalWin} bet={bet} />
      <BuyBonusModal open={showBuyBonusModal} onOpenChange={setShowBuyBonusModal} cost={bet * 100} onConfirm={confirmBuyBonus} />
      <SettingsModal />
    </div>
  );
};
