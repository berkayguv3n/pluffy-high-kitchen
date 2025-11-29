import { motion } from "framer-motion";
import { GameButton } from "@/components/ui/GameButton";
import btnRectNormal from "@/assets/btn-rect-normal.png";
import btnRectHover from "@/assets/btn-rect-hover.png";
import btnRectPressed from "@/assets/btn-rect-pressed.png";
import btnTextBuyBonus from "@/assets/btn-text-buybonus.png";
import btnTextFreeSpins from "@/assets/btn-text-freespins.png";

interface SidebarProps {
  balance: number;
  bet: number;
  setBet: (bet: number) => void;
  freeSpins: number;
  freeSpinMultiplier: number;
}

export const Sidebar = ({ balance, bet, setBet, freeSpins, freeSpinMultiplier }: SidebarProps) => {
  return (
    <div className="w-52 p-3 flex flex-col gap-3">
      {/* Buy Bonus Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="gradient-sidebar rounded-2xl p-4 border-4 border-[#FFD700] shadow-card relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <div className="relative">
          <GameButton
            backgroundNormal={btnRectNormal}
            backgroundHover={btnRectHover}
            backgroundPressed={btnRectPressed}
            textImage={btnTextBuyBonus}
            className="w-full h-16 mb-2"
          />
          <div className="text-white text-2xl font-bold text-center text-glow">$200.00</div>
        </div>
      </motion.div>

      {/* Super Free Spins Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="gradient-sidebar rounded-2xl p-4 border-4 border-[#FFD700] shadow-card relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="text-white text-xs font-bold mb-2 text-center text-glow">SUPER</div>
          <GameButton
            backgroundNormal={btnRectNormal}
            backgroundHover={btnRectHover}
            backgroundPressed={btnRectPressed}
            textImage={btnTextFreeSpins}
            className="w-full h-16 mb-2"
          />
          <div className="text-white text-2xl font-bold text-center text-glow">$1,000.00</div>
        </div>
      </motion.div>

      {/* Bet Display */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="gradient-sidebar rounded-2xl p-4 border-4 border-[#FFD700] shadow-card relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="text-white text-xs font-bold mb-2 text-center text-glow">BET</div>
          <div className="text-white text-3xl font-bold mb-2 text-center text-glow">
            ${bet.toFixed(2)}
          </div>
          <div className="text-white text-xs font-bold text-center text-glow">
            DOUBLE YOUR CHANCE
            <br />
            TO ENTER FEATURE
          </div>
        </div>
      </motion.div>

      {/* Free Spins Indicator */}
      {freeSpins > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="gradient-sidebar rounded-2xl p-4 border-4 border-[#FFD700] shadow-card relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <div className="relative text-center">
            <div className="text-white text-sm font-bold mb-2 text-glow">FREE SPINS</div>
            <div className="text-white text-5xl font-bold text-glow">{freeSpins}</div>
            {freeSpinMultiplier > 1 && (
              <div className="text-accent text-2xl font-bold mt-2 text-glow">
                x{freeSpinMultiplier}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
