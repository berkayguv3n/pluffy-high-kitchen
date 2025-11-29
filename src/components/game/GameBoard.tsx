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
      {/* Board frame */}
      <div className="absolute -inset-4 rounded-3xl border-8 border-[#FFD700] pointer-events-none z-10" 
           style={{
             background: "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,215,0,0.2))",
             boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 4px 8px rgba(255,255,255,0.4)"
           }}
      />
      
      {/* Game grid - 5 columns x 4 rows */}
      <div className="relative grid grid-cols-5 gap-3 p-6 rounded-2xl gradient-board shadow-card">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.div
              key={cell.id}
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: isSpinning ? (rowIndex * 0.15 + colIndex * 0.08) : 0,
                ease: [0.34, 1.56, 0.64, 1], // Bounce easing
                type: "spring",
                damping: 12,
                stiffness: 100
              }}
              className="w-24 h-24 md:w-28 md:h-28"
            >
              <SymbolDisplay cell={cell} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
