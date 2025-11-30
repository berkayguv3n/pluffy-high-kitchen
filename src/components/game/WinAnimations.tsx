import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Import winning FX frames dynamically
const fxModules = import.meta.glob('@/assets/fx/fx-*.png', { eager: true, as: 'url' });
const winningFxFrames = Object.values(fxModules).sort();

// Import big win frames dynamically
const bigWinModules = import.meta.glob('@/assets/bigwin/bigwin-*.png', { eager: true, as: 'url' });
const bigWinTextModule = import.meta.glob('@/assets/bigwin/bigwin-text.png', { eager: true, as: 'url' });
const bigWinFrames = [
  ...Object.values(bigWinTextModule),
  ...Object.values(bigWinModules).sort()
];

interface WinAnimationsProps {
  showWinningFx?: boolean;
  showBigWin?: boolean;
}

export const WinAnimations = ({ showWinningFx, showBigWin }: WinAnimationsProps) => {
  const [winFxFrame, setWinFxFrame] = useState(0);
  const [bigWinFrame, setBigWinFrame] = useState(0);

  // Reset frame when animation starts
  useEffect(() => {
    if (showWinningFx) {
      setWinFxFrame(0);
    }
  }, [showWinningFx]);

  useEffect(() => {
    if (showBigWin) {
      setBigWinFrame(0);
    }
  }, [showBigWin]);

  useEffect(() => {
    if (!showWinningFx || winningFxFrames.length === 0) return;
    
    const interval = setInterval(() => {
      setWinFxFrame((prev) => (prev + 1) % winningFxFrames.length);
    }, 60); // ~16fps

    return () => clearInterval(interval);
  }, [showWinningFx]);

  useEffect(() => {
    if (!showBigWin || bigWinFrames.length === 0) return;
    
    const interval = setInterval(() => {
      setBigWinFrame((prev) => (prev + 1) % bigWinFrames.length);
    }, 50); // ~20fps

    return () => clearInterval(interval);
  }, [showBigWin]);

  // Don't render if no frames available
  if (winningFxFrames.length === 0 && bigWinFrames.length === 0) {
    return null;
  }

  return (
    <>
      {/* Winning FX Animation - Green/Purple smoke effect */}
      {showWinningFx && winningFxFrames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center"
        >
          <img
            src={winningFxFrames[winFxFrame]}
            alt=""
            className="w-full h-full object-cover"
            style={{ mixBlendMode: "screen", opacity: 0.9 }}
          />
        </motion.div>
      )}

      {/* Big Win Smoke Animation */}
      {showBigWin && bigWinFrames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
          style={{ 
            background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)"
          }}
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
