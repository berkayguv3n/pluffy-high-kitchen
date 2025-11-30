import React from "react";

interface SymbolTileProps {
  image: string;
  alt?: string;
}

export const SymbolTile: React.FC<SymbolTileProps> = ({ image, alt }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-[14%] rounded-[18px] bg-black/25 backdrop-blur-[6px] shadow-[0_0_18px_rgba(0,0,0,0.85)]" />
      <img
        src={image}
        alt={alt ?? ""}
        className="relative z-[1] w-[86%] h-[86%] object-contain drop-shadow-[0_0_18px_rgba(0,0,0,0.9)]"
      />
    </div>
  );
};

