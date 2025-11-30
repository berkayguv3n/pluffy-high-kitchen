import { motion } from "framer-motion";
import { GameButton } from "@/components/ui/GameButton";
import { BetPanel } from "./BetPanel";
import btnRectNormal from "@/assets/btn-rect-normal.png";
import btnRectHover from "@/assets/btn-rect-hover.png";
import btnRectPressed from "@/assets/btn-rect-pressed.png";
import btnTextBuyBonus from "@/assets/btn-text-buybonus.png";
import { GameMode } from "../SlotGame";

interface SidebarProps {
  balance: number;
  bet: number;
  setBet: (bet: number) => void;
  freeSpins: number;
  onBuyBonus: () => void;
  gameMode: GameMode;
}

// Bet steps
const BET_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

export const Sidebar = ({ balance, bet, setBet, freeSpins, onBuyBonus, gameMode }: SidebarProps) => {
  const buyBonusCost = bet * 100;
  const isFreeSpinMode = gameMode === "freespins";

  const handleIncreaseBet = () => {
    const currentIndex = BET_STEPS.indexOf(bet);
    if (currentIndex < BET_STEPS.length - 1) {
      setBet(BET_STEPS[currentIndex + 1]);
    } else if (currentIndex === -1) {
      // Find next higher step
      const nextStep = BET_STEPS.find(s => s > bet);
      if (nextStep) setBet(nextStep);
    }
  };

  const handleDecreaseBet = () => {
    const currentIndex = BET_STEPS.indexOf(bet);
    if (currentIndex > 0) {
      setBet(BET_STEPS[currentIndex - 1]);
    } else if (currentIndex === -1) {
      // Find next lower step
      const prevSteps = BET_STEPS.filter(s => s < bet);
      if (prevSteps.length > 0) setBet(prevSteps[prevSteps.length - 1]);
    }
  };

  return (
    <motion.div 
      className="w-72 p-4 flex flex-col gap-6 pt-8"
      animate={{
        background: isFreeSpinMode
          ? "linear-gradient(180deg, rgba(22,163,74,0.2) 0%, transparent 100%)"
          : "transparent",
      }}
    >
      {/* Buy Bonus Button - hidden during free spins */}
      {!isFreeSpinMode && (
        <div className="flex flex-col items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GameButton
              backgroundNormal={btnRectNormal}
              backgroundHover={btnRectHover}
              backgroundPressed={btnRectPressed}
              textImage={btnTextBuyBonus}
              onClick={onBuyBonus}
              className="w-56 h-20"
            />
          </motion.div>
          <motion.div 
            className="text-2xl font-bold text-center"
            style={{ 
              color: "#4ade80",
              textShadow: "0 0 15px rgba(74,222,128,0.6), 0 2px 4px rgba(0,0,0,0.5)" 
            }}
            animate={{
              textShadow: [
                "0 0 15px rgba(74,222,128,0.4)",
                "0 0 25px rgba(74,222,128,0.7)",
                "0 0 15px rgba(74,222,128,0.4)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ₺{buyBonusCost.toLocaleString()}
          </motion.div>
          <div className="text-purple-300 text-xs font-bold text-center opacity-80">
            100x BET
          </div>
        </div>
      )}

      {/* Bet Panel */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <BetPanel
          bet={bet}
          onIncrease={handleIncreaseBet}
          onDecrease={handleDecreaseBet}
          disabled={isFreeSpinMode}
        />
      </div>

      {/* Balance Display */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <div 
          className="px-6 py-3 rounded-xl text-center"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
            border: isFreeSpinMode ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(168,85,247,0.3)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <div 
            className="text-xs font-bold uppercase tracking-wider mb-1"
            style={{ color: isFreeSpinMode ? "#4ade80" : "#a78bfa" }}
          >
            Balance
          </div>
          <motion.div 
            className="text-2xl font-black text-white"
            style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
          >
            ₺{balance.toLocaleString()}
          </motion.div>
        </div>
      </div>

      {/* Free Spins Mode Indicator */}
      {isFreeSpinMode && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-2 mt-6 rounded-2xl p-4"
          style={{
            background: "linear-gradient(180deg, rgba(22,163,74,0.4) 0%, rgba(21,128,61,0.3) 100%)",
            border: "2px solid rgba(74,222,128,0.4)",
            boxShadow: "0 0 30px rgba(74,222,128,0.2)",
          }}
        >
          <motion.div 
            className="text-lg font-bold text-center"
            style={{ color: "#4ade80" }}
            animate={{
              textShadow: [
                "0 0 10px rgba(74,222,128,0.5)",
                "0 0 20px rgba(74,222,128,0.8)",
                "0 0 10px rgba(74,222,128,0.5)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🔥 BAKING MODE 🔥
          </motion.div>
          <div className="text-green-300 text-sm font-bold text-center opacity-80">
            Multiplier jars active!
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
