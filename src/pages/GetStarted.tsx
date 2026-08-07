import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  UserPlus,
  Package,
  BarChart3,
  TrendingUp,
  CheckCircle,
  HelpCircle,
  Shield,
  Clock,
} from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { trackLeadEvent, useLeadTracking } from "@/hooks/useLeadTracking";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create your free account",
    description:
      "Sign up with your email or Google in seconds. No credit card required to explore your dashboard.",
  },
  {
    icon: Package,
    number: "02",
    title: "Add your products",
    description:
      "Upload your inventory by spreadsheet, scan barcodes, or enter items manually. Set expiry dates and low-stock alerts.",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Track sales & stock movements",
    description:
      "Record sales, transfers, and purchases. See what's running low, what's expiring, and what's selling fast.",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Grow with confidence",
    description:
      "Use real-time reports to buy smarter, reduce waste, and stop stock-outs from costing you money.",
  },
];

const benefits = [
  "Real-time inventory tracking",
  "Automatic low-stock & expiry alerts",
  "Multi-location & distribution support",
  "Staff accountability & audit logs",
  "WhatsApp, PDF & thermal receipt printing",
  "14-day free trial, cancel anytime",
];

const faqs = [
  {
    question: "What am I signing up for?",
    answer:
      "You are signing up for Optimalstock Pro — inventory management software for Nigerian SMEs. You are NOT signing up for a lead intelligence service. Lead intelligence is an internal tool we use to improve our own marketing.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Every new account starts with a 14-day free trial. You can explore the full dashboard before any payment is required.",
  },
  {
    question: "Can I try it without signing up?",
    answer:
      "Absolutely. Our live demo lets you explore the dashboard without creating an account.",
  },
  {
    question: "What happens after I sign up?",
    answer:
      "After you confirm your email, you'll land in your dashboard where you can add stock, set alerts, and choose your plan when you're ready.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use bank-grade encryption, role-based access, and NDPR-compliant data handling. Your business data is never shared or sold.",
  },
];

const GetStarted = () => {
  useLeadTracking();

  const handleGetStartedClick = () => {
    trackLeadEvent("get_started_cta_click", { location: "get_started_page" }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden bg-hero-gradient py-20 md:py-28 mb-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <Shield className="w-4 h-4" />
                Built for Nigerian SMEs
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-5xl font-heading font-bold text-primary-foreground mb-6 leading-tight"
              >
                Get Started with Optimalstock Pro in Minutes
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
              >
                Professional inventory management that stops stock-outs, reduces waste, and puts you back in control of your business.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  to="/auth?mode=signup"
                  onClick={handleGetStartedClick}
                >
                  <Button variant="hero" size="xl" className="group">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="heroOutline" size="xl">
                    Try Live Demo First
                  </Button>
                </Link>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-sm text-primary-foreground/60 mt-4"
              >
                No credit card required. 14-day free trial.
              </motion.p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="container mx-auto px-4 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Four simple steps to take control of your inventory and start saving money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300"
              >
                <div className="text-5xl font-heading font-bold text-primary/10 mb-4">
                  {step.number}
                </div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-card-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits + CTA */}
        <section className="container mx-auto px-4 mb-24">
          <div className="bg-muted/30 rounded-3xl p-8 md:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                  Everything you need to run a tighter business
                </h2>
                <p className="text-muted-foreground mb-8">
                  From a single store to multi-location distribution, Optimalstock Pro gives you the tools Nigerian SMEs actually use.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card rounded-2xl p-8 shadow-elevated text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-card-foreground mb-2">
                  Ready in under 5 minutes
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your account, confirm your email, and start adding your first products. No technical skills needed.
                </p>
                <Link
                  to="/auth?mode=signup"
                  onClick={handleGetStartedClick}
                >
                  <Button size="lg" className="w-full group">
                    Start Your Free Trial
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-4">
                  By signing up, you agree to our{" "}
                  <Link to="/terms-of-service" className="text-primary underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="text-primary underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <HelpCircle className="w-4 h-4" />
                Common Questions
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                What to expect
              </h2>
              <p className="text-muted-foreground">
                Quick answers so you can sign up with confidence.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-hero-gradient p-8 md:p-16 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
                Stop losing money to poor stock control
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Join Nigerian SMEs that use Optimalstock Pro to track inventory, reduce waste, and grow faster.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/auth?mode=signup"
                  onClick={handleGetStartedClick}
                >
                  <Button variant="hero" size="xl" className="group">
                    Sign Up Free
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="heroOutline" size="xl">
                    Explore the Demo
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GetStarted;
