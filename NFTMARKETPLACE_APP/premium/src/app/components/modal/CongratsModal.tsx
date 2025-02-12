import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface CongratsModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionLabel?: string;
  action?: () => void;
  message?: string;
  winner?: string;
  disabled?: boolean;
}

export default function CongratsModal({
  isOpen,
  onClose,
  message = "You have successfully claimed your prize. Get ready for an amazing experience!",
  actionLabel = "Awesome!",
  action,
  winner,
  disabled,
}: CongratsModalProps) {
  // Determine the final message
  const displayMessage = winner
    ? `${winner} has successfully won the auction!`
    : message;

  // Determine the onClick handler
  const handleAction = () => {
    if (winner && action) {
      action();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center space-y-4">
              <h2 className="text-2xl font-bold text-center text-purple-600">
                Congratulations!
              </h2>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Sparkles className="w-16 h-16 text-yellow-400" />
              </motion.div>
              <p className="text-center text-gray-600">{displayMessage}</p>
              <motion.button
                onClick={handleAction}
                className={`${
                  disabled && "opacity-50 disabled:cursor-not-allowed"
                }mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full px-6 py-2 font-semibold`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {actionLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
