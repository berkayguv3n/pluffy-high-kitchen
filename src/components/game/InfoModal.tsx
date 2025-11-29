import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InfoModal = ({ open, onOpenChange }: InfoModalProps) => {
  const [activeTab, setActiveTab] = useState<"paytable" | "paylines">("paytable");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 bg-gradient-to-br from-purple-900/98 via-purple-800/98 to-purple-900/98 border-4 border-green-400/80 rounded-3xl overflow-hidden shadow-2xl">
        <DialogTitle className="sr-only">Game Information</DialogTitle>
        
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-6 right-6 z-50 w-14 h-14 rounded-full bg-green-400 hover:bg-green-300 transition-all flex items-center justify-center shadow-xl hover:scale-110 border-2 border-green-300"
        >
          <X className="w-8 h-8 text-purple-900 font-bold" strokeWidth={3} />
        </button>

        {/* Header with Tabs */}
        <div className="relative pt-10 pb-6 px-8 bg-gradient-to-b from-green-400/20 to-transparent border-b-2 border-green-400/30">
          <div className="flex gap-6 justify-center">
            <motion.button
              onClick={() => setActiveTab("paytable")}
              className={`px-12 py-4 rounded-2xl font-black text-2xl transition-all ${
                activeTab === "paytable"
                  ? "bg-green-400 text-purple-900 shadow-xl scale-105"
                  : "bg-purple-700/60 text-white hover:bg-purple-600/60"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              PAYTABLE
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("paylines")}
              className={`px-12 py-4 rounded-2xl font-black text-2xl transition-all ${
                activeTab === "paylines"
                  ? "bg-green-400 text-purple-900 shadow-xl scale-105"
                  : "bg-purple-700/60 text-white hover:bg-purple-600/60"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              PAYLINES
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="px-10 py-8 overflow-y-auto h-full">
          {activeTab === "paytable" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Main Title */}
              <div className="text-center mb-6">
                <h2 className="text-6xl font-black text-green-400 mb-2 drop-shadow-2xl"
                    style={{
                      textShadow: "0 0 30px rgba(100,255,100,0.6), 0 4px 12px rgba(0,0,0,0.8)"
                    }}>
                  PAYTABLE
                </h2>
                <div className="h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Game Info */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-purple-800/60 rounded-3xl p-8 border-3 border-green-400/40 backdrop-blur-sm shadow-xl"
                >
                  <h3 className="text-3xl font-black text-green-400 mb-6 text-center">GAME INFO</h3>
                  <div className="space-y-3 text-white text-xl">
                    <div className="flex justify-between items-center py-2 border-b border-green-400/20">
                      <span className="text-green-300 font-bold">Grid:</span>
                      <span className="font-semibold">4x5 (20 symbols)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-400/20">
                      <span className="text-green-300 font-bold">Paylines:</span>
                      <span className="font-semibold">40 fixed lines</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-400/20">
                      <span className="text-green-300 font-bold">Pay Direction:</span>
                      <span className="font-semibold">Left → Right</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-400/20">
                      <span className="text-green-300 font-bold">Volatility:</span>
                      <span className="font-semibold">Medium-High</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-400/20">
                      <span className="text-green-300 font-bold">RTP:</span>
                      <span className="font-semibold">96.4%</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-green-300 font-bold">Max Win:</span>
                      <span className="font-semibold">3,500x bet</span>
                    </div>
                  </div>
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-purple-800/60 rounded-3xl p-8 border-3 border-green-400/40 backdrop-blur-sm shadow-xl"
                >
                  <h3 className="text-3xl font-black text-green-400 mb-6 text-center">FEATURES</h3>
                  <div className="space-y-4 text-white text-lg">
                    <div className="bg-purple-900/50 rounded-xl p-4 border border-green-400/20">
                      <div className="text-green-300 font-bold mb-2">🎰 Bonus Feature:</div>
                      <div className="text-base">Overbaked Spins (free spins + random wild rain)</div>
                    </div>
                    <div className="bg-purple-900/50 rounded-xl p-4 border border-green-400/20">
                      <div className="text-green-300 font-bold mb-2">💨 Random Event:</div>
                      <div className="text-base">Puff Puff Wild (triggers randomly)</div>
                    </div>
                    <div className="bg-purple-900/50 rounded-xl p-4 border border-green-400/20">
                      <div className="text-green-300 font-bold mb-2">💰 Bonus Buy:</div>
                      <div className="text-base">100x bet - Instant feature trigger</div>
                    </div>
                  </div>
                </motion.div>

                {/* How to Win */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-purple-800/60 rounded-3xl p-8 border-3 border-green-400/40 backdrop-blur-sm shadow-xl"
                >
                  <h3 className="text-3xl font-black text-green-400 mb-6 text-center">HOW TO WIN</h3>
                  <div className="space-y-4 text-white text-lg">
                    <div className="bg-purple-900/50 rounded-xl p-4 border border-green-400/20">
                      <div className="text-green-300 font-bold mb-2">✨ 8+ Matching Symbols</div>
                      <div className="text-base">Anywhere on the grid wins!</div>
                    </div>
                    <div className="bg-purple-900/50 rounded-xl p-4 border border-green-400/20">
                      <div className="text-green-300 font-bold mb-2">🔄 Cascade Wins</div>
                      <div className="text-base">Winning symbols stay, new ones drop</div>
                    </div>
                    <div className="bg-purple-900/50 rounded-xl p-4 border border-green-400/20">
                      <div className="text-green-300 font-bold mb-2">💣 4+ Bomb Scatters</div>
                      <div className="text-base">Triggers 10 free spins!</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Symbols Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-purple-800/60 rounded-3xl p-8 border-3 border-green-400/40 backdrop-blur-sm shadow-xl"
              >
                <h3 className="text-4xl font-black text-green-400 mb-8 text-center">SYMBOLS & PAYOUTS</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-white border-separate border-spacing-y-2">
                    <thead>
                      <tr className="bg-purple-900/70">
                        <th className="text-left py-4 px-6 text-green-300 font-black text-xl rounded-l-xl">SYMBOL</th>
                        <th className="text-left py-4 px-4 text-green-300 font-black text-xl">TYPE</th>
                        <th className="text-center py-4 px-4 text-green-300 font-black text-xl">3 IN ROW</th>
                        <th className="text-center py-4 px-4 text-green-300 font-black text-xl">4 IN ROW</th>
                        <th className="text-center py-4 px-4 text-green-300 font-black text-xl rounded-r-xl">5 IN ROW</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { symbol: "👨‍🍳", name: "Pluffy Chef", type: "Premium", win3: "5x", win4: "25x", win5: "100x", color: "yellow" },
                        { symbol: "🍫", name: "Brownie Tray", type: "High", win3: "3x", win4: "15x", win5: "70x", color: "orange" },
                        { symbol: "🍕", name: "Pizza Slice", type: "High", win3: "2.5x", win4: "12x", win5: "60x", color: "orange" },
                        { symbol: "🥤", name: "Smoothie Cup", type: "Mid", win3: "2x", win4: "10x", win5: "50x", color: "blue" },
                        { symbol: "🍪", name: "Cookie Jar", type: "Mid", win3: "1.5x", win4: "8x", win5: "35x", color: "blue" },
                        { symbol: "🧁", name: "Muffin", type: "Low", win3: "5x", win4: "20x", win5: "20x", color: "gray" },
                        { symbol: "🍳", name: "Spatula", type: "Low", win3: "0.8x", win4: "15x", win5: "15x", color: "gray" },
                        { symbol: "🍌", name: "Rolling Pin", type: "Low", win3: "0.5x", win4: "10x", win5: "10x", color: "gray" },
                        { symbol: "💥", name: "Oven Scatter", type: "Bonus", win3: "Trigger", win4: "bonus", win5: "spins", color: "green" },
                      ].map((item, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className="bg-purple-900/40 hover:bg-purple-700/50 transition-colors"
                        >
                          <td className="py-4 px-6 rounded-l-xl">
                            <div className="flex items-center gap-4">
                              <span className="text-5xl">{item.symbol}</span>
                              <span className="font-bold text-lg">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-4 py-2 rounded-full text-base font-black ${
                              item.color === "yellow" ? "bg-yellow-500/30 text-yellow-300 border border-yellow-400/50" :
                              item.color === "orange" ? "bg-orange-500/30 text-orange-300 border border-orange-400/50" :
                              item.color === "blue" ? "bg-blue-500/30 text-blue-300 border border-blue-400/50" :
                              item.color === "green" ? "bg-green-500/30 text-green-300 border border-green-400/50" :
                              "bg-gray-500/30 text-gray-300 border border-gray-400/50"
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4 text-2xl font-black text-green-300">{item.win3}</td>
                          <td className="text-center py-4 px-4 text-2xl font-black text-green-300">{item.win4}</td>
                          <td className="text-center py-4 px-4 text-2xl font-black text-green-300 rounded-r-xl">{item.win5}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Paylines Title */}
              <div className="text-center mb-8">
                <h2 className="text-6xl font-black text-green-400 mb-4 drop-shadow-2xl"
                    style={{
                      textShadow: "0 0 30px rgba(100,255,100,0.6), 0 4px 12px rgba(0,0,0,0.8)"
                    }}>
                  PAYLINES
                </h2>
                <div className="h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full mb-6"></div>
                <p className="text-white text-2xl font-bold leading-relaxed">
                  All symbols pay from <span className="text-green-400">left to right</span> on selected lines,
                  <br />
                  starting from the <span className="text-green-400">leftmost reel</span>, except for bonus symbols.
                  <br />
                  <span className="text-yellow-400 font-black text-3xl mt-2 block">
                    Line wins are multiplied by the bet value!
                  </span>
                </p>
              </div>

              {/* Paylines Grid - 3 rows of 5 */}
              <div className="grid grid-cols-5 gap-6">
                {Array.from({ length: 15 }, (_, i) => {
                  // Define payline patterns
                  const patterns = [
                    [0, 0, 0, 0, 0], // Line 1: Top
                    [1, 1, 1, 1, 1], // Line 2: Middle
                    [2, 2, 2, 2, 2], // Line 3: Bottom
                    [0, 1, 2, 1, 0], // Line 4: V
                    [2, 1, 0, 1, 2], // Line 5: ^
                    [0, 0, 1, 0, 0], // Line 6
                    [2, 2, 1, 2, 2], // Line 7
                    [1, 0, 0, 0, 1], // Line 8
                    [1, 2, 2, 2, 1], // Line 9
                    [1, 0, 1, 0, 1], // Line 10
                    [1, 2, 1, 2, 1], // Line 11
                    [0, 1, 1, 1, 0], // Line 12
                    [2, 1, 1, 1, 2], // Line 13
                    [0, 1, 0, 1, 0], // Line 14
                    [2, 1, 2, 1, 2], // Line 15
                  ];
                  
                  const pattern = patterns[i];
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-purple-800/60 rounded-2xl p-6 border-3 border-green-400/40 hover:border-green-400/80 hover:shadow-2xl hover:shadow-green-400/30 transition-all cursor-pointer backdrop-blur-sm"
                    >
                      <div className="text-green-400 text-3xl font-black text-center mb-4 drop-shadow-lg">
                        {i + 1}
                      </div>
                      <div className="space-y-2">
                        {[0, 1, 2].map((row) => (
                          <div key={row} className="flex gap-2 justify-center">
                            {pattern.map((cellRow, colIndex) => (
                              <div
                                key={colIndex}
                                className={`w-10 h-10 rounded-lg transition-all ${
                                  cellRow === row
                                    ? "bg-green-400 shadow-lg shadow-green-400/60 scale-110"
                                    : "bg-gray-700/40"
                                }`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
