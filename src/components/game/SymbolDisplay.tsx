import { motion } from "framer-motion";
import { Cell } from "../SlotGame";

interface SymbolDisplayProps {
  cell: Cell;
}

const symbolEmojis = {
  strawberry: "🍓",
  grape: "🍇",
  watermelon: "🍉",
  orange: "🍊",
  lemon: "🍋",
  cherry: "🍒",
  banana: "🍌",
  plum: "🍑",
  bomb: "💣",
};

const symbolColors = {
  strawberry: "bg-strawberry",
  grape: "bg-grape",
  watermelon: "bg-watermelon",
  orange: "bg-orange",
  lemon: "bg-lemon",
  cherry: "bg-cherry",
  banana: "bg-banana",
  plum: "bg-plum",
  bomb: "bg-primary",
};

export const SymbolDisplay = ({ cell }: SymbolDisplayProps) => {
  return (
    <motion.div
      animate={
        cell.isWinning
          ? {
              scale: [1, 1.15, 1],
              rotate: [0, 5, -5, 0],
            }
          : {}
      }
      transition={{
        duration: 0.8,
        repeat: cell.isWinning ? Infinity : 0,
      }}
      className={`
        relative w-full h-full rounded-xl
        ${symbolColors[cell.symbol.type]} bg-opacity-20
        border-2 ${cell.isWinning ? "border-accent shadow-win" : "border-border"}
        flex items-center justify-center
        transition-all duration-300
      `}
    >
      <motion.div
        className="text-4xl md:text-5xl"
        animate={cell.isWinning ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.6, repeat: cell.isWinning ? Infinity : 0 }}
      >
        {symbolEmojis[cell.symbol.type]}
      </motion.div>

      {cell.symbol.type === "bomb" && cell.symbol.multiplier && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-glow"
        >
          x{cell.symbol.multiplier}
        </motion.div>
      )}

      {cell.isWinning && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              "0 0 20px hsl(var(--win-glow) / 0.6)",
              "0 0 40px hsl(var(--win-glow) / 0.8)",
              "0 0 20px hsl(var(--win-glow) / 0.6)",
            ],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
