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
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: isSpinning ? (rowIndex * 0.15 + colIndex * 0.08) : 0,
                ease: [0.34, 1.56, 0.64, 1],
                type: "spring",
                damping: 12,
                stiffness: 100
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
