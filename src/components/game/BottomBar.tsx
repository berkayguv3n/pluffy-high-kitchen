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
    <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 via-black/40 to-transparent backdrop-blur-sm flex items-center justify-between px-8 z-20">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <GameButton
          backgroundNormal={btnSquareNormal}
          backgroundHover={btnSquareHover}
          backgroundPressed={btnSquarePressed}
          iconImage={btnIconSettings}
          className="w-20 h-20"
        />
        <GameButton
          backgroundNormal={btnSquareNormal}
          backgroundHover={btnSquareHover}
          backgroundPressed={btnSquarePressed}
          iconImage={btnIconInfo}
          className="w-20 h-20"
        />
      </div>

      {/* Center info */}
      <div className="flex items-center gap-12 text-white">
        <div className="text-center">
          <div className="text-sm font-bold opacity-90 mb-1">CREDIT</div>
          <div className="text-3xl font-bold text-glow drop-shadow-lg">
            ${balance.toFixed(2)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm font-bold opacity-90 mb-1">BET</div>
          <div className="text-3xl font-bold text-glow drop-shadow-lg">
            ${bet.toFixed(2)}
          </div>
        </div>
        
        {lastSpinWin > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-sm font-bold opacity-90 mb-1">LAST SPIN WIN</div>
            <motion.div 
              className="text-4xl font-bold"
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
      <div className="flex items-center gap-5">
        <GameButton
          backgroundNormal={btnRectNormal}
          backgroundHover={btnRectHover}
          backgroundPressed={btnRectPressed}
          textImage={btnTextMaxBet}
          className="w-40 h-16"
        />
        
        <GameButton
          backgroundNormal={btnSpinNormal}
          backgroundHover={btnSpinHover}
          backgroundPressed={btnSpinPressed}
          onClick={onSpin}
          disabled={isSpinning}
          className="w-32 h-32"
        />

        <GameButton
          backgroundNormal={btnRectNormal}
          backgroundHover={btnRectHover}
          backgroundPressed={btnRectPressed}
          textImage={btnTextAuto}
          className="w-40 h-16"
        />
      </div>
    </div>
  );
};
