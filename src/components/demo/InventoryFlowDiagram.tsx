import { motion } from "framer-motion";
import { 
  Truck, 
  Warehouse, 
  Package, 
  ClipboardCheck, 
  Store, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const InventoryFlowDiagram = () => {
  const steps = [
    {
      icon: Truck,
      title: "Receiving",
      description: "Stock arrives from suppliers",
      color: "bg-primary",
    },
    {
      icon: ClipboardCheck,
      title: "Quality Check",
      description: "Verify & log incoming items",
      color: "bg-primary-glow",
    },
    {
      icon: Warehouse,
      title: "Warehouse",
      description: "Store in master inventory",
      color: "bg-primary",
    },
    {
      icon: Package,
      title: "Pick & Pack",
      description: "Prepare for distribution",
      color: "bg-accent",
    },
    {
      icon: Store,
      title: "Distribution",
      description: "Dispatch to retail locations",
      color: "bg-primary-glow",
    },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-card">
      <div className="mb-6">
        <h2 className="text-lg font-heading font-semibold text-card-foreground">
          Inventory Flow
        </h2>
        <p className="text-sm text-muted-foreground">
          How stock moves through your system
        </p>
      </div>

      {/* Desktop Flow */}
      <div className="hidden md:flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center flex-1"
            >
              <div
                className={`${step.color} w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg relative`}
              >
                <step.icon className="w-6 h-6 text-primary-foreground" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="absolute -bottom-1 -right-1 bg-background rounded-full"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </motion.div>
              </div>
              <h3 className="font-medium text-card-foreground text-sm mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-tight">
                {step.description}
              </p>
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="flex-shrink-0 px-2"
              >
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Flow */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <div
                className={`${step.color} w-12 h-12 rounded-full flex items-center justify-center shadow-md`}
              >
                <step.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 w-0.5 h-4 bg-border -translate-x-1/2" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-card-foreground text-sm">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {step.description}
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* Live Stats */}
      <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-heading font-bold text-primary">24</p>
          <p className="text-xs text-muted-foreground">Items Received Today</p>
        </div>
        <div>
          <p className="text-2xl font-heading font-bold text-accent">18</p>
          <p className="text-xs text-muted-foreground">In Processing</p>
        </div>
        <div>
          <p className="text-2xl font-heading font-bold text-primary-glow">12</p>
          <p className="text-xs text-muted-foreground">Distributed</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryFlowDiagram;
