import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Coins, TrendingUp, Zap, Gift } from "lucide-react";

interface GameStatsProps {
  balance: number;
  totalWin: number;
  currentWin: number;
  freeSpins: number;
  freeSpinMultiplier: number;
}

export const GameStats = ({
  balance,
  totalWin,
  currentWin,
  freeSpins,
  freeSpinMultiplier,
}: GameStatsProps) => {
  return (
    <div className="space-y-4">
      <Card className="p-6 gradient-board shadow-card border-border">
        <div className="space-y-4">
          <motion.div
            className="flex items-center justify-between"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-accent" />
              <span className="text-muted-foreground">Balance</span>
            </div>
            <span className="text-2xl font-bold text-accent">${balance}</span>
          </motion.div>

          <div className="h-px bg-border" />

          <motion.div
            className="flex items-center justify-between"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Total Win</span>
            </div>
            <span className="text-2xl font-bold text-primary">${totalWin}</span>
          </motion.div>

          {currentWin > 0 && (
            <>
              <div className="h-px bg-border" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  <span className="text-muted-foreground">Current Win</span>
                </div>
                <motion.span
                  className="text-2xl font-bold text-accent text-glow"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  ${currentWin}
                </motion.span>
              </motion.div>
            </>
          )}

          {freeSpins > 0 && (
            <>
              <div className="h-px bg-border" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-secondary" />
                  <span className="text-muted-foreground">Free Spins</span>
                </div>
                <span className="text-2xl font-bold text-secondary">
                  {freeSpins}
                </span>
              </motion.div>

              {freeSpinMultiplier > 1 && (
                <>
                  <motion.div
                    className="bg-primary/20 rounded-lg p-3 text-center"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      Multiplier
                    </p>
                    <p className="text-3xl font-bold text-primary text-glow">
                      x{freeSpinMultiplier}
                    </p>
                  </motion.div>
                </>
              )}
            </>
          )}
        </div>
      </Card>

      <Card className="p-6 gradient-board shadow-card border-border">
        <h3 className="text-lg font-bold mb-4 text-foreground">How to Play</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Match 8+ symbols to win</li>
          <li>• Winning symbols cascade down</li>
          <li>• 💣 Bombs multiply your wins</li>
          <li>• 4+ bombs trigger free spins</li>
          <li>• Free spins have progressive multipliers</li>
        </ul>
      </Card>
    </div>
  );
};
