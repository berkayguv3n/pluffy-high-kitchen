import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Import symbol images
import symbolChef from "@/assets/symbol-chef.png";
import symbolBrownie from "@/assets/symbol-brownie.png";
import symbolPizza from "@/assets/symbol-pizza.png";
import symbolSmoothie from "@/assets/symbol-smoothie.png";
import symbolCookie from "@/assets/symbol-cookie.png";
import symbolMuffin from "@/assets/symbol-muffin.png";
import symbolSpatula from "@/assets/symbol-spatula.png";
import symbolRolling from "@/assets/symbol-rolling.png";
import symbolOven from "@/assets/symbol-oven.png";

// Import info panel assets (these should be added to assets folder)
// For now, we'll create styled versions that match the uploaded images

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "game" | "paytable" | "rules" | "explanation";

// Styled title component to match the uploaded image style
const StyledTitle = ({ text, color = "green" }: { text: string; color?: "green" | "purple" }) => (
  <div 
    className="relative inline-block px-6 py-2"
    style={{
      background: color === "green" 
        ? "linear-gradient(180deg, #a8e6a3 0%, #7bc96f 30%, #5eb454 70%, #4a9a42 100%)"
        : "linear-gradient(180deg, #d4a8e6 0%, #b67bc9 30%, #9a5eb4 70%, #824a9a 100%)",
      borderRadius: "12px",
      border: "3px solid #fff",
      boxShadow: "0 4px 0 rgba(0,0,0,0.3), 0 6px 20px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.3)",
    }}
  >
    <span 
      className="font-black text-2xl md:text-3xl tracking-wide"
      style={{
        color: "#fff",
        textShadow: "2px 2px 0 rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.3)",
        letterSpacing: "0.05em",
      }}
    >
      {text}
    </span>
  </div>
);

