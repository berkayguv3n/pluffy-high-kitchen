import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Plus, Minus } from "lucide-react";

interface GameControlsProps {
  balance: number;
  bet: number;
  setBet: (bet: number) => void;
  onSpin: () => void;
  isSpinning: boolean;
  freeSpins: number;
}

export const GameControls = ({
  balance,
  bet,
  setBet,
  onSpin,
  isSpinning,
  freeSpins,
}: GameControlsProps) => {
  const adjustBet = (amount: number) => {
    const newBet = Math.max(1, Math.min(100, bet + amount));
    setBet(newBet);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-1">Bet Amount</p>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => adjustBet(-5)}
              disabled={isSpinning || freeSpins > 0}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="bg-card px-4 py-2 rounded-lg border border-border min-w-[80px] text-center">
              <span className="text-xl font-bold text-accent">${bet}</span>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => adjustBet(5)}
              disabled={isSpinning || freeSpins > 0}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="lg"
          onClick={onSpin}
          disabled={isSpinning || (freeSpins === 0 && balance < bet)}
          className="gradient-primary text-primary-foreground font-bold text-lg px-8 py-6 rounded-xl shadow-glow"
        >
          <Play className="mr-2 h-5 w-5" />
          {isSpinning ? "SPINNING..." : freeSpins > 0 ? "FREE SPIN" : "SPIN"}
        </Button>
      </motion.div>
    </div>
  );
};
