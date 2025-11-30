import { motion, AnimatePresence } from "framer-motion";

interface FreeSpinsEndModalProps {
  open: boolean;
  onClose: () => void;
  totalWin: number;
  bet: number;
}

export const FreeSpinsEndModal = ({ open, onClose, totalWin, bet }: FreeSpinsEndModalProps) => {
  const multiplier = totalWin / bet;
  
  // Determine win category
  const getWinCategory = () => {
    if (multiplier >= 100) return { label: "INSANE WIN!", color: "#ff6b6b", emoji: "🤯🔥" };
    if (multiplier >= 50) return { label: "MEGA WIN!", color: "#fbbf24", emoji: "🔥💰" };
    if (multiplier >= 20) return { label: "BIG WIN!", color: "#4ade80", emoji: "✨💚" };
    if (multiplier >= 5) return { label: "NICE WIN!", color: "#a78bfa", emoji: "💜" };
    return { label: "TOTAL WIN", color: "#ffffff", emoji: "🎰" };
  };
  
  const category = getWinCategory();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "radial-gradient(ellipse at center, rgba(22,163,74,0.3) 0%, rgba(0,0,0,0.95) 100%)",
          }}
          onClick={onClose}
        >
          {/* Celebration particles */}
          {totalWin > 0 && [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 10 + Math.random() * 20,
                height: 10 + Math.random() * 20,
                background: i % 2 === 0 
                  ? `radial-gradient(circle, rgba(74,222,128,0.8) 0%, transparent 70%)`
                  : `radial-gradient(circle, rgba(251,191,36,0.8) 0%, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100 - Math.random() * 200],
                x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative text-center z-10 p-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* FREE SPINS COMPLETE title */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h1 
                className="text-4xl md:text-5xl font-black"
                style={{
                  background: "linear-gradient(180deg, #4ade80 0%, #22c55e 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 3px 0 #16a34a)",
                }}
              >
                FREE SPINS COMPLETE!
              </h1>
            </motion.div>

            {/* Win category label */}
            {totalWin > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="mb-4"
              >
                <motion.p
                  animate={{ 
                    scale: [1, 1.1, 1],
                    textShadow: [
                      `0 0 20px ${category.color}`,
                      `0 0 40px ${category.color}`,
                      `0 0 20px ${category.color}`,
                    ],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-3xl md:text-4xl font-black"
                  style={{ color: category.color }}
                >
                  {category.emoji} {category.label} {category.emoji}
                </motion.p>
              </motion.div>
            )}

            {/* Total win amount */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", damping: 15 }}
              className="mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-7xl md:text-8xl font-black"
                style={{ 
                  color: category.color,
                  textShadow: `0 0 50px ${category.color}80, 0 6px 0 rgba(0,0,0,0.5)`,
                }}
              >
                ₺{totalWin.toLocaleString()}
              </motion.div>
              
              {/* Multiplier */}
              {multiplier >= 1 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-2xl font-bold mt-4"
                  style={{ color: category.color }}
                >
                  {multiplier.toFixed(1)}x Total Bet
                </motion.p>
              )}
            </motion.div>

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-16 py-5 text-2xl font-black text-white rounded-full uppercase tracking-wider"
              style={{
                background: "linear-gradient(180deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)",
                boxShadow: "0 6px 30px rgba(124,58,237,0.5), inset 0 2px 10px rgba(255,255,255,0.2), 0 4px 0 #3b0764",
              }}
            >
              CONTINUE
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


