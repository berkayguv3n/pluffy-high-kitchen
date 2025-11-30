import React from "react";
import reelFrameImg from "@/assets/reel-frame.png";

interface SlotFrameProps {
  children: React.ReactNode;
}

export const SlotFrame: React.FC<SlotFrameProps> = ({ children }) => {
  return (
    <div 
      className="slot-frame-container"
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Frame Image - the decorative border */}
      <img 
        src={reelFrameImg}
        alt=""
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "fill",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      
      {/* Content Area - where the game grid goes */}
      <div 
        style={{
          position: "relative",
          zIndex: 5,
          width: "78%", // Content sits inside the frame
          height: "78%",
          margin: "6% 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};
