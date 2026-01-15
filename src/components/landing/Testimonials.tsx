import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "We were losing ₦200,000 monthly to missing items and stock-outs. Optimalstock Pro helped us recover that and more.",
      author: "Chidi Okonkwo",
      role: "Manufacturing Business Owner",
      location: "Lagos",
    },
    {
      quote: "Counting inventory used to take 4 hours every week. Now it takes 30 minutes. The time savings alone are worth it.",
      author: "Amina Ibrahim",
      role: "Retail Store Owner",
      location: "Abuja",
    },
    {
      quote: "Staff accountability changed everything. Now everyone knows their transactions are tracked. Theft dropped to zero.",
      author: "Tunde Adeleke",
      role: "Restaurant Owner",
      location: "Port Harcourt",
    },
  ];

  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            What Business Owners Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join the growing community of Nigerian SMEs transforming their inventory management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-xl p-8 shadow-card relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
              <p className="text-card-foreground mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="font-heading font-semibold text-foreground">
                  {testimonial.author}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
                <p className="text-sm text-primary">
                  {testimonial.location}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;