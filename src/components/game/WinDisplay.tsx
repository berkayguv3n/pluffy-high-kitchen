import { motion, AnimatePresence } from "framer-motion";

interface WinDisplayProps {
  currentWin: number;
  onDismiss: () => void;
}

export const WinDisplay = ({ currentWin, onDismiss }: WinDisplayProps) => {
  return (
    <AnimatePresence>
      {currentWin > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.5 }}
          onClick={onDismiss}
          className="fixed inset-0 flex items-center justify-center cursor-pointer z-50"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="gradient-win rounded-3xl px-12 py-8 shadow-win"
          >
            <motion.p
              className="text-6xl md:text-8xl font-bold text-accent-foreground text-center"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 40px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)",
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ${currentWin}
            </motion.p>
            <p className="text-2xl md:text-3xl text-center text-accent-foreground font-bold mt-2">
              BIG WIN! 🎉
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
