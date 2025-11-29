import { motion } from "framer-motion";
import { Cell } from "../SlotGame";
import { SymbolDisplay } from "./SymbolDisplay";

interface GameBoardProps {
  grid: Cell[][];
  isSpinning: boolean;
}

export const GameBoard = ({ grid, isSpinning }: GameBoardProps) => {
  return (
    <div className="grid grid-cols-6 gap-2 md:gap-3 mb-6">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <motion.div
            key={cell.id}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.3,
              delay: isSpinning ? (rowIndex * 0.1 + colIndex * 0.05) : 0,
            }}
            className="aspect-square"
          >
            <SymbolDisplay cell={cell} />
          </motion.div>
        ))
      )}
    </div>
  );
};
