import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import loadingBg from "@/assets/loading-bg.png";
import loadingCharacter from "@/assets/loading-character.png";
import loadingGlow from "@/assets/loading-glow.png";
import loadingText from "@/assets/loading-text.png";
import loadingBarBottom from "@/assets/loading-bar-bottom.png";
import loadingBarFill from "@/assets/loading-bar-fill.png";
import loadingBarTop from "@/assets/loading-bar-top.png";
import loadingLogo from "@/assets/loading-logo.png";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsComplete(true);
            setTimeout(onLoadingComplete, 500);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundImage: `url(${loadingBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col items-center justify-center h-full w-full">
            {/* Green Glow Effect */}
            <motion.div
              className="absolute top-1/4"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={loadingGlow}
                alt=""
                className="w-[350px] h-auto"
                style={{ filter: "blur(40px)" }}
              />
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-[15%]"
            >
              <img
                src={loadingLogo}
                alt="Pluffy: High Kitchen"
                className="w-[320px] h-auto drop-shadow-2xl"
              />
            </motion.div>

            {/* Character */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
              className="absolute bottom-[25%]"
            >
              <motion.img
                src={loadingCharacter}
                alt="Chef Character"
                className="w-[280px] h-auto drop-shadow-2xl"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Loading Text and Bar Container */}
            <div className="absolute bottom-[12%] flex flex-col items-center">
              {/* Loading Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-4"
              >
                <motion.img
                  src={loadingText}
                  alt="Loading"
                  className="w-[280px] h-auto"
                  animate={{
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              {/* Loading Bar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="relative w-[350px]"
              >
                {/* Bar Bottom Layer */}
                <img
                  src={loadingBarBottom}
                  alt=""
                  className="absolute inset-0 w-full h-auto"
                />

                {/* Bar Fill with mask */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    style={{
                      width: `${progress}%`,
                      transition: "width 0.3s ease-out",
                    }}
                    className="h-full"
                  >
                    <img
                      src={loadingBarFill}
                      alt=""
                      className="h-full w-[350px] object-cover"
                    />
                  </motion.div>
                </div>

                {/* Bar Top Frame */}
                <img
                  src={loadingBarTop}
                  alt=""
                  className="relative w-full h-auto drop-shadow-lg"
                />
              </motion.div>
            </div>
          </div>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-green-400/40"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              animate={{
                y: [-20, -60, -20],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
