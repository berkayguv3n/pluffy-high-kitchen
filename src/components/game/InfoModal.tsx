import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InfoModal = ({ open, onOpenChange }: InfoModalProps) => {
  const [activeTab, setActiveTab] = useState<"paylines" | "paytable">("paylines");

  const paylines = [
    [1, 1, 1, 1, 1], // Line 1: Top row
    [2, 2, 2, 2, 2], // Line 2: Middle row
    [3, 3, 3, 3, 3], // Line 3: Bottom row
    [1, 2, 3, 2, 1], // Line 4: V shape
    [3, 2, 1, 2, 3], // Line 5: ^ shape
    [1, 1, 2, 1, 1], // Line 6
    [3, 3, 2, 3, 3], // Line 7
    [2, 1, 1, 1, 2], // Line 8
    [2, 3, 3, 3, 2], // Line 9
    [2, 1, 2, 1, 2], // Line 10
    [2, 3, 2, 3, 2], // Line 11
    [1, 2, 2, 2, 1], // Line 12
    [3, 2, 2, 2, 3], // Line 13
    [1, 2, 1, 2, 1], // Line 14
    [3, 2, 3, 2, 3], // Line 15
  ];

  const paytableData = [
    { symbol: "👨‍🍳", name: "Pluffy Chef", type: "Premium", win3: "5x", win4: "25x", win5: "100x" },
    { symbol: "🍫", name: "Brownie Tray", type: "High", win3: "3x", win4: "15x", win5: "70x" },
    { symbol: "🍕", name: "Pizza Slice", type: "High", win3: "2.5x", win4: "12x", win5: "60x" },
    { symbol: "🥤", name: "Smoothie Cup", type: "Mid", win3: "2x", win4: "10x", win5: "50x" },
    { symbol: "🍪", name: "Cookie Jar", type: "Mid", win3: "1.5x", win4: "8x", win5: "35x" },
    { symbol: "🧁", name: "Muffin", type: "Low", win3: "5x", win4: "20x", win5: "20x" },
    { symbol: "🍳", name: "Spatula", type: "Low", win3: "0.8x", win4: "15x", win5: "15x" },
    { symbol: "🍌", name: "Rolling Pin", type: "Low", win3: "0.5x", win4: "10x", win5: "10x" },
    { symbol: "💥", name: "Oven Scatter", type: "Bonus", win3: "Trigger", win4: "bonus", win5: "spins" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-purple-900/95 border-4 border-green-400 rounded-3xl overflow-hidden">
        <DialogTitle className="sr-only">Game Information</DialogTitle>
        
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-green-400 hover:bg-green-300 transition-all flex items-center justify-center shadow-lg hover:scale-110"
        >
          <X className="w-7 h-7 text-purple-900" />
        </button>

        {/* Header with Tabs */}
        <div className="relative pt-8 pb-4 px-8 bg-gradient-to-b from-green-400/20 to-transparent">
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={() => setActiveTab("paylines")}
              className={`px-8 py-3 rounded-2xl font-bold text-xl transition-all ${
                activeTab === "paylines"
                  ? "bg-green-400 text-purple-900 shadow-lg scale-105"
                  : "bg-purple-700/50 text-white hover:bg-purple-600/50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              PAYLINES
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("paytable")}
              className={`px-8 py-3 rounded-2xl font-bold text-xl transition-all ${
                activeTab === "paytable"
                  ? "bg-green-400 text-purple-900 shadow-lg scale-105"
                  : "bg-purple-700/50 text-white hover:bg-purple-600/50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              PAYTABLE
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 overflow-y-auto h-full">
          {activeTab === "paylines" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-green-400 mb-4 drop-shadow-lg">
                  PAYLINES
                </h2>
                <p className="text-white text-lg">
                  All symbols pay from left to right on selected lines, starting from the leftmost reel,
                  <br />
                  except for bonus symbols.
                  <br />
                  <span className="text-green-300 font-bold">
                    Line wins are multiplied by the bet value on the winning line.
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-5 gap-6">
                {paylines.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-purple-800/50 rounded-xl p-4 border-2 border-green-400/30 hover:border-green-400 transition-all"
                  >
                    <div className="text-green-400 text-2xl font-bold text-center mb-3">
                      {index + 1}
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3].map((row) => (
                        <div key={row} className="col-span-5 grid grid-cols-5 gap-1">
                          {line.map((cellRow, colIndex) => (
                            <div
                              key={colIndex}
                              className={`w-full aspect-square rounded-md transition-all ${
                                cellRow === row
                                  ? "bg-green-400 shadow-lg shadow-green-400/50"
                                  : "bg-gray-600/30"
                              }`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-green-400 mb-6 drop-shadow-lg">
                  PAYTABLE
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game Info */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-purple-800/50 rounded-2xl p-6 border-2 border-green-400/30"
                >
                  <h3 className="text-2xl font-bold text-green-400 mb-4">GAME INFO</h3>
                  <div className="space-y-2 text-white text-lg">
                    <p><span className="text-green-300 font-bold">Grid:</span> 4 rows x 5 reels (20 symbols)</p>
                    <p><span className="text-green-300 font-bold">Paylines:</span> 40 fixed lines</p>
                    <p><span className="text-green-300 font-bold">Pay Direction:</span> Left → Right</p>
                    <p><span className="text-green-300 font-bold">Volatility:</span> Medium - High</p>
                    <p><span className="text-green-300 font-bold">RTP:</span> 96.4%</p>
                    <p><span className="text-green-300 font-bold">Max Win:</span> 3,500 x total bet</p>
                  </div>
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-purple-800/50 rounded-2xl p-6 border-2 border-green-400/30"
                >
                  <h3 className="text-2xl font-bold text-green-400 mb-4">FEATURES</h3>
                  <div className="space-y-2 text-white text-lg">
                    <p><span className="text-green-300 font-bold">Bonus Feature:</span> Overbaked Spins (free spins + random wild rain)</p>
                    <p><span className="text-green-300 font-bold">Random Event:</span> Puff Puff Wild - (triggers)</p>
                    <p><span className="text-green-300 font-bold">Bonus Buy:</span> 100x bet</p>
                  </div>
                </motion.div>
              </div>

              {/* Symbols Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-purple-800/50 rounded-2xl p-6 border-2 border-green-400/30"
              >
                <h3 className="text-2xl font-bold text-green-400 mb-4">SYMBOLS & PAYTABLE</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b-2 border-green-400/30">
                        <th className="text-left py-3 px-4 text-green-300">SYMBOL</th>
                        <th className="text-left py-3 px-4 text-green-300">TYPE</th>
                        <th className="text-center py-3 px-4 text-green-300">3 in a row</th>
                        <th className="text-center py-3 px-4 text-green-300">4 in a row</th>
                        <th className="text-center py-3 px-4 text-green-300">5 in a row</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paytableData.map((item, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="border-b border-green-400/10 hover:bg-purple-700/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{item.symbol}</span>
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              item.type === "Premium" ? "bg-yellow-500/20 text-yellow-300" :
                              item.type === "High" ? "bg-orange-500/20 text-orange-300" :
                              item.type === "Mid" ? "bg-blue-500/20 text-blue-300" :
                              item.type === "Bonus" ? "bg-green-500/20 text-green-300" :
                              "bg-gray-500/20 text-gray-300"
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4 text-lg font-bold text-green-300">{item.win3}</td>
                          <td className="text-center py-3 px-4 text-lg font-bold text-green-300">{item.win4}</td>
                          <td className="text-center py-3 px-4 text-lg font-bold text-green-300">{item.win5}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
