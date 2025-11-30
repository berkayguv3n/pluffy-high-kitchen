/**
 * WIN OVERLAY COMPONENT
 * Kazanan sembolleri highlight eden overlay
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WinningCluster, CellPosition } from "@/game/engine/evaluateWin";

// ============================================
// TYPES
// ============================================

interface WinOverlayProps {
  winningClusters: WinningCluster[];
  cellSize: number;
  offsetX: number;
  offsetY: number;
  isVisible: boolean;
  totalWin: number;
  animationPhase: "highlight" | "pop" | "idle";
  multipliers?: { row: number; col: number; value: number }[];
  currencySymbol?: string;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const highlightVariants = {
  initial: { 
    scale: 1, 
    opacity: 0,
    boxShadow: "0 0 0px rgba(74, 222, 128, 0)" 
  },
  highlight: { 
    scale: [1, 1.1, 1.05],
    opacity: 1,
    boxShadow: [
      "0 0 0px rgba(74, 222, 128, 0)",
      "0 0 25px rgba(74, 222, 128, 0.8)",
      "0 0 18px rgba(74, 222, 128, 0.6)",
    ],
    transition: {
      duration: 0.5,
      ease: "easeOut",
    }
  },
  pop: {
    scale: [1.05, 1.25, 0],
    opacity: [1, 1, 0],
    transition: {
      duration: 0.35,
      ease: "easeIn",
    }
  },
};

const particleVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: (i: number) => ({
    scale: [0, 1.2, 0],
    opacity: [0, 0.8, 0],
    x: [0, Math.cos(i * 45 * Math.PI / 180) * 35],
    y: [0, Math.sin(i * 45 * Math.PI / 180) * 35],
    transition: {
      duration: 0.45,
      delay: 0.1,
      ease: "easeOut",
    }
  }),
};

// ============================================
// SUB-COMPONENTS
// ============================================

const CellHighlight = ({
  row,
  col,
  cellSize,
  phase,
  delay,
  color,
}: {
  row: number;
  col: number;
  cellSize: number;
  phase: "highlight" | "pop" | "idle";
  delay: number;
  color: string;
}) => {
  const left = col * cellSize;
  const top = row * cellSize;
  
  return (
    <motion.div
      style={{
        position: "absolute",
        left,
        top,
        width: cellSize,
        height: cellSize,
        borderRadius: "12%",
        border: `3px solid ${color}`,
        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        pointerEvents: "none",
        zIndex: 10,
      }}
      variants={highlightVariants}
      initial="initial"
      animate={phase}
      transition={{ delay }}
    >
      {/* Pop particles */}
      {phase === "pop" && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={particleVariants}
              initial="initial"
              animate="animate"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: color,
                marginLeft: -3,
                marginTop: -3,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

const MultiplierExplosion = ({
  row,
  col,
  value,
  cellSize,
  isVisible,
}: {
  row: number;
  col: number;
  value: number;
  cellSize: number;
  isVisible: boolean;
}) => {
  const x = col * cellSize + cellSize / 2;
  const y = row * cellSize + cellSize / 2;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: 0 }}
          animate={{
            scale: [0, 1.4, 1.2],
            opacity: [0, 1, 1],
            rotate: [0, 12, -8, 0],
          }}
          exit={{
            scale: [1.2, 1.4, 0],
            opacity: [1, 0.7, 0],
          }}
          transition={{ duration: 0.5, ease: "backOut" }}
          style={{
            position: "absolute",
            left: x,
            top: y,
            transform: "translate(-50%, -50%)",
            width: cellSize * 1.4,
            height: cellSize * 1.4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {/* Glow */}
          <motion.div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.7, 0.4, 0.7],
            }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Value text */}
          <span
            style={{
              fontSize: cellSize * 0.45,
              fontWeight: 900,
              color: "#fff",
              textShadow: `
                0 0 8px #ffd700,
                0 0 16px #ffd700,
                0 0 24px #ff8c00,
                2px 2px 0 #8b4513
              `,
              zIndex: 1,
            }}
          >
            x{value}
          </span>
          
          {/* Ring */}
          <motion.div
            style={{
              position: "absolute",
              width: "115%",
              height: "115%",
              border: "2px solid rgba(255,215,0,0.6)",
              borderRadius: "50%",
            }}
            animate={{
              scale: [1, 1.4],
              opacity: [0.7, 0],
            }}
            transition={{
              duration: 0.55,
              ease: "easeOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const WinBanner = ({
  amount,
  isVisible,
  currencySymbol,
}: {
  amount: number;
  isVisible: boolean;
  currencySymbol: string;
}) => {
  return (
    <AnimatePresence>
      {isVisible && amount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: -15 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="absolute top-[-55px] left-1/2 -translate-x-1/2 z-30"
        >
          <div
            className="px-6 py-3 rounded-2xl font-black text-white"
            style={{
              background: "linear-gradient(180deg, rgba(255,215,0,0.95) 0%, rgba(255,140,0,0.95) 100%)",
              boxShadow: "0 4px 20px rgba(255,215,0,0.5), 0 0 35px rgba(255,215,0,0.3)",
            }}
          >
            <motion.span
              className="text-2xl"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.4)" }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.4 }}
            >
              +{currencySymbol}{amount.toFixed(2)}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const WinOverlay: React.FC<WinOverlayProps> = ({
  winningClusters,
  cellSize,
  offsetX,
  offsetY,
  isVisible,
  totalWin,
  animationPhase,
  multipliers = [],
  currencySymbol = "₺",
}) => {
  if (!isVisible || winningClusters.length === 0) return null;

  // Cluster colors
  const colors = [
    "#4ade80", // Green
    "#fbbf24", // Yellow
    "#f87171", // Red
    "#a78bfa", // Purple
    "#38bdf8", // Blue
    "#fb923c", // Orange
  ];

  // Flatten all positions with colors
  const allPositions: { row: number; col: number; color: string; delay: number }[] = [];
  const positionSet = new Set<string>();
  
  winningClusters.forEach((cluster, clusterIndex) => {
    const color = colors[clusterIndex % colors.length];
    cluster.positions.forEach((pos, posIndex) => {
      const key = `${pos.row}-${pos.col}`;
      if (!positionSet.has(key)) {
        positionSet.add(key);
        allPositions.push({
          row: pos.row,
          col: pos.col,
          color,
          delay: posIndex * 0.025,
        });
      }
    });
  });

  const showMultipliers = animationPhase === "pop" && multipliers.length > 0;

  return (
    <div
      className="pointer-events-none absolute z-40"
      style={{
        left: offsetX,
        top: offsetY,
        width: cellSize * 6,
        height: cellSize * 5,
      }}
    >
      {/* Win banner */}
      <WinBanner
        amount={totalWin}
        isVisible={animationPhase === "highlight" || animationPhase === "pop"}
        currencySymbol={currencySymbol}
      />

      {/* Cell highlights */}
      <AnimatePresence>
        {allPositions.map((pos, index) => (
          <CellHighlight
            key={`${pos.row}-${pos.col}-${index}`}
            row={pos.row}
            col={pos.col}
            cellSize={cellSize}
            phase={animationPhase}
            delay={pos.delay}
            color={pos.color}
          />
        ))}
      </AnimatePresence>

      {/* Multiplier explosions */}
      {multipliers.map((mult, index) => (
        <MultiplierExplosion
          key={`mult-${mult.row}-${mult.col}-${index}`}
          row={mult.row}
          col={mult.col}
          value={mult.value}
          cellSize={cellSize}
          isVisible={showMultipliers}
        />
      ))}

      {/* Big win flash */}
      <AnimatePresence>
        {animationPhase === "pop" && totalWin > 50 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.25, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-[-40px]"
            style={{
              background: "radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WinOverlay;
