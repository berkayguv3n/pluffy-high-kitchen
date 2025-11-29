import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface WinDisplayProps {
  currentWin: number;
  onDismiss: () => void;
}

export const WinDisplay = ({ currentWin, onDismiss }: WinDisplayProps) => {
  // Auto dismiss after 2 seconds
  useEffect(() => {
    if (currentWin > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentWin, onDismiss]);
  return (
    <AnimatePresence>
      {currentWin > 0 && (
        <motion.div
          initial={{ scale: 0, y: -50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 50 }}
          transition={{ type: "spring", damping: 15 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 rounded-2xl px-12 py-6 shadow-2xl border-4 border-yellow-200"
            style={{
              boxShadow: "0 0 40px rgba(255,215,0,0.6), inset 0 4px 12px rgba(255,255,255,0.5)"
            }}
          >
            <motion.p
              className="text-5xl md:text-6xl font-black text-purple-900 text-center"
              animate={{
                textShadow: [
                  "0 0 10px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,1)",
                  "0 0 10px rgba(255,255,255,0.8)",
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              +${currentWin}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


