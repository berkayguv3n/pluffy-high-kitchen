import { motion } from "framer-motion";

interface BetPanelProps {
  bet: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}

export const BetPanel = ({ bet, onIncrease, onDecrease, disabled = false }: BetPanelProps) => {
  return (
    <div className="relative">
      {/* Main panel container - styled like the asset */}
      <div 
        className="relative flex items-center gap-2 px-3 py-2 rounded-full"
        style={{
          background: "linear-gradient(180deg, #4c1d95 0%, #3b0764 50%, #2e1065 100%)",
          boxShadow: `
            0 0 0 3px rgba(168,85,247,0.4),
            0 0 20px rgba(168,85,247,0.3),
            inset 0 2px 10px rgba(255,255,255,0.1),
            inset 0 -2px 10px rgba(0,0,0,0.3)
          `,
          border: "2px solid rgba(74,222,128,0.4)",
        }}
      >
        {/* BET label */}
        <div 
          className="absolute -top-3 left-4 px-2 py-0.5 rounded text-xs font-bold text-white"
          style={{
            background: "linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          BET
        </div>

        {/* Decrease button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDecrease}
          disabled={disabled}
          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
          style={{
            background: "linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)",
            boxShadow: `
              0 4px 15px rgba(74,222,128,0.4),
              inset 0 2px 5px rgba(255,255,255,0.3),
              0 2px 0 #15803d
            `,
            border: "2px solid rgba(168,85,247,0.5)",
          }}
        >
          <span className="text-white text-2xl font-bold leading-none" style={{ marginTop: "-2px" }}>−</span>
        </motion.button>

        {/* Bet amount display */}
        <div 
          className="px-4 py-2 rounded-lg min-w-[100px] text-center"
          style={{
            background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.1)",
            border: "1px solid rgba(74,222,128,0.3)",
          }}
        >
          <span 
            className="text-xl font-black text-white"
            style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
          >
            ₺{bet.toLocaleString()}
          </span>
        </div>

        {/* Increase button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onIncrease}
          disabled={disabled}
          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
          style={{
            background: "linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)",
            boxShadow: `
              0 4px 15px rgba(74,222,128,0.4),
              inset 0 2px 5px rgba(255,255,255,0.3),
              0 2px 0 #15803d
            `,
            border: "2px solid rgba(168,85,247,0.5)",
          }}
        >
          <span className="text-white text-2xl font-bold leading-none">+</span>
        </motion.button>
      </div>

      {/* Green glow accent line */}
      <div 
        className="absolute inset-x-4 bottom-0 h-0.5 rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.6), transparent)",
          boxShadow: "0 0 10px rgba(74,222,128,0.5)",
        }}
      />
    </div>
  );
};

