import { motion } from "framer-motion";
import { GameButton } from "@/components/ui/GameButton";
import btnSpinNormal from "@/assets/btn-spin-normal.png";
import btnSpinHover from "@/assets/btn-spin-hover.png";
import btnSpinPressed from "@/assets/btn-spin-pressed.png";
import btnSquareNormal from "@/assets/btn-square-normal.png";
import btnSquareHover from "@/assets/btn-square-hover.png";
import btnSquarePressed from "@/assets/btn-square-pressed.png";
import btnRectNormal from "@/assets/btn-rect-normal.png";
import btnRectHover from "@/assets/btn-rect-hover.png";
import btnRectPressed from "@/assets/btn-rect-pressed.png";
import btnIconInfo from "@/assets/btn-icon-info.png";
import btnIconSettings from "@/assets/btn-icon-settings.png";
import btnTextAuto from "@/assets/btn-text-auto.png";
import btnTextMaxBet from "@/assets/btn-text-maxbet.png";

interface BottomBarProps {
  balance: number;
  bet: number;
  onSpin: () => void;
  isSpinning: boolean;
  lastSpinWin: number;
}

export const BottomBar = ({ balance, bet, onSpin, isSpinning, lastSpinWin }: BottomBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 gradient-button flex items-center justify-between px-6 z-20 border-t-4 border-[#FFD700] shadow-card">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        <GameButton
          backgroundNormal={btnSquareNormal}
          backgroundHover={btnSquareHover}
          backgroundPressed={btnSquarePressed}
          iconImage={btnIconSettings}
          className="w-16 h-16"
        />
        <GameButton
          backgroundNormal={btnSquareNormal}
          backgroundHover={btnSquareHover}
          backgroundPressed={btnSquarePressed}
          iconImage={btnIconInfo}
          className="w-16 h-16"
        />
      </div>

      {/* Center info */}
      <div className="flex items-center gap-8 text-white">
        <div className="text-center">
          <div className="text-xs font-bold opacity-80">CREDIT</div>
          <div className="text-2xl font-bold text-glow">${balance.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold opacity-80">BET</div>
          <div className="text-2xl font-bold text-glow">${bet.toFixed(2)}</div>
        </div>
        
        {lastSpinWin > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center px-6 bg-accent/20 rounded-xl py-2 border-2 border-accent"
          >
            <div className="text-xs font-bold opacity-80">LAST SPIN WIN</div>
            <motion.div 
              className="text-3xl font-bold text-glow"
              animate={{ 
                scale: [1, 1.1, 1],
                textShadow: [
                  "0 0 10px rgba(255,215,0,0.5)",
                  "0 0 20px rgba(255,215,0,0.8)",
                  "0 0 10px rgba(255,215,0,0.5)"
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ color: "#FFD700" }}
            >
              ${lastSpinWin.toFixed(2)}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <GameButton
          backgroundNormal={btnRectNormal}
          backgroundHover={btnRectHover}
          backgroundPressed={btnRectPressed}
          textImage={btnTextMaxBet}
          className="w-32 h-14"
        />
        
        <GameButton
          backgroundNormal={btnSpinNormal}
          backgroundHover={btnSpinHover}
          backgroundPressed={btnSpinPressed}
          onClick={onSpin}
          disabled={isSpinning}
          className="w-24 h-24"
        />

        <GameButton
          backgroundNormal={btnRectNormal}
          backgroundHover={btnRectHover}
          backgroundPressed={btnRectPressed}
          textImage={btnTextAuto}
          className="w-32 h-14"
        />
      </div>
    </div>
  );
};
