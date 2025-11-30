import React from "react";

interface SlotFrameProps {
  children: React.ReactNode;
}

export const SlotFrame: React.FC<SlotFrameProps> = ({ children }) => {
  return (
    <div className="relative mx-auto mt-4 w-[min(920px,92vw)]">
      <div className="pointer-events-none absolute -inset-[3px] rounded-[36px] bg-gradient-to-r from-[#7DFF70] via-[#C46CFF] to-[#7DFF70] opacity-80 blur-[2px]" />
      <div className="relative rounded-[32px] border border-[#7DFF70]/35 bg-gradient-to-b from-[#31104F] via-[#240637] to-[#0A0214] shadow-[0_0_60px_rgba(0,0,0,0.9)] px-6 py-5">
        {children}
      </div>
    </div>
  );
};

