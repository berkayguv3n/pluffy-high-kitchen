import { motion, AnimatePresence } from "framer-motion";
import { WinAnimations } from "./WinAnimations";
import bigWinText from "@/assets/bigwin/bigwin-text.png";

interface WinDisplayProps {
  currentWin: number;
  onDismiss: () => void;
}

export const WinDisplay = ({ currentWin, onDismiss }: WinDisplayProps) => {
  const isBigWin = currentWin >= 100;
  const isMegaWin = currentWin >= 500;

  return (
    <AnimatePresence>
      {currentWin > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="fixed inset-0 flex items-center justify-center cursor-pointer z-50 bg-black/40"
        >
          {/* Win Animations */}
          <WinAnimations showWinningFx={true} showBigWin={isBigWin} />

          {/* Win Amount Display */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.2, 1],
              opacity: 1
            }}
            transition={{ 
              duration: 0.6,
              times: [0, 0.6, 1],
              ease: "easeOut"
            }}
            className="relative z-60 flex flex-col items-center gap-6"
          >
            {/* Big/Mega Win Text */}
            {isBigWin && (
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <img 
                  src={bigWinText} 
                  alt={isMegaWin ? "MEGA WIN" : "BIG WIN"}
                  className="w-96 h-auto drop-shadow-2xl"
                  style={{
                    filter: "drop-shadow(0 0 40px rgba(100,255,100,0.8))"
                  }}
                />
              </motion.div>
            )}

            {/* Amount */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 rounded-3xl px-16 py-8 shadow-2xl border-4 border-yellow-200"
              style={{
                boxShadow: "0 0 60px rgba(255,215,0,0.6), inset 0 4px 20px rgba(255,255,255,0.5)"
              }}
            >
              <motion.p
                className="text-7xl md:text-9xl font-black text-purple-900 text-center"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255,255,255,0.8)",
                    "0 0 40px rgba(255,255,255,1)",
                    "0 0 20px rgba(255,255,255,0.8)",
                  ],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ${currentWin}
              </motion.p>
            </motion.div>

            {!isBigWin && (
              <p className="text-3xl md:text-4xl text-white font-bold drop-shadow-lg">
                WIN! 🎉
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

