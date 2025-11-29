import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FreeSpinsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freeSpins: number;
}

export const FreeSpinsModal = ({
  open,
  onOpenChange,
  freeSpins,
}: FreeSpinsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gradient-primary border-accent max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold text-foreground">
            🎉 FREE SPINS! 🎉
          </DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="text-8xl mb-4"
          >
            🎁
          </motion.div>
          <motion.p
            className="text-6xl font-bold text-accent mb-4 text-glow"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {freeSpins}
          </motion.p>
          <p className="text-xl text-foreground mb-2">Free Spins Awarded!</p>
          <p className="text-muted-foreground">
            Collect more 💣 bombs to increase your multiplier!
          </p>
        </motion.div>
        <Button
          onClick={() => onOpenChange(false)}
          className="gradient-primary text-primary-foreground font-bold"
        >
          Let's Go!
        </Button>
      </DialogContent>
    </Dialog>
  );
};
