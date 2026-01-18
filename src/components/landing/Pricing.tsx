import { motion } from "framer-motion";
import { Check, Zap, Building2, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      icon: Building2,
      price: "₦5,000",
      period: "/month",
      description: "Perfect for small businesses and retail stores",
      features: [
        "Unlimited inventory items",
        "4 staff accounts",
        "Master inventory management",
        "Incoming & outgoing stock tracking",
        "Supplier management",
        "Basic reports & analytics",
        "Low stock alerts (Email)",
        "Mobile access",
        "Email support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      icon: Factory,
      price: "₦15,000",
      period: "/month",
      description: "For manufacturing, construction & multi-location businesses",
      features: [
        "Everything in Basic, plus:",
        "Unlimited staff accounts",
        "Multi-location/warehouse support",
        "Store-to-store transfers",
        "Project management & tracking",
        "Material allocation per project",
        "Before/after project photos",
        "Work orders & scheduling",
        "Purchase order generation",
        "Equipment & tools tracking",
        "Maintenance scheduling",
        "Advanced analytics & custom reports",
        "WhatsApp notifications",
        "Priority support",
      ],
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl p-8 shadow-card ${
                plan.popular ? "ring-2 ring-primary shadow-elevated" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  <Zap className="w-4 h-4" />
                  Manufacturing Focus
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-primary' : 'bg-muted'}`}>
                  <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-primary-foreground' : 'text-foreground'}`} />
                </div>
                <h3 className="text-xl font-heading font-semibold text-card-foreground">
                  {plan.name}
                </h3>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      feature.includes("Everything in") ? "text-accent" : "text-primary"
                    }`} />
                    <span className={`text-sm text-card-foreground ${
                      feature.includes("Everything in") ? "font-semibold text-accent" : ""
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/get-started">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  Get Started with {plan.name}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Need a custom solution for your enterprise?
          </p>
          <Link to="#contact">
            <Button variant="outline" size="lg">
              Contact Sales for Custom Pricing
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;