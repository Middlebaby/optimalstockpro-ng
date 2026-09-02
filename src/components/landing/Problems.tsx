import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Search, ClipboardList } from "lucide-react";

const Problems = () => {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Expired Stock",
      description: "Goods sitting on the shelf past their expiry date, straight into a loss",
      color: "text-destructive",
    },
    {
      icon: DollarSign,
      title: "Stock Shrinkage",
      description: "Items leaving the store without records — and nobody is accountable",
      color: "text-accent",
    },
    {
      icon: Search,
      title: "Manual Counting",
      description: "Hours wasted every week counting stock by hand in notebooks",
      color: "text-muted-foreground",
    },
    {
      icon: ClipboardList,
      title: "No Clear Numbers",
      description: "Guessing your margins because you can't see what really sells",
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
            Are These Problems Costing Your Factory Money?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nigerian prefab and modular builders lose millions every year to material waste and untracked stock. Sound familiar?
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