import { useState } from "react";
import { motion } from "framer-motion";

interface GameButtonProps {
  backgroundNormal: string;
  backgroundHover: string;
  backgroundPressed: string;
  textImage?: string;
  iconImage?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const GameButton = ({
  backgroundNormal,
  backgroundHover,
  backgroundPressed,
  textImage,
  iconImage,
  onClick,
  disabled = false,
  className = "",
}: GameButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getCurrentBackground = () => {
    if (disabled) return backgroundNormal;
    if (isPressed) return backgroundPressed;
    if (isHovered) return backgroundHover;
    return backgroundNormal;
  };

  return (
    <motion.button
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      style={{
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {/* Background */}
      <img
        src={getCurrentBackground()}
        alt=""
        className="w-full h-full"
        draggable={false}
      />

      {/* Text or Icon Overlay */}
      {(textImage || iconImage) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={textImage || iconImage}
            alt=""
            className={`${textImage ? "h-[40%]" : "h-[50%]"} w-auto`}
            draggable={false}
          />
        </div>
      )}
    </motion.button>
  );
};
