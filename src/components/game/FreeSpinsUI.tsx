import { motion } from "framer-motion";

interface FreeSpinsUIProps {
  spinsRemaining: number;
  spinsTotal: number;
  totalWin: number;
  multipliers: number[];
}

export const FreeSpinsUI = ({ spinsRemaining, spinsTotal, totalWin, multipliers }: FreeSpinsUIProps) => {
  const multiplierSum = multipliers.length > 0 ? multipliers.reduce((a, b) => a + b, 0) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 mb-4"
    >
      {/* Spins Counter */}
      <motion.div
        className="flex flex-col items-center px-5 py-2 rounded-xl"
        style={{
          background: "linear-gradient(180deg, rgba(74,222,128,0.3) 0%, rgba(22,163,74,0.4) 100%)",
          border: "2px solid rgba(74,222,128,0.5)",
          boxShadow: "0 4px 20px rgba(74,222,128,0.3)",
        }}
      >
        <span className="text-green-300 text-xs font-bold uppercase tracking-wider">Free Spins</span>
        <div className="flex items-baseline gap-1">
          <motion.span 
            key={spinsRemaining}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black text-white"
            style={{ textShadow: "0 0 15px rgba(74,222,128,0.8)" }}
          >
            {spinsRemaining}
          </motion.span>
          <span className="text-sm text-green-300">/ {spinsTotal}</span>
        </div>
      </motion.div>

      {/* Total Win */}
      <motion.div
        className="flex flex-col items-center px-5 py-2 rounded-xl"
        style={{
          background: "linear-gradient(180deg, rgba(251,191,36,0.3) 0%, rgba(217,119,6,0.4) 100%)",
          border: "2px solid rgba(251,191,36,0.5)",
          boxShadow: "0 4px 20px rgba(251,191,36,0.3)",
        }}
      >
        <span className="text-yellow-300 text-xs font-bold uppercase tracking-wider">Total Win</span>
        <motion.span 
          key={totalWin}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-2xl font-black text-white"
          style={{ textShadow: "0 0 15px rgba(251,191,36,0.8)" }}
        >
          ₺{totalWin.toLocaleString()}
        </motion.span>
      </motion.div>

      {/* Active Multiplier Sum */}
      {multiplierSum > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center px-5 py-2 rounded-xl"
          style={{
            background: "linear-gradient(180deg, rgba(168,85,247,0.3) 0%, rgba(126,34,206,0.4) 100%)",
            border: "2px solid rgba(168,85,247,0.5)",
            boxShadow: "0 4px 20px rgba(168,85,247,0.3)",
          }}
        >
          <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">Multiplier</span>
          <motion.span 
            key={multiplierSum}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black text-white"
            style={{ textShadow: "0 0 15px rgba(168,85,247,0.8)" }}
          >
            x{multiplierSum}
          </motion.span>
        </motion.div>
      )}

      {/* Individual multipliers collected (max 6 shown) */}
      {multipliers.length > 0 && (
        <div className="flex gap-1 ml-2">
          {multipliers.slice(-6).map((mult, i) => (
            <motion.div
              key={`${i}-${mult}`}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: mult >= 25 
                  ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
                  : "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
                boxShadow: mult >= 25 
                  ? "0 2px 8px rgba(251,191,36,0.5)"
                  : "0 2px 8px rgba(74,222,128,0.4)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <span className="text-xs font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                x{mult}
              </span>
            </motion.div>
          ))}
          {multipliers.length > 6 && (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-green-300"
              style={{ background: "rgba(0,0,0,0.3)" }}
            >
              +{multipliers.length - 6}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
