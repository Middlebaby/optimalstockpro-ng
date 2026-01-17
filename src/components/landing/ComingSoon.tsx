import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Rocket, Clock, Bell, ArrowRight } from "lucide-react";

const ComingSoon = () => {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            Coming Soon
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Launching Soon!
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            We're putting the finishing touches on Optimalstock Pro. Help us build the perfect solution for Nigerian SMEs by taking our quick survey.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/survey">
              <Button size="xl" className="group">
                <Bell className="w-5 h-5" />
                Take Survey & Get Notified
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="xl">
                <Rocket className="w-5 h-5" />
                Explore Demo
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Early Access</h3>
              <p className="text-sm text-muted-foreground">
                Survey participants get priority access when we launch
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">1 Month Free</h3>
              <p className="text-sm text-muted-foreground">
                Complete the survey and get your first month free
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Shape the Product</h3>
              <p className="text-sm text-muted-foreground">
                Your feedback directly influences our features
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComingSoon;
