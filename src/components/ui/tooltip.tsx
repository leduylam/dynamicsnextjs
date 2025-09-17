import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="relative group inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute bottom-full mb-2 z-50"
          >
            <div className="relative">
              <div className="px-2 py-1 text-xs text-white bg-gray-800 rounded shadow">
                {text}
              </div>
              {/* Arrow */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1">
                <div className="w-2 h-2 bg-gray-800 rotate-45" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
