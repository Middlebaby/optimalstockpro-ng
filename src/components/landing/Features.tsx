import { motion } from "framer-motion";
import { 
  Smartphone, 
  Bell, 
  Shield, 
  Users, 
  PiggyBank, 
  BarChart3,
  FolderKanban,
  ArrowRightLeft,
  Wrench,
  ShoppingCart,
  ImageIcon,
  Factory
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Features = () => {
  const basicFeatures = [
    {
      icon: Smartphone,
      title: "Real-Time Tracking",
      description: "Know exactly what you have, where it is, and what it's worth at any moment.",
    },
    {
      icon: Bell,
      title: "Automatic Alerts",
      description: "Get instant warnings when stock runs low. Never run out of critical materials.",
    },
    {
      icon: Shield,
      title: "Theft Detection",
      description: "Compare physical counts with system records. Catch discrepancies early.",
    },
    {
      icon: Users,
      title: "Staff Accountability",
      description: "Track who handled every transaction with end-of-day sign-offs.",
    },
    {
      icon: PiggyBank,
      title: "Cost Tracking",
      description: "Monitor total inventory value and make smarter purchasing decisions.",
    },
    {
      icon: BarChart3,
      title: "Professional Reports",
      description: "Category breakdowns, monthly summaries, and variance reports.",
    },
  ];

  const proFeatures = [
    {
      icon: FolderKanban,
      title: "Project Management",
      description: "Track materials, budgets, and progress for each project. Upload before/after photos.",
    },
    {
      icon: ArrowRightLeft,
      title: "Multi-Location Transfers",
      description: "Manage multiple warehouses and stores. Transfer stock between locations seamlessly.",
    },
    {
      icon: Wrench,
      title: "Equipment Tracking",
      description: "Track tools and equipment. Schedule maintenance and monitor conditions.",
    },
    {
      icon: ShoppingCart,
      title: "Purchase Orders",
      description: "Generate professional purchase orders. Track deliveries and supplier performance.",
    },
    {
      icon: ImageIcon,
      title: "Work Orders & Photos",
      description: "Create work orders, allocate materials, and document progress with photos.",
    },
    {
      icon: Factory,
      title: "Manufacturing Focus",
      description: "Built for construction and manufacturing. Track material usage per project.",
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
            From simple inventory tracking to full project management — we've got you covered.
          </p>
        </motion.div>

        {/* Basic Features */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <h3 className="text-2xl font-heading font-semibold text-foreground">Basic Features</h3>
            <Badge variant="secondary">All Plans</Badge>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {basicFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-xl bg-hero-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-heading font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Professional Features */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <h3 className="text-2xl font-heading font-semibold text-foreground">Professional Features</h3>
            <Badge className="bg-primary">Manufacturing & Construction</Badge>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 ring-1 ring-primary/10"
              >
                <div className="absolute inset-0 rounded-xl bg-hero-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-heading font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;