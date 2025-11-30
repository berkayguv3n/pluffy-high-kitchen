import { motion } from "framer-motion";
import { GameButton } from "@/components/ui/GameButton";
import { useState } from "react";
import { InfoModal } from "./InfoModal";
import { GameMode } from "../SlotGame";
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
  gameMode: GameMode;
}

export const BottomBar = ({ balance, bet, onSpin, isSpinning, lastSpinWin, gameMode }: BottomBarProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const isFreeSpinMode = gameMode === "freespins";

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 h-32 backdrop-blur-sm z-20"
      animate={{
        background: isFreeSpinMode
          ? "linear-gradient(to top, rgba(22,163,74,0.4) 0%, rgba(22,163,74,0.2) 50%, transparent 100%)"
          : "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
      }}
    >
      <div className="h-full flex items-center justify-between px-8">
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
            onClick={() => setShowInfoModal(true)}
            className="w-20 h-20"
          />
        </div>

        <InfoModal open={showInfoModal} onOpenChange={setShowInfoModal} />

        {/* Center info */}
        <div className="flex items-center gap-12 text-white min-w-[600px] justify-center">
          <div className="text-center w-40">
            <div 
              className="text-sm font-bold mb-1"
              style={{ color: isFreeSpinMode ? "#4ade80" : "rgba(255,255,255,0.9)" }}
            >
              CREDIT
            </div>
            <div className="text-3xl font-bold drop-shadow-lg">
              ₺{balance.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center w-32">
            <div 
              className="text-sm font-bold mb-1"
              style={{ color: isFreeSpinMode ? "#4ade80" : "rgba(255,255,255,0.9)" }}
            >
              BET
            </div>
            <div className="text-3xl font-bold drop-shadow-lg">
              ₺{bet.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center w-48">
            <div 
              className="text-sm font-bold mb-1"
              style={{ color: isFreeSpinMode ? "#4ade80" : "rgba(255,255,255,0.9)" }}
            >
              {isFreeSpinMode ? "SPIN WIN" : "LAST SPIN WIN"}
            </div>
            {lastSpinWin > 0 ? (
              <motion.div 
                key={lastSpinWin}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: 1,
                }}
                className="text-4xl font-bold"
                style={{ 
                  color: isFreeSpinMode ? "#4ade80" : "#FFD700",
                  textShadow: isFreeSpinMode 
                    ? "0 0 20px rgba(74,222,128,0.8)"
                    : "0 0 20px rgba(255,215,0,0.8)",
                }}
              >
                ₺{lastSpinWin.toLocaleString()}
              </motion.div>
            ) : (
              <div className="text-3xl font-bold drop-shadow-lg opacity-60">
                ₺0
              </div>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-5">
          {!isFreeSpinMode && (
            <GameButton
              backgroundNormal={btnRectNormal}
              backgroundHover={btnRectHover}
              backgroundPressed={btnRectPressed}
              textImage={btnTextMaxBet}
              className="w-40 h-16"
            />
          )}
          
          {/* Spin button - different style in free spins */}
          <motion.div
            animate={isFreeSpinMode ? {
              filter: [
                "drop-shadow(0 0 10px rgba(74,222,128,0.5))",
                "drop-shadow(0 0 25px rgba(74,222,128,0.8))",
                "drop-shadow(0 0 10px rgba(74,222,128,0.5))",
              ],
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <GameButton
              backgroundNormal={btnSpinNormal}
              backgroundHover={btnSpinHover}
              backgroundPressed={btnSpinPressed}
              onClick={onSpin}
              disabled={isSpinning}
              className="w-32 h-32"
            />
          </motion.div>

          {!isFreeSpinMode && (
            <GameButton
              backgroundNormal={btnRectNormal}
              backgroundHover={btnRectHover}
              backgroundPressed={btnRectPressed}
              textImage={btnTextAuto}
              className="w-40 h-16"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
