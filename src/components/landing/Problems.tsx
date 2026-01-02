import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Search, ClipboardList } from "lucide-react";

const Problems = () => {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Constant Stock-Outs",
      description: "Losing sales because you don't know what's running low until it's too late",
      color: "text-destructive",
    },
    {
      icon: DollarSign,
      title: "Cash Tied Up",
      description: "Overstocking items while critical materials run out",
      color: "text-accent",
    },
    {
      icon: Search,
      title: "Missing Items",
      description: "Theft and discrepancies you can't track or prove",
      color: "text-muted-foreground",
    },
    {
      icon: ClipboardList,
      title: "Manual Chaos",
      description: "Hours spent counting stock, checking notebooks, and making errors",
      color: "text-primary",
    },
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Are These Problems Killing Your Business?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nigerian SMEs lose millions every year to poor inventory management. Sound familiar?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow duration-300"
            >
              <div className={`mb-4 ${problem.color}`}>
                <problem.icon className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-card-foreground mb-2">
                {problem.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problems;