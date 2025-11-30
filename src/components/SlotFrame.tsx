import React from "react";

interface SlotFrameProps {
  children: React.ReactNode;
}

export const SlotFrame: React.FC<SlotFrameProps> = ({ children }) => {
  return (
    <div 
      className="slot-frame"
      style={{
        width: "100%",
        maxWidth: "1280px",
        aspectRatio: "16 / 9",
        position: "relative",
        borderRadius: "42px",
        padding: "22px",
        background: "radial-gradient(circle at top center, #48208b 0%, #23093f 55%, #120418 100%)",
        boxShadow: "0 0 0 4px #280746, 0 0 40px rgba(135, 255, 180, 0.3), 0 40px 80px rgba(0, 0, 0, 0.95)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
      }}
    >
      {/* Neon yeşil dış hat */}
      <div 
        style={{
          content: '""',
          position: "absolute",
          inset: "8px",
          borderRadius: "36px",
          border: "3px solid rgba(151, 255, 187, 0.75)",
          boxShadow: "0 0 18px rgba(151, 255, 187, 0.9), 0 0 45px rgba(151, 255, 187, 0.4)",
          pointerEvents: "none",
        }}
      />

      {/* İç panel (kabin içi) */}
      <div 
        className="slot-inner"
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "32px",
          padding: "26px 38px",
          background: "radial-gradient(circle at top center, #5f2bb0 0%, #3a126b 40%, #23083f 100%)",
          boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.75), inset 0 0 0 2px rgba(255, 255, 255, 0.05)",
          display: "flex",
          flexDirection: "column" as const,
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        {/* Üst bar highlight */}
        <div 
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70%",
            height: "38px",
            borderRadius: "999px",
            background: "radial-gradient(circle at top, rgba(255, 255, 255, 0.13), transparent 60%)",
            opacity: 0.85,
            pointerEvents: "none",
            filter: "blur(1px)",
          }}
        />

        {/* Sol ray (dekoratif) */}
        <div 
          style={{
            position: "absolute",
            top: "28px",
            bottom: "28px",
            left: "18px",
            width: "16px",
            borderRadius: "999px",
            background: "linear-gradient(180deg, #2e0e58, #150425)",
            boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 18px rgba(0, 0, 0, 0.9)",
          }}
        />

        {/* Sağ ray (dekoratif) */}
        <div 
          style={{
            position: "absolute",
            top: "28px",
            bottom: "28px",
            right: "18px",
            width: "16px",
            borderRadius: "999px",
            background: "linear-gradient(180deg, #2e0e58, #150425)",
            boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 18px rgba(0, 0, 0, 0.9)",
          }}
        />

        {/* Asıl oyun penceresi */}
        <div 
          className="slot-window"
          style={{
            position: "relative",
            flex: 1,
            borderRadius: "26px",
            background: "radial-gradient(circle at top, #6e33c0 0%, #3a0f6a 38%, #210438 100%)",
            boxShadow: "inset 0 18px 28px rgba(0, 0, 0, 0.8), inset 0 -14px 22px rgba(0, 0, 0, 0.9), inset 0 0 0 2px rgba(255, 255, 255, 0.03)",
            overflow: "hidden",
          }}
        >
          {/* Köşe vignette */}
          <div 
            style={{
              position: "absolute",
              inset: 0,
              background: `
                radial-gradient(circle at top left, rgba(0, 0, 0, 0.55), transparent 55%),
                radial-gradient(circle at top right, rgba(0, 0, 0, 0.55), transparent 55%),
                radial-gradient(circle at bottom left, rgba(0, 0, 0, 0.75), transparent 55%),
                radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.75), transparent 55%)
              `,
              mixBlendMode: "multiply" as const,
              pointerEvents: "none",
              zIndex: 10,
            }}
          />

          {/* İçte hafif çerçeve */}
          <div 
            style={{
              position: "absolute",
              inset: "10px",
              borderRadius: "22px",
              border: "2px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.7), 0 0 40px rgba(101, 255, 186, 0.15)",
              pointerEvents: "none",
              zIndex: 11,
            }}
          />

          {/* İçerik */}
          <div style={{ position: "relative", zIndex: 5, height: "100%" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