// Tab button component
const TabButton = ({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
}) => (
  <motion.button
    onClick={onClick}
    className={`relative transition-all ${active ? "scale-105" : "scale-100 opacity-80 hover:opacity-100"}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-white rounded-full"
        style={{ boxShadow: "0 0 10px rgba(255,255,255,0.8)" }}
      />
    )}
  </motion.button>
);

export const InfoModal = ({ open, onOpenChange }: InfoModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("game");

  const tabs: { id: TabType; label: string }[] = [
    { id: "game", label: "GAME" },
    { id: "paytable", label: "PAYTABLE" },
    { id: "rules", label: "RULES" },
    { id: "explanation", label: "INFO" },
  ];

  // Symbol data with actual images
  const symbols = [
    { image: symbolChef, name: "Pluffy Chef", tier: "Premium", color: "#ffd700", payouts: { 8: "10x", 10: "25x", 12: "50x" } },
    { image: symbolBrownie, name: "Brownie", tier: "High", color: "#ff8c00", payouts: { 8: "5x", 10: "10x", 12: "25x" } },
    { image: symbolPizza, name: "Pizza", tier: "High", color: "#ff6347", payouts: { 8: "3x", 10: "7x", 12: "15x" } },
    { image: symbolSmoothie, name: "Smoothie", tier: "Mid", color: "#ff69b4", payouts: { 8: "2x", 10: "5x", 12: "10x" } },
    { image: symbolCookie, name: "Cookie", tier: "Mid", color: "#deb887", payouts: { 8: "1.5x", 10: "4x", 12: "8x" } },
    { image: symbolMuffin, name: "Muffin", tier: "Low", color: "#98fb98", payouts: { 8: "1x", 10: "2x", 12: "5x" } },
    { image: symbolSpatula, name: "Spatula", tier: "Low", color: "#87ceeb", payouts: { 8: "0.5x", 10: "1.5x", 12: "3x" } },
    { image: symbolRolling, name: "Rolling Pin", tier: "Low", color: "#dda0dd", payouts: { 8: "0.25x", 10: "1x", 12: "2x" } },
    { image: symbolOven, name: "Bonus Oven", tier: "Special", color: "#7dff70", payouts: { 4: "10 FS", 5: "15 FS", 6: "20 FS" } },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl w-[95vw] max-h-[90vh] p-0 bg-transparent border-0 overflow-visible"
        style={{ background: "none" }}
      >
        <DialogTitle className="sr-only">Game Information</DialogTitle>
        
        {/* Main Frame Container - Styled like the uploaded frame image */}
        <div 
          className="relative w-full"
          style={{
            background: "linear-gradient(180deg, #5a4a3a 0%, #4a3a2a 100%)",
            borderRadius: "16px",
            padding: "8px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* Inner gray content area */}
          <div 
            className="relative w-full overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)",
              borderRadius: "12px",
              minHeight: "500px",
            }}
          >
            {/* Decorative slime corners */}
            <div className="absolute -top-4 -left-4 w-24 h-24 pointer-events-none z-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path 
                  d="M10,50 Q0,30 20,20 Q40,10 50,30 Q60,10 70,25 Q85,5 90,35 Q95,50 80,55 L30,80 Q10,70 10,50" 
                  fill="url(#slimeGradient)"
                  stroke="#4a9a42"
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient id="slimeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a8e6a3" />
                    <stop offset="50%" stopColor="#7bc96f" />
                    <stop offset="100%" stopColor="#5eb454" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="absolute -top-4 -right-4 w-24 h-24 pointer-events-none z-20" style={{ transform: "scaleX(-1)" }}>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path 
                  d="M10,50 Q0,30 20,20 Q40,10 50,30 Q60,10 70,25 Q85,5 90,35 Q95,50 80,55 L30,80 Q10,70 10,50" 
                  fill="url(#slimeGradient2)"
                  stroke="#4a9a42"
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient id="slimeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a8e6a3" />
                    <stop offset="50%" stopColor="#7bc96f" />
                    <stop offset="100%" stopColor="#5eb454" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="absolute -bottom-4 -left-4 w-24 h-24 pointer-events-none z-20" style={{ transform: "scaleY(-1)" }}>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path 
                  d="M10,50 Q0,30 20,20 Q40,10 50,30 Q60,10 70,25 Q85,5 90,35 Q95,50 80,55 L30,80 Q10,70 10,50" 
                  fill="url(#slimeGradient3)"
                  stroke="#4a9a42"
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient id="slimeGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a8e6a3" />
                    <stop offset="50%" stopColor="#7bc96f" />
                    <stop offset="100%" stopColor="#5eb454" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="absolute -bottom-4 -right-4 w-24 h-24 pointer-events-none z-20" style={{ transform: "scale(-1)" }}>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path 
                  d="M10,50 Q0,30 20,20 Q40,10 50,30 Q60,10 70,25 Q85,5 90,35 Q95,50 80,55 L30,80 Q10,70 10,50" 
                  fill="url(#slimeGradient4)"
                  stroke="#4a9a42"
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient id="slimeGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a8e6a3" />
                    <stop offset="50%" stopColor="#7bc96f" />
                    <stop offset="100%" stopColor="#5eb454" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full transition-all flex items-center justify-center hover:scale-110"
              style={{
                background: "linear-gradient(180deg, #ff6b6b 0%, #ee5a5a 50%, #cc4444 100%)",
                border: "2px solid #fff",
                boxShadow: "0 3px 0 rgba(0,0,0,0.3), 0 4px 15px rgba(0,0,0,0.3)",
              }}
            >
              <X className="w-5 h-5 text-white" strokeWidth={3} />
            </button>

            {/* Tab Navigation */}
            <div className="flex justify-center gap-3 pt-6 pb-4 px-4 flex-wrap">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <StyledTitle text={tab.label} color={activeTab === tab.id ? "green" : "purple"} />
                </TabButton>
              ))}
            </div>

            {/* Content Area */}
            <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-150px)]">
              <AnimatePresence mode="wait">
                {/* GAME Tab */}
                {activeTab === "game" && (
                  <motion.div
                    key="game"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Game Info Card */}
                      <div 
                        className="rounded-xl p-5"
                        style={{
                          background: "linear-gradient(180deg, rgba(122,255,112,0.15) 0%, rgba(90,180,84,0.1) 100%)",
                          border: "2px solid rgba(122,255,112,0.3)",
                        }}
                      >
                        <h3 className="text-xl font-black text-green-400 mb-4">GAME INFO</h3>
                        <div className="space-y-2 text-white">
                          {[
                            { label: "Grid Size", value: "5 × 6 (30 symbols)" },
                            { label: "Pay Type", value: "Scatter Pay (8+)" },
                            { label: "Volatility", value: "High" },
                            { label: "RTP", value: "96.5%" },
                            { label: "Max Win", value: "5,000× bet" },
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-1 border-b border-green-400/20">
                              <span className="text-green-300 text-sm">{item.label}</span>
                              <span className="font-bold text-sm">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Features Card */}
                      <div 
                        className="rounded-xl p-5"
                        style={{
                          background: "linear-gradient(180deg, rgba(122,255,112,0.15) 0%, rgba(90,180,84,0.1) 100%)",
                          border: "2px solid rgba(122,255,112,0.3)",
                        }}
                      >
                        <h3 className="text-xl font-black text-green-400 mb-4">FEATURES</h3>
                        <div className="space-y-3 text-white text-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-green-400">🎰</span>
                            <div>
                              <span className="font-bold text-green-300">Tumble Mechanic:</span>
                              <span className="text-gray-300"> Winning symbols explode, new ones fall</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-400">🔥</span>
                            <div>
                              <span className="font-bold text-green-300">Free Spins:</span>
                              <span className="text-gray-300"> 4+ Ovens trigger bonus round</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-400">💣</span>
                            <div>
                              <span className="font-bold text-green-300">Multipliers:</span>
                              <span className="text-gray-300"> ×2 to ×100 in free spins</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-400">💰</span>
                            <div>
                              <span className="font-bold text-green-300">Buy Bonus:</span>
                              <span className="text-gray-300"> 100× bet for instant free spins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PAYTABLE Tab */}
                {activeTab === "paytable" && (
                  <motion.div
                    key="paytable"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-3 gap-3">
                      {symbols.map((symbol, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="rounded-xl p-3 text-center"
                          style={{
                            background: "linear-gradient(180deg, rgba(60,60,60,0.9) 0%, rgba(40,40,40,0.9) 100%)",
                            border: `2px solid ${symbol.color}40`,
                          }}
                        >
                          <img 
                            src={symbol.image} 
                            alt={symbol.name}
                            className="w-16 h-16 mx-auto mb-2 object-contain"
                          />
                          <div className="text-white font-bold text-xs mb-1">{symbol.name}</div>
                          <div 
                            className="text-xs px-2 py-0.5 rounded-full inline-block mb-2"
                            style={{ 
                              background: `${symbol.color}30`,
                              color: symbol.color,
                              border: `1px solid ${symbol.color}50`,
                            }}
                          >
                            {symbol.tier}
                          </div>
                          <div className="space-y-1 text-xs">
                            {Object.entries(symbol.payouts).map(([count, payout]) => (
                              <div key={count} className="flex justify-between text-gray-300">
                                <span>{count}×</span>
                                <span className="text-green-400 font-bold">{payout}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* RULES Tab */}
                {activeTab === "rules" && (
                  <motion.div
                    key="rules"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div 
                      className="rounded-xl p-5"
                      style={{
                        background: "linear-gradient(180deg, rgba(122,255,112,0.15) 0%, rgba(90,180,84,0.1) 100%)",
                        border: "2px solid rgba(122,255,112,0.3)",
                      }}
                    >
                      <h3 className="text-xl font-black text-green-400 mb-4">HOW TO WIN</h3>
                      <div className="space-y-3 text-white text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">✨</span>
                          <div>
                            <span className="font-bold text-green-300">8+ Matching Symbols:</span>
                            <span className="text-gray-300"> Land 8 or more of the same symbol anywhere on the grid to win!</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🔄</span>
                          <div>
                            <span className="font-bold text-green-300">Tumble Feature:</span>
                            <span className="text-gray-300"> After a win, winning symbols disappear and new ones fall from above. This continues until no more wins occur.</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🎯</span>
                          <div>
                            <span className="font-bold text-green-300">Scatter Pays:</span>
                            <span className="text-gray-300"> Symbols don't need to be connected - they just need to appear anywhere on the reels.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="rounded-xl p-5"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,200,100,0.15) 0%, rgba(200,150,80,0.1) 100%)",
                        border: "2px solid rgba(255,200,100,0.3)",
                      }}
                    >
                      <h3 className="text-xl font-black text-yellow-400 mb-4">FREE SPINS</h3>
                      <div className="space-y-2 text-white text-sm">
                        <div className="flex justify-between py-1 border-b border-yellow-400/20">
                          <span>4 Scatter Symbols</span>
                          <span className="text-yellow-400 font-bold">10 Free Spins</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-yellow-400/20">
                          <span>5 Scatter Symbols</span>
                          <span className="text-yellow-400 font-bold">15 Free Spins</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-yellow-400/20">
                          <span>6 Scatter Symbols</span>
                          <span className="text-yellow-400 font-bold">20 Free Spins</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>3+ Scatters (Retrigger)</span>
                          <span className="text-yellow-400 font-bold">+5 Free Spins</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* EXPLANATION/INFO Tab */}
                {activeTab === "explanation" && (
                  <motion.div
                    key="explanation"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div 
                      className="rounded-xl p-5"
                      style={{
                        background: "linear-gradient(180deg, rgba(122,255,112,0.15) 0%, rgba(90,180,84,0.1) 100%)",
                        border: "2px solid rgba(122,255,112,0.3)",
                      }}
                    >
                      <h3 className="text-xl font-black text-green-400 mb-4">MULTIPLIER BOMBS</h3>
                      <div className="text-white text-sm space-y-2">
                        <p className="text-gray-300">
                          During Free Spins, Multiplier Bombs can appear on the reels. When a winning tumble sequence ends, 
                          all visible multipliers are added together and applied to your total win!
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {["×2", "×3", "×5", "×10", "×25", "×50", "×100"].map((mult, i) => (
                            <div 
                              key={i}
                              className="text-center py-2 rounded-lg font-bold"
                              style={{
                                background: `rgba(255,215,0,${0.1 + i * 0.05})`,
                                border: "1px solid rgba(255,215,0,0.3)",
                                color: "#ffd700",
                              }}
                            >
                              {mult}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div 
                      className="rounded-xl p-5"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,100,100,0.15) 0%, rgba(200,80,80,0.1) 100%)",
                        border: "2px solid rgba(255,100,100,0.3)",
                      }}
                    >
                      <h3 className="text-xl font-black text-red-400 mb-4">BUY BONUS</h3>
                      <div className="text-white text-sm space-y-2">
                        <p className="text-gray-300">
                          Don't want to wait for scatters? You can instantly trigger 10 Free Spins by paying 100× your current bet!
                        </p>
                        <div className="bg-red-500/20 rounded-lg p-3 mt-3 border border-red-400/30">
                          <div className="flex justify-between items-center">
                            <span className="text-red-300 font-bold">Buy Bonus Cost:</span>
                            <span className="text-white font-black text-lg">100× BET</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="rounded-xl p-5"
                      style={{
                        background: "linear-gradient(180deg, rgba(100,150,255,0.15) 0%, rgba(80,120,200,0.1) 100%)",
                        border: "2px solid rgba(100,150,255,0.3)",
                      }}
                    >
                      <h3 className="text-xl font-black text-blue-400 mb-4">RESPONSIBLE GAMING</h3>
                      <div className="text-white text-sm space-y-2">
                        <p className="text-gray-300">
                          This game is for entertainment purposes only. Please play responsibly and within your limits.
                          The theoretical Return to Player (RTP) is 96.5%.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
