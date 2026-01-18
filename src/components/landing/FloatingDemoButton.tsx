import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

const FloatingDemoButton = () => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link to="/demo">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: [
              "0 0 0 0 rgba(20, 184, 166, 0.4)",
              "0 0 0 15px rgba(20, 184, 166, 0)",
            ]
          }}
          transition={{
            boxShadow: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-shadow"
        >
          <Play className="w-5 h-5 fill-current" />
          Try Live Demo
        </motion.button>
      </Link>
    </motion.div>
  );
};

export default FloatingDemoButton;
