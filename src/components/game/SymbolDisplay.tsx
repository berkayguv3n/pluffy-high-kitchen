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
  purple: { img: symbolChef, name: "Pluffy Chef" },
  grape: { img: symbolCookie, name: "Cookie Jar" },
  green: { img: symbolMuffin, name: "Muffin" },
  red: { img: symbolPizza, name: "Pizza" },
  heart: { img: symbolSmoothie, name: "Smoothie" },
  plum: { img: symbolBrownie, name: "Brownie" },
  blue: { img: symbolSpatula, name: "Spatula" },
  banana: { img: symbolRolling, name: "Rolling Pin" },
  bomb: { img: symbolOven, name: "Oven" },
};

export const SymbolDisplay = ({ cell }: SymbolDisplayProps) => {
  const data = symbolData[cell.symbol.type];

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
        duration: 0.6,
        repeat: cell.isWinning ? Infinity : 0,
      }}
      className="relative w-full h-full flex items-center justify-center"
    >
      <motion.img
        src={data.img}
        alt={data.name}
        className="w-[90%] h-[90%] object-contain"
        animate={cell.isWinning ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: cell.isWinning ? Infinity : 0 }}
        style={{
          filter: cell.isWinning 
            ? "drop-shadow(0 0 20px rgba(255,215,0,0.8))"
            : "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
        }}
      />

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
              "0 0 20px rgba(255,215,0,0.6)",
              "0 0 40px rgba(255,215,0,1)",
              "0 0 20px rgba(255,215,0,0.6)",
            ],
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
