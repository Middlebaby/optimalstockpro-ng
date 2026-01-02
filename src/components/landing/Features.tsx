import { motion } from "framer-motion";
import { 
  Smartphone, 
  Bell, 
  Shield, 
  Users, 
  PiggyBank, 
  BarChart3 
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Smartphone,
      title: "Real-Time Tracking",
      description: "Know exactly what you have, where it is, and what it's worth at any moment. Works on phone, tablet, or computer.",
    },
    {
      icon: Bell,
      title: "Automatic Alerts",
      description: "Get instant warnings when stock runs low. Never run out of critical materials again.",
    },
    {
      icon: Shield,
      title: "Theft Detection",
      description: "Compare physical counts with system records. Catch discrepancies before they become big losses.",
    },
    {
      icon: Users,
      title: "Staff Accountability",
      description: "Track who handled every transaction. End-of-day sign-offs keep everyone honest.",
    },
    {
      icon: PiggyBank,
      title: "Cost Tracking",
      description: "Monitor total inventory value. Make smarter purchasing decisions based on real data.",
    },
    {
      icon: BarChart3,
      title: "Professional Reports",
      description: "Category breakdowns, monthly summaries, variance reports. Everything you need to understand your business.",
    },
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            The Complete Solution You Need
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to take control of your inventory in one powerful, easy-to-use system.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card rounded-xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-xl bg-hero-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;