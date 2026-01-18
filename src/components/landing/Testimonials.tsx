import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "We use notebook to keep track of stocks but it's stressful. Also tried Excel and it's the same problem - can't keep up with daily movements.",
      author: "Tunde",
      role: "Frozen Food Seller",
      location: "Lagos",
    },
    {
      quote: "Can't keep track of what I have in stock. My staffs steal a lot and I only find out when I do manual counting at month end.",
      author: "Emeka",
      role: "Fabrication Company Owner",
      location: "Port Harcourt",
    },
    {
      quote: "I've lost over ₦300,000 this year alone from items going missing. No system to track who took what and when.",
      author: "Amina",
      role: "Retail Store Owner",
      location: "Abuja",
    },
    {
      quote: "My suppliers deliver short quantities sometimes. Without proper records, I can't prove anything or hold them accountable.",
      author: "Chidi",
      role: "Construction Materials Dealer",
      location: "Enugu",
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
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
            ⭐ What Nigerian Business Owners Are Saying
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Real Problems, Real Business Owners
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These are actual challenges shared by Nigerian SME owners. Sound familiar?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-card relative border-l-4 border-accent"
            >
              <Quote className="absolute top-4 right-4 w-6 h-6 text-accent/30" />
              <p className="text-card-foreground mb-4 text-sm leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-heading font-semibold text-foreground uppercase text-sm">
                  {testimonial.author}
                </p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.role}
                </p>
                <p className="text-xs text-primary">
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