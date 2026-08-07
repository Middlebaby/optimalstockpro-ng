import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check } from "lucide-react";
import { PLANS, formatNaira } from "@/lib/plans";

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Simple, Transparent Pricing From {formatNaira(PLANS[0].price)}
          </h2>
          <p className="text-muted-foreground">
            Choose the plan that fits your business. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`rounded-xl border bg-card p-6 flex flex-col ${
                plan.popular ? "border-primary shadow-lg" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-heading font-semibold text-foreground">{plan.name}</h3>
                {plan.popular && <Badge>Most popular</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{plan.tagline}</p>
              <div className="mb-5">
                <span className="text-3xl font-bold text-foreground">{formatNaira(plan.price)}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to={`/checkout?plan=${plan.id}`}>
                <Button className="w-full group" variant={plan.popular ? "default" : "outline"}>
                  Choose {plan.name}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link to="/get-started">
            <Button size="lg" variant="ghost">
              How it works
            </Button>
          </Link>
          <Link to="/demo">
            <Button variant="outline" size="lg">
              Try Live Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
