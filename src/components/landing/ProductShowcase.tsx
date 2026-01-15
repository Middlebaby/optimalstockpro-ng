import { motion } from "framer-motion";
import { 
  Package, 
  TrendingUp, 
  Bell, 
  FileText, 
  Shield, 
  Smartphone 
} from "lucide-react";

const ProductShowcase = () => {
  const features = [
    {
      icon: Package,
      title: "Real-time Stock Tracking",
      description: "Track every item as it moves in and out of your business",
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Get insights on your best-selling products and trends",
    },
    {
      icon: Bell,
      title: "Low Stock Alerts",
      description: "Never run out of stock with automatic reorder notifications",
    },
    {
      icon: FileText,
      title: "Purchase Orders",
      description: "Create and manage supplier orders seamlessly",
    },
    {
      icon: Shield,
      title: "Staff Accountability",
      description: "Sign-off system ensures every transaction is verified",
    },
    {
      icon: Smartphone,
      title: "Access Anywhere",
      description: "Manage your inventory from any device, anytime",
    },
  ];

  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            See Optimalstock Pro in Action
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            A powerful, easy-to-use dashboard designed specifically for Nigerian businesses
          </p>
        </motion.div>

        {/* Product Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto mb-16"
        >
          <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-primary-foreground/20">
            <img 
              src="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bd1b3dd5-6267-462b-b431-f65e1bf863f7/5669d94e-047c-422b-bda2-7010a5224990.lovableproject.com-1768483357475.png"
              alt="Optimalstock Pro Dashboard - Professional Inventory Management System"
              className="w-full h-auto"
            />
            {/* Overlay gradient for polish */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="flex items-start gap-4 p-4 rounded-lg bg-primary-foreground/5 backdrop-blur-sm"
            >
              <div className="p-2 bg-primary-foreground/10 rounded-lg shrink-0">
                <feature.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-primary-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-primary-foreground/70">
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

export default ProductShowcase;
