import { motion } from "framer-motion";
import { Cell } from "../SlotGame";
import symbolChef from "@/assets/symbol-chef.png";
import symbolCookie from "@/assets/symbol-cookie.png";
import symbolMuffin from "@/assets/symbol-muffin.png";
import symbolPizza from "@/assets/symbol-pizza.png";
import symbolSmoothie from "@/assets/symbol-smoothie.png";
import symbolBrownie from "@/assets/symbol-brownie.png";
import symbolSpatula from "@/assets/symbol-spatula.png";
import symbolRolling from "@/assets/symbol-rolling.png";
import symbolOven from "@/assets/symbol-oven.png";

interface SymbolDisplayProps {
  cell: Cell;
}

const symbolData = {
  purple: { img: symbolChef, color: "candy-purple", glow: "280 85% 60%" },
  grape: { img: symbolCookie, color: "candy-grape", glow: "270 75% 50%" },
  green: { img: symbolMuffin, color: "candy-green", glow: "145 70% 45%" },
  red: { img: symbolPizza, color: "candy-red", glow: "355 85% 55%" },
  heart: { img: symbolSmoothie, color: "candy-heart", glow: "350 90% 60%" },
  plum: { img: symbolBrownie, color: "candy-plum", glow: "290 65% 50%" },
  blue: { img: symbolSpatula, color: "candy-blue", glow: "210 85% 60%" },
  banana: { img: symbolRolling, color: "candy-banana", glow: "50 100% 60%" },
  bomb: { img: symbolOven, color: "primary", glow: "145 70% 50%" },
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
            ? `radial-gradient(circle at 50% 50%, hsl(${data.glow} / 0.4), hsl(${data.glow} / 0.1))`
            : `radial-gradient(circle at 50% 50%, hsl(${data.glow} / 0.3), hsl(${data.glow} / 0.05))`,
          boxShadow: cell.isWinning
            ? `0 0 30px hsl(${data.glow} / 0.8), inset 0 4px 8px rgba(255,255,255,0.2)`
            : `0 4px 12px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.2)`,
        }}
      >
        <motion.img
          src={data.img}
          alt={cell.symbol.type}
          className="w-[80%] h-[80%] object-contain"
          animate={cell.isWinning ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.5, repeat: cell.isWinning ? Infinity : 0 }}
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          }}
        />
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
