import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Simple, Transparent Pricing From ₦5,000.00
          </h2>
          <p className="text-muted-foreground mb-8">
            Choose the plan that fits your business. No hidden fees, cancel anytime.
          </p>
          <Link to="/demo">
            <Button size="lg">
              Try Live Demo
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
