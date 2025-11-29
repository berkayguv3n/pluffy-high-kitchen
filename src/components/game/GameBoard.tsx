import { motion } from "framer-motion";
import { Cell } from "../SlotGame";
import { SymbolDisplay } from "./SymbolDisplay";

interface GameBoardProps {
  grid: Cell[][];
  isSpinning: boolean;
}

export const GameBoard = ({ grid, isSpinning }: GameBoardProps) => {
  return (
    <div className="relative">
      
      {/* Game grid - 5 rows x 6 columns */}
      <div className="relative grid grid-cols-6 gap-3 p-8 z-20 bg-purple-900/40 rounded-3xl backdrop-blur-sm border-4 border-purple-700/50 shadow-2xl">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.div
              key={cell.id}
              initial={isSpinning ? { y: -120, opacity: 0, scale: 0.8 } : false}
              animate={{ 
                y: 0, 
                opacity: cell.isWinning ? 0 : 1,
                scale: cell.isWinning ? [1, 1.08, 0.95, 0] : 1,
              }}
              transition={{
                y: {
                  duration: 0.45,
                  delay: isSpinning ? (colIndex * 0.05 + Math.random() * 0.08) : 0,
                  ease: [0.15, 0.85, 0.35, 1],
                },
                opacity: {
                  duration: cell.isWinning ? 0.15 : (isSpinning ? 0.25 : 0),
                },
                scale: {
                  duration: cell.isWinning ? 0.18 : (isSpinning ? 0.4 : 0),
                  times: cell.isWinning ? [0, 0.3, 0.7, 1] : undefined,
                  ease: "easeOut",
                }
              }}
              className="w-24 h-24 rounded-xl"
              style={{
                background: cell.isWinning 
                  ? "radial-gradient(circle, rgba(255,240,200,1) 0%, rgba(255,230,180,1) 100%)"
                  : "radial-gradient(circle, rgba(255,250,245,0.7) 0%, rgba(255,240,230,0.5) 100%)",
                boxShadow: cell.isWinning
                  ? "0 0 30px rgba(255,215,0,0.6), inset 0 2px 8px rgba(255,255,255,0.5)"
                  : "inset 0 2px 8px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.1)"
              }}
            >
              <SymbolDisplay cell={cell} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
