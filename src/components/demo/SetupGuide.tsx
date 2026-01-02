import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SetupGuide = () => {
  const steps = [
    {
      title: "Add your inventory items",
      description: "Start by adding all your products, raw materials, and supplies to the system.",
      completed: true,
    },
    {
      title: "Set up reorder levels",
      description: "Define minimum stock levels for each item to get automatic alerts.",
      completed: true,
    },
    {
      title: "Add your suppliers",
      description: "Keep track of supplier contact information and what they provide.",
      completed: true,
    },
    {
      title: "Add your staff",
      description: "Create accounts for staff members who will record transactions.",
      completed: false,
    },
    {
      title: "Record your first transaction",
      description: "Try recording an incoming or outgoing stock movement.",
      completed: false,
    },
    {
      title: "Generate your first report",
      description: "View inventory summaries and analytics to understand your stock.",
      completed: false,
    },
  ];

  const tips = [
    {
      title: "Daily Sign-offs",
      description: "Have your staff sign off at the end of each day to confirm all transactions are accurate.",
    },
    {
      title: "Regular Stock Counts",
      description: "Do physical counts weekly to catch discrepancies early and prevent theft.",
    },
    {
      title: "Use Categories",
      description: "Organize items into categories for easier tracking and better reports.",
    },
    {
      title: "Set Smart Reorder Levels",
      description: "Base reorder levels on your typical usage to avoid stock-outs without overstocking.",
    },
  ];

  const completedSteps = steps.filter(s => s.completed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Setup Guide
        </h1>
        <p className="text-muted-foreground">
          Follow these steps to get the most out of Optimalstock
        </p>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-card-foreground">
            Your Progress
          </h2>
          <span className="text-sm text-muted-foreground">
            {completedSteps} of {steps.length} completed
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h2 className="font-heading font-semibold text-card-foreground mb-6">
          Setup Steps
        </h2>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                step.completed ? "bg-primary/5" : "bg-muted/50"
              }`}
            >
              <div className="mt-0.5">
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-primary" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${step.completed ? "text-primary" : "text-card-foreground"}`}>
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
              {!step.completed && (
                <Button variant="outline" size="sm">
                  Start
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h2 className="font-heading font-semibold text-card-foreground mb-6">
          Pro Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="p-4 bg-accent/10 rounded-lg">
              <h3 className="font-medium text-card-foreground mb-1">
                {tip.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Need Help */}
      <div className="bg-hero-gradient rounded-xl p-8 text-center">
        <h2 className="text-xl font-heading font-bold text-primary-foreground mb-2">
          Need Help Getting Started?
        </h2>
        <p className="text-primary-foreground/80 mb-6">
          Our team is here to help you set up your inventory system.
        </p>
        <Button variant="hero" size="lg">
          Contact Support
        </Button>
      </div>
    </div>
  );
};

export default SetupGuide;