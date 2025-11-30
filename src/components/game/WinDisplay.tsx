import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface WinDisplayProps {
  currentWin: number;
  bet: number;
  onDismiss: () => void;
}

export const WinDisplay = ({ currentWin, bet, onDismiss }: WinDisplayProps) => {
  const [displayedWin, setDisplayedWin] = useState(0);
  
  // Calculate win multiplier
  const winMultiplier = currentWin / bet;
  
  // Determine win category
  const getWinCategory = () => {
    if (winMultiplier >= 100) return { label: "INSANE WIN", color: "#ff6b6b", emoji: "🤯" };
    if (winMultiplier >= 50) return { label: "MEGA WIN", color: "#fbbf24", emoji: "🔥" };
    if (winMultiplier >= 20) return { label: "BIG WIN", color: "#4ade80", emoji: "✨" };
    if (winMultiplier >= 5) return { label: "NICE WIN", color: "#a78bfa", emoji: "💜" };
    return { label: "", color: "#ffffff", emoji: "" };
  };
  
  const winCategory = getWinCategory();
  const isBigWin = winMultiplier >= 20;
  const isMegaWin = winMultiplier >= 50;
  const isInsaneWin = winMultiplier >= 100;

  // Animate win counter
  useEffect(() => {
    if (currentWin > 0) {
      const duration = Math.min(2000, Math.max(500, winMultiplier * 50));
      const steps = 30;
      const increment = currentWin / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= currentWin) {
          setDisplayedWin(currentWin);
          clearInterval(interval);
        } else {
          setDisplayedWin(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    } else {
      setDisplayedWin(0);
    }
  }, [currentWin, winMultiplier]);

  // Auto dismiss
  useEffect(() => {
    if (currentWin > 0) {
      const dismissTime = isBigWin ? 3500 : 2000;
      const timer = setTimeout(() => {
        onDismiss();
      }, dismissTime);
      return () => clearTimeout(timer);
    }
  }, [currentWin, onDismiss, isBigWin]);

  return (
    <AnimatePresence>
      {currentWin > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
          onClick={onDismiss}
          style={{ pointerEvents: isBigWin ? "auto" : "none" }}
        >
          {/* Background overlay for big wins */}
          {isBigWin && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              style={{
                background: isInsaneWin 
                  ? "radial-gradient(circle, rgba(255,107,107,0.4) 0%, rgba(0,0,0,0.8) 100%)"
                  : isMegaWin 
                  ? "radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(0,0,0,0.7) 100%)"
                  : "radial-gradient(circle, rgba(74,222,128,0.3) 0%, rgba(0,0,0,0.6) 100%)",
              }}
            />
          )}

          {/* Smoke/particle effects */}
          {[...Array(isBigWin ? 15 : 6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 20 + Math.random() * 40,
                height: 20 + Math.random() * 40,
                background: `radial-gradient(circle, ${winCategory.color}80 0%, transparent 70%)`,
                left: `${20 + Math.random() * 60}%`,
                top: `${40 + Math.random() * 20}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 2, 0],
                opacity: [0, 0.8, 0],
                y: -80 - Math.random() * 150,
                x: (Math.random() - 0.5) * 150,
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.08,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Main win display */}
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: -50, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative text-center"
          >
            {/* Win category label */}
            {winCategory.label && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <motion.p
                  animate={{ 
                    scale: [1, 1.1, 1],
                    textShadow: [
                      `0 0 20px ${winCategory.color}`,
                      `0 0 40px ${winCategory.color}`,
                      `0 0 20px ${winCategory.color}`,
                    ],
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-4xl md:text-5xl font-black"
                  style={{ color: winCategory.color }}
                >
                  {winCategory.emoji} {winCategory.label} {winCategory.emoji}
                </motion.p>
              </motion.div>
            )}

            {/* Win amount */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <motion.p
                className="text-7xl md:text-8xl font-black"
                style={{
                  color: winCategory.color,
                  textShadow: `
                    0 0 40px ${winCategory.color}80,
                    0 4px 0 ${isInsaneWin ? "#dc2626" : isMegaWin ? "#d97706" : isBigWin ? "#16a34a" : "#7c3aed"},
                    0 0 80px ${winCategory.color}50
                  `,
                }}
              >
                +₺{displayedWin.toLocaleString()}
              </motion.p>
            </motion.div>

            {/* Multiplier display */}
            {winMultiplier >= 2 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold mt-4"
                style={{ 
                  color: winCategory.color,
                  textShadow: `0 0 15px ${winCategory.color}80`,
                }}
              >
                {winMultiplier.toFixed(1)}x BET
              </motion.p>
            )}
          </motion.div>

          {/* Sparkle effects for insane wins */}
          {isInsaneWin && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-2 h-2 rounded-full bg-yellow-300"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
