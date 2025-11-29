import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface SidebarProps {
  balance: number;
  bet: number;
  setBet: (bet: number) => void;
  freeSpins: number;
  freeSpinMultiplier: number;
}

export const Sidebar = ({ balance, bet, setBet, freeSpins, freeSpinMultiplier }: SidebarProps) => {
  const adjustBet = (amount: number) => {
    const newBet = Math.max(0.5, Math.min(100, bet + amount));
    setBet(newBet);
  };

  return (
    <div className="w-52 p-3 flex flex-col gap-3">
      {/* Buy Free Spins Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="gradient-sidebar rounded-2xl p-4 border-4 border-[#FFD700] shadow-card relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <div className="relative text-center">
          <div className="text-white text-xs font-bold mb-1 text-glow">BUY</div>
          <div className="text-white text-lg font-bold mb-1 text-glow">FREE SPINS</div>
          <div className="text-white text-2xl font-bold text-glow">$200.00</div>
        </div>
      </motion.div>

      {/* Super Free Spins Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="gradient-sidebar rounded-2xl p-4 border-4 border-[#FFD700] shadow-card relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <div className="relative text-center">
          <div className="text-white text-xs font-bold mb-1 text-glow">BUY</div>
          <div className="text-white text-base font-bold mb-1 text-glow">SUPER</div>
          <div className="text-white text-base font-bold mb-1 text-glow">FREE SPINS</div>
          <div className="text-white text-2xl font-bold text-glow">$1,000.00</div>
        </div>
      </motion.div>

      {/* Bet Control */}
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
          <div className="text-white text-xs font-bold mb-2 text-center text-glow">
            DOUBLE YOUR CHANCE
            <br />
            TO ENTER FEATURE
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
            >
              ➡️ OFF
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Big Spin Button Display */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-primary rounded-2xl p-8 border-4 border-primary shadow-card aspect-square flex items-center justify-center"
      >
        <div className="text-white text-6xl">🎰</div>
      </motion.div>
    </div>
  );
};
