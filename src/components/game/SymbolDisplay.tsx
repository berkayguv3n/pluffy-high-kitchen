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
// Multiplier weed jar - kullanıcı asset'i ekleyecek
// import symbolMultiplier from "@/assets/symbol-multiplier.png";

interface SymbolDisplayProps {
  cell: Cell;
}

const symbolData: { [key: string]: { img: string; name: string } } = {
  purple: { img: symbolChef, name: "Pluffy Chef" },
  grape: { img: symbolCookie, name: "Cookie Jar" },
  green: { img: symbolMuffin, name: "Muffin" },
  red: { img: symbolPizza, name: "Pizza" },
  heart: { img: symbolSmoothie, name: "Smoothie" },
  plum: { img: symbolBrownie, name: "Brownie" },
  blue: { img: symbolSpatula, name: "Spatula" },
  banana: { img: symbolRolling, name: "Rolling Pin" },
  scatter: { img: symbolOven, name: "Bonus Scatter" },
  multiplier: { img: "", name: "Weed Bomb" },
};

export const SymbolDisplay = ({ cell }: SymbolDisplayProps) => {
  if (!cell.symbol) return null;
  
  const data = symbolData[cell.symbol.type];
  const isWinning = cell.state === "winning";
  const isScatter = cell.symbol.type === "scatter";
  const isMultiplier = cell.symbol.type === "multiplier";

  // Weed Jar Multiplier - Neon weed jar with multiplier value
  if (isMultiplier) {
    return (
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        animate={isWinning ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Outer glow ring - purple/green neon */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={isWinning ? {
            boxShadow: [
              "0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(74,222,128,0.4)",
              "0 0 40px rgba(168,85,247,0.8), 0 0 60px rgba(74,222,128,0.6)",
              "0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(74,222,128,0.4)",
            ],
          } : {
            boxShadow: "0 0 15px rgba(168,85,247,0.4), 0 0 25px rgba(74,222,128,0.3)",
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Jar body - glass effect with weed leaf inside */}
        <motion.div
          className="relative w-[90%] h-[90%] rounded-lg flex items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(40,40,50,0.9) 0%, rgba(20,20,30,0.95) 100%)",
            border: "2px solid rgba(74,222,128,0.6)",
            boxShadow: isWinning 
              ? "0 0 30px rgba(74,222,128,0.8), inset 0 0 20px rgba(168,85,247,0.3)"
              : "0 4px 15px rgba(0,0,0,0.5), inset 0 0 15px rgba(168,85,247,0.2)",
          }}
        >
          {/* Jar lid */}
          <div 
            className="absolute top-0 left-0 right-0 h-3 rounded-t"
            style={{
              background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)",
              borderBottom: "1px solid rgba(74,222,128,0.4)",
            }}
          />
          
          {/* Weed leaf glow inside */}
          <motion.div
            className="absolute inset-2 rounded"
            animate={{
              background: [
                "radial-gradient(circle at 50% 50%, rgba(74,222,128,0.3) 0%, transparent 60%)",
                "radial-gradient(circle at 50% 50%, rgba(74,222,128,0.5) 0%, transparent 70%)",
                "radial-gradient(circle at 50% 50%, rgba(74,222,128,0.3) 0%, transparent 60%)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Weed leaf silhouette */}
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-40"
            style={{
              fontSize: "2rem",
              filter: "drop-shadow(0 0 8px rgba(74,222,128,0.8))",
            }}
          >
            🌿
          </div>
          
          {/* Multiplier value */}
          <motion.span 
            className="relative z-10 font-black text-xl"
            style={{ 
              color: "#4ade80",
              textShadow: "0 0 10px rgba(74,222,128,0.8), 0 0 20px rgba(74,222,128,0.5), 0 2px 4px rgba(0,0,0,0.8)" 
            }}
            animate={isWinning ? {
              textShadow: [
                "0 0 10px rgba(74,222,128,0.8), 0 0 20px rgba(74,222,128,0.5)",
                "0 0 20px rgba(74,222,128,1), 0 0 40px rgba(74,222,128,0.8)",
                "0 0 10px rgba(74,222,128,0.8), 0 0 20px rgba(74,222,128,0.5)",
              ],
            } : {}}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            x{cell.symbol.multiplier}
          </motion.span>
          
          {/* Purple neon accent lines */}
          <div 
            className="absolute left-0 top-1/4 bottom-1/4 w-0.5"
            style={{ background: "linear-gradient(180deg, transparent, rgba(168,85,247,0.6), transparent)" }}
          />
          <div 
            className="absolute right-0 top-1/4 bottom-1/4 w-0.5"
            style={{ background: "linear-gradient(180deg, transparent, rgba(168,85,247,0.6), transparent)" }}
          />
        </motion.div>
        
        {/* Smoke wisps on win */}
        {isWinning && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0.3, 1.2, 1.8],
                  y: [0, -30 - i * 10],
                  x: [(i - 1.5) * 8, (i - 1.5) * 15],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                style={{
                  width: 12,
                  height: 12,
                  background: "radial-gradient(circle, rgba(74,222,128,0.7) 0%, transparent 70%)",
                  top: "20%",
                  left: "45%",
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    );
  }

  // Scatter Symbol - Oven with BONUS text
  if (isScatter) {
    return (
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Oven image */}
        <motion.img
          src={data.img}
          alt={data.name}
          className="w-[85%] h-[85%] object-contain"
          animate={isWinning ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            filter: isWinning 
              ? "drop-shadow(0 0 25px rgba(74,222,128,1)) brightness(1.1)"
              : "drop-shadow(0 0 10px rgba(74,222,128,0.5)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
          }}
        />
        
        {/* BONUS text overlay */}
        <motion.div
          className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded"
          style={{
            background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
            boxShadow: "0 2px 8px rgba(251,191,36,0.6), inset 0 1px 2px rgba(255,255,255,0.4)",
          }}
          animate={isWinning ? {
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 2px 8px rgba(251,191,36,0.6)",
              "0 2px 20px rgba(251,191,36,1)",
              "0 2px 8px rgba(251,191,36,0.6)",
            ],
          } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <span 
            className="font-black text-xs text-white tracking-wider"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
          >
            BONUS
          </span>
        </motion.div>
        
        {/* Glow effect */}
        {isWinning && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{
              boxShadow: "0 0 30px rgba(74, 222, 128, 1)",
            }}
          />
        )}
        
        {/* Idle glow */}
        {!isWinning && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              boxShadow: "0 0 15px rgba(74, 222, 128, 0.5)",
            }}
          />
        )}
      </motion.div>
    );
  }

  // Regular symbols
  return (
    <motion.div className="relative w-full h-full flex items-center justify-center">
      <motion.img
        src={data.img}
        alt={data.name}
        className="w-[90%] h-[90%] object-contain"
        animate={isWinning ? { scale: 1.05 } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          filter: isWinning 
            ? "drop-shadow(0 0 20px rgba(255,215,0,0.9)) brightness(1.08)"
            : "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
        }}
      />

      {isWinning && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{
            boxShadow: "0 0 25px rgba(255,215,0,0.8)",
          }}
        />
      )}
    </motion.div>
  );
};
