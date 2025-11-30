import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface WinLine {
  id: string;
  symbolId: string;
  symbolLabel: string;
  count: number;
  payout: number;
}

export type WinBreakdown = WinLine[];

interface WinBreakdownPanelProps {
  breakdown: WinBreakdown;
  currencySymbol?: string;
}

export const WinBreakdownPanel: React.FC<WinBreakdownPanelProps> = ({
  breakdown,
  currencySymbol = "₺",
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile styles
  const mobileStyles: React.CSSProperties = {
    position: "absolute",
    top: "55px",
    right: "8px",
    zIndex: 9999,
    width: "180px",
    padding: "10px 12px",
    borderRadius: "12px",
    background: "linear-gradient(180deg, rgba(37, 16, 61, 0.95), rgba(18, 7, 34, 0.98))",
    backdropFilter: "blur(8px)",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(124, 255, 163, 0.2)",
    border: "1px solid rgba(124, 255, 163, 0.3)",
    color: "#ffffff",
    fontSize: "11px",
  };

  // Desktop styles
  const desktopStyles: React.CSSProperties = {
    position: "absolute",
    right: "40px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 9999,
    width: "260px",
    padding: "16px 18px",
    borderRadius: "16px",
    background: "linear-gradient(180deg, rgba(37, 16, 61, 0.95), rgba(18, 7, 34, 0.98))",
    backdropFilter: "blur(8px)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 255, 163, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
    border: "1px solid rgba(124, 255, 163, 0.3)",
    color: "#ffffff",
  };

  return (
    <AnimatePresence>
      {breakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="breakdown-panel"
          style={isMobile ? mobileStyles : desktopStyles}
        >
          {/* Header */}
          <div
            style={{
              fontSize: isMobile ? "10px" : "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#ffe898",
              marginBottom: isMobile ? "8px" : "12px",
              textAlign: "center",
              textShadow: "0 0 10px rgba(255, 232, 152, 0.5)",
            }}
          >
            🎰 WIN BREAKDOWN
          </div>

          {/* List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? "4px" : "8px",
              maxHeight: isMobile ? "150px" : "280px",
              overflowY: "auto",
            }}
          >
            {breakdown.map((line, index) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: isMobile ? "11px" : "14px",
                  padding: isMobile ? "5px 8px" : "8px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span style={{ color: "#f7f2ff", fontWeight: 500 }}>
                  {line.count}x {isMobile ? line.symbolLabel.split(' ')[0] : line.symbolLabel}
                </span>
                <span style={{ 
                  fontWeight: 700, 
                  color: "#7dff70",
                  textShadow: "0 0 8px rgba(125, 255, 112, 0.5)",
                }}>
                  {currencySymbol}{line.payout.toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Total */}
          {breakdown.length > 1 && (
            <div
              style={{
                marginTop: isMobile ? "8px" : "12px",
                paddingTop: isMobile ? "8px" : "12px",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: isMobile ? "12px" : "15px",
                fontWeight: 700,
              }}
            >
              <span style={{ color: "#ffe898" }}>TOTAL</span>
              <span style={{ 
                color: "#7dff70", 
                fontSize: isMobile ? "14px" : "18px",
                textShadow: "0 0 12px rgba(125, 255, 112, 0.6)",
              }}>
                {currencySymbol}{breakdown.reduce((sum, line) => sum + line.payout, 0).toFixed(2)}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
