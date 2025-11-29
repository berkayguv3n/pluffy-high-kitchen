import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Import winning FX frames
const winningFxFrames = Array.from({ length: 18 }, (_, i) => 
  `/src/assets/fx/fx-${String(i + 17).padStart(5, '0')}.png`
);

// Import big win smoke frames
const bigWinFrames = Array.from({ length: 29 }, (_, i) => 
  i === 0 ? `/src/assets/bigwin/bigwin-text.png` : `/src/assets/bigwin/bigwin-${String(i + 1).padStart(2, '0')}.png`
);

interface WinAnimationsProps {
  showWinningFx?: boolean;
  showBigWin?: boolean;
}

export const WinAnimations = ({ showWinningFx, showBigWin }: WinAnimationsProps) => {
  const [winFxFrame, setWinFxFrame] = useState(0);
  const [bigWinFrame, setBigWinFrame] = useState(0);

  useEffect(() => {
    if (!showWinningFx) return;
    
    const interval = setInterval(() => {
      setWinFxFrame((prev) => (prev + 1) % winningFxFrames.length);
    }, 60); // ~16fps

    return () => clearInterval(interval);
  }, [showWinningFx]);

  useEffect(() => {
    if (!showBigWin) return;
    
    const interval = setInterval(() => {
      setBigWinFrame((prev) => (prev + 1) % bigWinFrames.length);
    }, 50); // ~20fps

    return () => clearInterval(interval);
  }, [showBigWin]);

  return (
    <>
      {/* Winning FX Animation */}
      {showWinningFx && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center"
        >
          <img
            src={winningFxFrames[winFxFrame]}
            alt=""
            className="w-full h-full object-cover"
            style={{ mixBlendMode: "screen" }}
          />
        </motion.div>
      )}

      {/* Big Win Smoke Animation */}
      {showBigWin && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          <img
            src={bigWinFrames[bigWinFrame]}
            alt=""
            className="w-full h-full object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </motion.div>
      )}
    </>
  );
};
