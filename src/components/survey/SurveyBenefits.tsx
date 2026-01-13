import { motion } from "framer-motion";
import { TrendingDown, Clock, ShieldAlert, BarChart3, Package, Users } from "lucide-react";

const SurveyBenefits = () => {
  const benefits = [
    {
      icon: TrendingDown,
      title: "Stop Revenue Leakage",
      description: "Identify where money disappears through stock losses, theft, and mismanagement.",
    },
    {
      icon: Clock,
      title: "Save Hours Weekly",
      description: "Automate tedious inventory counts and reports that eat up your valuable time.",
    },
    {
      icon: ShieldAlert,
      title: "Prevent Stock-Outs",
      description: "Never lose a sale because you ran out of critical items unexpectedly.",
    },
    {
      icon: BarChart3,
      title: "Make Data-Driven Decisions",
      description: "Get real insights into what sells, what's overstocked, and where to invest.",
    },
    {
      icon: Package,
      title: "Track Everything",
      description: "Know exactly what you have, where it is, and what it's worth — in real-time.",
    },
    {
      icon: Users,
      title: "Hold Staff Accountable",
      description: "Every transaction tracked. Every movement logged. No more excuses.",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Why Nigerian SMEs Need Better Inventory Management
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Poor inventory management costs Nigerian businesses billions annually. Here's what proper tracking can solve:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <benefit.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-card-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SurveyBenefits;
