import { useState } from "react";
import { motion } from "framer-motion";
import { Package, ArrowRight, Plus, BarChart3, ArrowDownCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingTourProps {
  onComplete: () => void;
  onNavigate: (tab: string) => void;
  onAddFirstItem: () => void;
}

const steps = [
  {
    title: "Welcome to OptimalStock Pro! 🎉",
    description: "Let's take a quick tour to help you get started with managing your inventory like a pro.",
    icon: BarChart3,
  },
  {
    title: "Your Dashboard",
    description: "This is your business overview. You'll see stock value, movements, and alerts here once you start adding inventory.",
    icon: Package,
  },
  {
    title: "Track Stock Movement",
    description: "Use 'Incoming Stock' to record deliveries and 'Outgoing Stock' to record sales, usage, or transfers. Everything updates automatically!",
    icon: ArrowDownCircle,
  },
  {
    title: "Manage Suppliers",
    description: "Add your suppliers to easily track where your stock comes from and create purchase orders.",
    icon: Users,
  },
  {
    title: "Add Your First Product",
    description: "Let's get started! Click below to add your first inventory item to the Master Inventory.",
    icon: Plus,
  },
];

const OnboardingTour = ({ onComplete, onNavigate, onAddFirstItem }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onNavigate("inventory");
      setTimeout(() => onAddFirstItem(), 300);
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <StepIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-heading font-bold text-card-foreground mb-3">
            {step.title}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "bg-primary w-6"
                    : i < currentStep
                    ? "bg-primary/50 w-2"
                    : "bg-muted w-2"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Tour
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add First Product
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingTour;
