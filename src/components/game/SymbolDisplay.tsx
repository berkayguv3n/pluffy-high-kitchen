import { motion } from "framer-motion";
import { Cell } from "../SlotGame";

interface SymbolDisplayProps {
  cell: Cell;
}

const symbolData = {
  purple: { emoji: "🟣", color: "candy-purple", glow: "280 85% 60%" },
  grape: { emoji: "🍇", color: "candy-grape", glow: "270 75% 50%" },
  green: { emoji: "🍏", color: "candy-green", glow: "145 70% 45%" },
  red: { emoji: "🍎", color: "candy-red", glow: "355 85% 55%" },
  heart: { emoji: "❤️", color: "candy-heart", glow: "350 90% 60%" },
  plum: { emoji: "🍑", color: "candy-plum", glow: "290 65% 50%" },
  blue: { emoji: "🔵", color: "candy-blue", glow: "210 85% 60%" },
  banana: { emoji: "🍌", color: "candy-banana", glow: "50 100% 60%" },
  bomb: { emoji: "💣", color: "primary", glow: "280 85% 55%" },
};

export const SymbolDisplay = ({ cell }: SymbolDisplayProps) => {
  const data = symbolData[cell.symbol.type];

  return (
    <motion.div
      animate={
        cell.isWinning
          ? {
              scale: [1, 1.2, 1],
              rotate: [0, 8, -8, 0],
            }
          : {}
      }
      transition={{
        duration: 0.6,
        repeat: cell.isWinning ? Infinity : 0,
      }}
      className="relative w-full h-full"
    >
      <motion.div
        className={`
          w-full h-full rounded-2xl
          flex items-center justify-center
          candy-glow
          ${cell.isWinning ? 'shadow-win' : 'shadow-symbol'}
        `}
        style={{
          background: cell.isWinning 
            ? `radial-gradient(circle at 30% 30%, hsl(${data.glow} / 0.9), hsl(${data.glow} / 0.6))`
            : `radial-gradient(circle at 30% 30%, hsl(${data.glow} / 0.85), hsl(${data.glow} / 0.5))`,
          boxShadow: cell.isWinning
            ? `0 0 30px hsl(${data.glow} / 0.8), inset 0 4px 8px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.2)`
            : `0 4px 12px rgba(0,0,0,0.2), inset 0 4px 8px rgba(255,255,255,0.3), inset 0 -4px 8px rgba(0,0,0,0.15)`,
        }}
      >
        <motion.div
          className="text-5xl md:text-6xl"
          animate={cell.isWinning ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.5, repeat: cell.isWinning ? Infinity : 0 }}
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          }}
        >
          {data.emoji}
        </motion.div>
      </motion.div>

      {cell.symbol.type === "bomb" && cell.symbol.multiplier && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-base shadow-button border-2 border-white"
        >
          x{cell.symbol.multiplier}
        </motion.div>
      )}

      {cell.isWinning && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 20px hsl(45 100% 60% / 0.6)`,
              `0 0 40px hsl(45 100% 60% / 1)`,
              `0 0 20px hsl(45 100% 60% / 0.6)`,
            ],
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
