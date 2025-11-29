import { motion } from "framer-motion";
import { GameButton } from "@/components/ui/GameButton";
import { Info } from "lucide-react";
import { useState } from "react";
import { InfoModal } from "./InfoModal";
import btnRectNormal from "@/assets/btn-rect-normal.png";
import btnRectHover from "@/assets/btn-rect-hover.png";
import btnRectPressed from "@/assets/btn-rect-pressed.png";
import btnTextBuyBonus from "@/assets/btn-text-buybonus.png";
import btnTextFreeSpins from "@/assets/btn-text-freespins.png";
import btnIconInfo from "@/assets/btn-icon-info.png";

interface SidebarProps {
  balance: number;
  bet: number;
  setBet: (bet: number) => void;
  freeSpins: number;
  freeSpinMultiplier: number;
}

export const Sidebar = ({ balance, bet, setBet, freeSpins, freeSpinMultiplier }: SidebarProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <div className="w-64 p-4 flex flex-col gap-6">
      {/* Info Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={() => setShowInfoModal(true)}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 shadow-lg hover:shadow-green-400/50 transition-all flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <img src={btnIconInfo} alt="Info" className="w-10 h-10" />
        </motion.button>
      </div>

      <InfoModal open={showInfoModal} onOpenChange={setShowInfoModal} />
      {/* Buy Bonus Button */}
      <div className="flex flex-col items-center gap-2">
        <GameButton
          backgroundNormal={btnRectNormal}
          backgroundHover={btnRectHover}
          backgroundPressed={btnRectPressed}
          textImage={btnTextBuyBonus}
          className="w-52 h-20"
        />
        <div className="text-white text-3xl font-bold text-center text-glow drop-shadow-lg">
          $200.00
        </div>
      </div>

      {/* Super Free Spins Button with Price */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-white text-lg font-bold text-center text-glow drop-shadow-lg">
          SUPER
        </div>
        <GameButton
          backgroundNormal={btnRectNormal}
          backgroundHover={btnRectHover}
          backgroundPressed={btnRectPressed}
          textImage={btnTextFreeSpins}
          className="w-52 h-20"
        />
        <div className="text-white text-3xl font-bold text-center text-glow drop-shadow-lg">
          $1,000.00
        </div>
      </div>

      {/* Bet Display */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-white text-lg font-bold text-center text-glow drop-shadow-lg">
          BET
        </div>
        <div className="text-white text-5xl font-bold text-center text-glow drop-shadow-lg">
          ${bet.toFixed(2)}
        </div>
        <div className="text-white text-sm font-bold text-center text-glow drop-shadow-lg leading-tight">
          DOUBLE YOUR CHANCE
          <br />
          TO ENTER FEATURE
        </div>
      </div>

      {/* Free Spins Indicator */}
      {freeSpins > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center gap-2 mt-4"
        >
          <div className="text-white text-lg font-bold text-center text-glow drop-shadow-lg">
            FREE SPINS
          </div>
          <div className="text-white text-6xl font-bold text-glow drop-shadow-lg">
            {freeSpins}
          </div>
          {freeSpinMultiplier > 1 && (
            <div className="text-accent text-3xl font-bold text-glow drop-shadow-lg">
              x{freeSpinMultiplier}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
