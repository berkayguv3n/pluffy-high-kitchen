import { motion, AnimatePresence } from "framer-motion";
import { Cell } from "../SlotGame";
import { SymbolDisplay } from "./SymbolDisplay";

interface GameBoardProps {
  grid: Cell[][];
  isSpinning: boolean;
  isFreeSpinMode?: boolean;
}

const CELL_SIZE = 95;
const GAP = 8;

// Animation timing constants - Slower for better music sync
const ANIM_TIMING = {
  symbolFadeOutMs: 250,       // Smooth fade out
  symbolDropMs: 450,          // Slower, more satisfying drop
  symbolSpawnMs: 400,         // Slower spawn animation
  winGlowMs: 500,             // Longer glow for celebration
  initialDropMs: 500,         // Slower initial drop
};

// Dust/Cloud particle component for falling effect
const DustParticle = ({ delay, isFreeSpinMode }: { delay: number; isFreeSpinMode: boolean }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    initial={{ opacity: 0, scale: 0.3, y: 0 }}
    animate={{ 
      opacity: [0, 0.6, 0],
      scale: [0.3, 1.4, 0.8],
      y: [0, 25, 45],
      x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50],
    }}
    transition={{ 
      duration: 0.6, // Slower dust for smoother feel
      delay: delay,
      ease: "easeOut",
    }}
    style={{
      width: 10 + Math.random() * 10,
      height: 10 + Math.random() * 10,
      background: isFreeSpinMode
        ? `radial-gradient(circle, rgba(74,222,128,0.6) 0%, transparent 70%)`
        : `radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)`,
      left: `${20 + Math.random() * 60}%`,
      bottom: 0,
    }}
  />
);

export const GameBoard = ({ grid, isSpinning, isFreeSpinMode = false }: GameBoardProps) => {
  const getAnimationProps = (cell: Cell, rowIndex: number, colIndex: number) => {
    const cellWithGap = CELL_SIZE + GAP;
    
    switch (cell.state) {
      case "spawning":
        return {
          initial: { 
            y: -(cell.fallDistance || 1) * cellWithGap - 60,
            opacity: 0,
            scale: 0.7,
          },
          animate: { 
            y: 0, 
            opacity: 1,
            scale: 1,
          },
          transition: {
            y: {
              duration: ANIM_TIMING.symbolSpawnMs / 1000,
              delay: colIndex * 0.05 + (cell.fallDistance || 1) * 0.06, // Slower stagger for music sync
              ease: [0.22, 1, 0.36, 1],
            },
            opacity: { 
              duration: 0.15,
              delay: colIndex * 0.05,
            },
            scale: {
              duration: ANIM_TIMING.symbolSpawnMs / 1000,
              delay: colIndex * 0.05 + (cell.fallDistance || 1) * 0.06,
              ease: [0.22, 1, 0.36, 1],
            },
          },
        };
      
      case "falling":
        return {
          initial: { 
            y: -(cell.fallDistance || 1) * cellWithGap,
          },
          animate: { 
            y: 0,
          },
          transition: {
            y: {
              duration: ANIM_TIMING.symbolDropMs / 1000 + (cell.fallDistance || 1) * 0.07, // Slower for music sync
              delay: colIndex * 0.04,
              ease: [0.22, 1, 0.36, 1],
            },
          },
        };
      
      case "winning":
        return {
          initial: {},
          animate: {
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 0 0px rgba(74,222,128,0)",
              "0 0 30px rgba(74,222,128,0.8)",
              "0 0 20px rgba(74,222,128,0.6)",
            ],
          },
          transition: {
            duration: ANIM_TIMING.winGlowMs / 1000,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse" as const,
          },
        };
      
      case "popping":
        return {
          initial: { opacity: 1, scale: 1 },
          animate: { 
            opacity: 0,
            scale: 0.5,
            rotate: Math.random() * 30 - 15,
          },
          transition: {
            duration: ANIM_TIMING.symbolFadeOutMs / 1000,
            ease: [0.4, 0, 1, 1],
          },
        };
      
      default:
        return {
          initial: false,
          animate: { y: 0, opacity: 1, scale: 1 },
          transition: { duration: 0 },
        };
    }
  };

  return (
    <div className="relative">
      {/* Game grid - 5 rows x 6 columns */}
      <div 
        className="relative grid grid-cols-6 gap-2 p-3 z-20"
        style={{
          background: isFreeSpinMode
            ? "linear-gradient(180deg, rgba(22,101,52,0.95) 0%, rgba(20,83,45,0.98) 100%)"
            : "linear-gradient(180deg, rgba(88,28,135,0.95) 0%, rgba(59,7,100,0.98) 100%)",
        }}
      >
        <AnimatePresence mode="popLayout">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const animProps = getAnimationProps(cell, rowIndex, colIndex);
              const isWinning = cell.state === "winning";
              const isPopping = cell.state === "popping";
              
              return (
                <motion.div
                  key={cell.id}
                  layout={cell.state === "idle"}
                  initial={animProps.initial}
                  animate={animProps.animate}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={animProps.transition}
                  className="rounded-xl relative"
                  style={{
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    background: isWinning 
                      ? "linear-gradient(180deg, rgba(255,250,235,0.95) 0%, rgba(255,240,210,0.9) 100%)"
                      : isFreeSpinMode
                      ? "linear-gradient(180deg, rgba(74,222,128,0.3) 0%, rgba(34,197,94,0.2) 100%)"
                      : "linear-gradient(180deg, rgba(139,92,176,0.5) 0%, rgba(107,70,147,0.4) 100%)",
                    boxShadow: isWinning
                      ? "0 0 20px rgba(74,222,128,0.6), 0 0 40px rgba(255,215,0,0.4), inset 0 1px 3px rgba(255,255,255,0.5)"
                      : "inset 0 1px 2px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.2)",
                    border: isWinning 
                      ? "2px solid rgba(74,222,128,0.6)" 
                      : isFreeSpinMode
                      ? "1px solid rgba(74,222,128,0.2)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {cell.symbol && <SymbolDisplay cell={cell} />}
                  
                  {/* Dust/cloud particles when falling or spawning */}
                  {(cell.state === "spawning" || cell.state === "falling") && (
                    <>
                      {[...Array(2)].map((_, i) => (
                        <DustParticle 
                          key={i} 
                          delay={i * 0.04 + colIndex * 0.01} 
                          isFreeSpinMode={isFreeSpinMode}
                        />
                      ))}
                    </>
                  )}
                  
                  {/* Smoke effect when popping */}
                  {isPopping && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: 14 + Math.random() * 18,
                            height: 14 + Math.random() * 18,
                            background: isFreeSpinMode
                              ? `radial-gradient(circle, rgba(74,222,128,0.85) 0%, transparent 70%)`
                              : `radial-gradient(circle, rgba(168,85,247,0.75) 0%, transparent 70%)`,
                            left: `${15 + Math.random() * 70}%`,
                            top: `${15 + Math.random() * 70}%`,
                          }}
                          initial={{ scale: 0.2, opacity: 0.95 }}
                          animate={{ 
                            scale: 3.5,
                            opacity: 0,
                            x: (Math.random() - 0.5) * 100,
                            y: -40 - Math.random() * 60,
                          }}
                          transition={{ 
                            duration: 0.3, // Faster smoke
                            ease: "easeOut", 
                            delay: i * 0.02 
                          }}
                        />
                      ))}
                    </>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
