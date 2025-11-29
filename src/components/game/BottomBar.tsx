import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Settings, Info, Volume2, Plus, Minus } from "lucide-react";

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
        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
          <Settings className="h-6 w-6" />
        </Button>
        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
          <Volume2 className="h-6 w-6" />
        </Button>
        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
          <Info className="h-6 w-6" />
        </Button>
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
        
        <div className="text-center px-6">
          <div className="text-base font-bold text-glow">HOLD SPACE FOR TURBO SPIN</div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/20 rounded-full h-12 w-12 text-2xl"
        >
          <Minus className="h-6 w-6" />
        </Button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSpin}
          disabled={isSpinning}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-b from-white to-gray-200 flex items-center justify-center shadow-button border-4 border-white">
            <motion.div
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isSpinning ? Infinity : 0, ease: "linear" }}
              className="text-4xl"
            >
              🎰
            </motion.div>
          </div>
        </motion.button>

        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/20 rounded-full h-12 w-12 text-2xl"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          className="text-white hover:bg-white/20 font-bold text-sm"
        >
          AUTOPLAY
        </Button>
      </div>
    </div>
  );
};
