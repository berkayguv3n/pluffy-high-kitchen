import { motion, AnimatePresence } from "framer-motion";
import symbolOven from "@/assets/symbol-oven.png";

interface BuyBonusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cost: number;
  onConfirm: () => void;
}

export const BuyBonusModal = ({ open, onOpenChange, cost, onConfirm }: BuyBonusModalProps) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
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
            background: "radial-gradient(ellipse at center, rgba(22,163,74,0.2) 0%, rgba(0,0,0,0.95) 100%)",
          }}
          onClick={handleCancel}
        >
          {/* Floating smoke particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 20 + Math.random() * 40,
                height: 20 + Math.random() * 40,
                background: `radial-gradient(circle, rgba(74,222,128,${0.3 + Math.random() * 0.4}) 0%, transparent 70%)`,
                left: `${10 + Math.random() * 80}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -30 - Math.random() * 50, 0],
                x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 30],
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative rounded-3xl p-10 max-w-lg mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, rgba(88,28,135,0.98) 0%, rgba(59,7,100,0.99) 100%)",
              boxShadow: "0 0 100px rgba(74,222,128,0.3), 0 0 50px rgba(147,51,234,0.4), inset 0 2px 30px rgba(255,255,255,0.1)",
              border: "3px solid rgba(74,222,128,0.5)",
            }}
          >
            {/* Title */}
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-black mb-2"
              style={{
                background: "linear-gradient(180deg, #4ade80 0%, #22c55e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 3px 0 #16a34a)",
              }}
            >
              BUY OVERBAKED SPINS?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-purple-200 text-lg mb-8"
            >
              Instant 10 Free Spins with Weed Bomb Multipliers!
            </motion.p>

            {/* Oven Symbol with BONUS */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", damping: 12 }}
              className="relative mx-auto mb-8"
            >
              <motion.img
                src={symbolOven}
                alt="Oven"
                className="w-32 h-32 mx-auto"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ filter: "drop-shadow(0 0 30px rgba(74,222,128,0.8))" }}
              />
              
              {/* BONUS badge */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-lg"
                style={{
                  background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                  boxShadow: "0 4px 15px rgba(251,191,36,0.6), inset 0 2px 4px rgba(255,255,255,0.4)",
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="font-black text-lg text-white" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                  BONUS
                </span>
              </motion.div>
              
              {/* Glow */}
              <motion.div
                className="absolute inset-0 -z-10"
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  background: "radial-gradient(circle, rgba(74,222,128,0.5) 0%, transparent 60%)",
                  filter: "blur(20px)",
                }}
              />
            </motion.div>

            {/* Multiplier preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-2 mb-6"
            >
              {[2, 5, 10, 25, 50, 100].map((mult, i) => (
                <motion.div
                  key={mult}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: mult === 100 
                      ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
                      : "radial-gradient(circle at 30% 30%, #4ade80 0%, #16a34a 60%, #166534 100%)",
                    boxShadow: mult === 100 
                      ? "0 2px 10px rgba(251,191,36,0.5)"
                      : "0 2px 10px rgba(74,222,128,0.4)",
                  }}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  <span className="text-xs font-bold text-white">x{mult}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Cost Display */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-6 mb-8"
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
                border: "2px solid rgba(74,222,128,0.3)",
              }}
            >
              <div className="text-green-400 text-sm mb-2 font-bold uppercase tracking-wider">Cost</div>
              <motion.div 
                className="text-6xl font-black"
                style={{ 
                  color: "#fbbf24",
                  textShadow: "0 0 30px rgba(251,191,36,0.7), 0 4px 0 #d97706" 
                }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ₺{cost.toLocaleString()}
              </motion.div>
              <div className="text-purple-300 text-sm mt-2 opacity-80">
                100x your current bet
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-8 justify-center"
            >
              {/* Cancel Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCancel}
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
                  boxShadow: "0 6px 30px rgba(239,68,68,0.5), inset 0 2px 10px rgba(255,255,255,0.2), 0 6px 0 #991b1b",
                }}
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Confirm Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleConfirm}
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)",
                  boxShadow: "0 6px 30px rgba(74,222,128,0.5), inset 0 2px 10px rgba(255,255,255,0.2), 0 6px 0 #15803d",
                }}
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
