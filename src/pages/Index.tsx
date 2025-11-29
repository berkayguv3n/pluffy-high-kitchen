import { useState } from "react";
import { SlotGame } from "@/components/SlotGame";
import { LoadingScreen } from "@/components/LoadingScreen";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && (
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      )}
      {!isLoading && <SlotGame />}
    </>
  );
};

export default Index;
