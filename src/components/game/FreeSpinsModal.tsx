import { motion, AnimatePresence } from "framer-motion";
import symbolOven from "@/assets/symbol-oven.png";

interface FreeSpinsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freeSpins: number;
  onStart: () => void;
}

export const FreeSpinsModal = ({
  open,
  onOpenChange,
  freeSpins,
  onStart,
}: FreeSpinsModalProps) => {
  const handleStart = () => {
    onStart();
  };

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
        >
          {/* Animated smoke particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 30 + Math.random() * 60,
                height: 30 + Math.random() * 60,
                background: `radial-gradient(circle, rgba(74,222,128,${0.3 + Math.random() * 0.4}) 0%, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50 - Math.random() * 100, 0],
                x: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60],
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative text-center z-10"
          >
            {/* Main title - OVERBAKED */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-2"
            >
              <h1 
                className="text-6xl md:text-7xl font-black"
                style={{
                  background: "linear-gradient(180deg, #a855f7 0%, #7c3aed 50%, #6d28d9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 4px 0 #4c1d95)",
                  letterSpacing: "0.05em",
                }}
              >
                OVERBAKED
              </h1>
            </motion.div>
            
            {/* SPINS UNLOCKED */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, type: "spring" }}
              className="mb-8"
            >
              <h2 
                className="text-5xl md:text-6xl font-black"
                style={{
                  background: "linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 3px 0 #15803d)",
                  letterSpacing: "0.05em",
                }}
              >
                SPINS UNLOCKED!
              </h2>
            </motion.div>

            {/* Oven Symbol with BONUS */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", damping: 12 }}
              className="relative mx-auto mb-6"
            >
              <motion.div className="relative">
                <motion.img
                  src={symbolOven}
                  alt="Oven"
                  className="w-40 h-40 mx-auto"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    filter: "drop-shadow(0 0 40px rgba(74,222,128,0.8))",
                  }}
                />
                
                {/* BONUS badge on oven */}
                <motion.div
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-lg"
                  style={{
                    background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                    boxShadow: "0 4px 15px rgba(251,191,36,0.6), inset 0 2px 4px rgba(255,255,255,0.4)",
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 4px 15px rgba(251,191,36,0.6)",
                      "0 4px 30px rgba(251,191,36,1)",
                      "0 4px 15px rgba(251,191,36,0.6)",
                    ],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span 
                    className="font-black text-lg text-white tracking-wider"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
                  >
                    BONUS
                  </span>
                </motion.div>
              </motion.div>
              
              {/* Glow behind oven */}
              <motion.div
                className="absolute inset-0 -z-10"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  background: "radial-gradient(circle, rgba(74,222,128,0.6) 0%, transparent 60%)",
                  filter: "blur(30px)",
                }}
              />
            </motion.div>

            {/* Free Spins Counter */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", damping: 15 }}
              className="relative mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-9xl font-black text-white"
                style={{ 
                  textShadow: "0 0 60px rgba(74,222,128,0.9), 0 6px 0 #16a34a, 0 8px 20px rgba(0,0,0,0.5)" 
                }}
              >
                {freeSpins}
              </motion.div>
              <p 
                className="text-3xl font-bold"
                style={{
                  background: "linear-gradient(180deg, #4ade80 0%, #22c55e 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                FREE SPINS
              </p>
            </motion.div>

            {/* Weed bomb multipliers preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center gap-3 mb-8"
            >
              {[2, 5, 10, 25, 50].map((mult, i) => (
                <motion.div
                  key={mult}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #4ade80 0%, #16a34a 60%, #166534 100%)",
                    boxShadow: "0 2px 10px rgba(74,222,128,0.5)",
                  }}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <span className="text-xs font-bold text-white">x{mult}</span>
                </motion.div>
              ))}
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600"
                style={{ boxShadow: "0 2px 10px rgba(251,191,36,0.5)" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4 }}
              >
                <span className="text-xs font-bold text-white">x100</span>
              </motion.div>
            </motion.div>

            {/* Start Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-20 py-6 text-3xl font-black text-white rounded-full uppercase tracking-wider"
              style={{
                background: "linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)",
                boxShadow: "0 8px 40px rgba(74,222,128,0.5), inset 0 2px 10px rgba(255,255,255,0.3), 0 6px 0 #15803d",
              }}
            >
              START BAKING! 🔥
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
