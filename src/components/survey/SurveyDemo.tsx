import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";

const SurveyDemo = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            See Optimalstock Pro in Action
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our interactive demo to see how easy inventory management can be.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Demo Preview Frame */}
          <div className="relative rounded-2xl overflow-hidden shadow-elevated bg-card border border-border">
            {/* Browser Chrome */}
            <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-accent/60" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-background rounded-md px-4 py-1 text-xs text-muted-foreground">
                  optimalstockpro.com/dashboard
                </div>
              </div>
            </div>
            
            {/* Demo Content Preview */}
            <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-card/80 backdrop-blur-sm" />
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6 ring-4 ring-primary/20">
                  <Play className="w-10 h-10 ml-1" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  Interactive Dashboard Demo
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Click to explore inventory tracking, reports, and more
                </p>
                <Link to="/demo">
                  <Button size="lg" className="group">
                    Try Live Demo
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
};

export default SurveyDemo;
