import { motion } from "framer-motion";
import { 
  Truck, 
  Warehouse, 
  Package, 
  ClipboardCheck, 
  Store, 
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock
} from "lucide-react";

const InventoryFlowDiagram = () => {
  // Current step for the most recent item (0-indexed)
  const currentItemStep = 2; // Currently at "Warehouse" step
  
  const recentItem = {
    name: "Premium Cement (50 bags)",
    sku: "CEM-001",
    arrivedAt: "10:30 AM",
  };

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

  const getStepStatus = (index: number) => {
    if (index < currentItemStep) return "completed";
    if (index === currentItemStep) return "current";
    return "pending";
  };

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

      {/* Recent Item Progress Tracker */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-card-foreground">Latest Item Tracking</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{recentItem.arrivedAt}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-medium text-card-foreground text-sm">{recentItem.name}</p>
            <p className="text-xs text-muted-foreground">SKU: {recentItem.sku}</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              {steps[currentItemStep].title}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 relative">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentItemStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`w-1 h-1 rounded-full ${
                  index <= currentItemStep ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Desktop Flow */}
      <div className="hidden md:flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <div key={index} className="flex items-center flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center flex-1"
              >
                <div
                  className={`${
                    status === "current" 
                      ? step.color + " ring-4 ring-primary/30" 
                      : status === "completed"
                        ? step.color
                        : "bg-muted"
                  } w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg relative transition-all duration-300`}
                >
                  <step.icon className={`w-6 h-6 ${
                    status === "pending" ? "text-muted-foreground" : "text-primary-foreground"
                  }`} />
                  
                  {status === "completed" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="absolute -bottom-1 -right-1 bg-background rounded-full"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </motion.div>
                  )}
                  
                  {status === "current" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="absolute -bottom-1 -right-1 bg-background rounded-full"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Circle className="w-5 h-5 text-accent fill-accent" />
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {status === "pending" && (
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full">
                      <Circle className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <h3 className={`font-medium text-sm mb-1 ${
                  status === "pending" ? "text-muted-foreground" : "text-card-foreground"
                }`}>
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
                  <ArrowRight className={`w-5 h-5 ${
                    index < currentItemStep ? "text-primary" : "text-muted-foreground/40"
                  }`} />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Flow */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 ${
                status === "current" ? "bg-primary/5 -mx-2 px-2 py-2 rounded-lg" : ""
              }`}
            >
              <div className="relative">
                <div
                  className={`${
                    status === "current" 
                      ? step.color + " ring-4 ring-primary/30" 
                      : status === "completed"
                        ? step.color
                        : "bg-muted"
                  } w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300`}
                >
                  <step.icon className={`w-5 h-5 ${
                    status === "pending" ? "text-muted-foreground" : "text-primary-foreground"
                  }`} />
                </div>
                {index < steps.length - 1 && (
                  <div className={`absolute left-1/2 top-12 w-0.5 h-4 -translate-x-1/2 ${
                    index < currentItemStep ? "bg-primary" : "bg-border"
                  }`} />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium text-sm ${
                  status === "pending" ? "text-muted-foreground" : "text-card-foreground"
                }`}>
                  {step.title}
                  {status === "current" && (
                    <span className="ml-2 text-xs text-primary font-normal">(Current)</span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {status === "completed" && (
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              )}
              {status === "current" && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Circle className="w-5 h-5 text-accent fill-accent flex-shrink-0" />
                </motion.div>
              )}
              {status === "pending" && (
                <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
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
