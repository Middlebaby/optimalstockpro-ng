import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "How quickly can I set up Optimalstock?",
      answer: "You can be up and running in less than 30 minutes. Our setup wizard guides you through adding your first items, and our support team is available to help if you get stuck.",
    },
    {
      question: "Do I need any technical skills?",
      answer: "Not at all! Optimalstock is designed for business owners, not IT experts. If you can use WhatsApp or Facebook, you can use Optimalstock.",
    },
    {
      question: "Can I access it on my phone?",
      answer: "Yes! Optimalstock works on any device with a web browser - phones, tablets, laptops, and desktop computers. No app download required.",
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "Your data remains yours. We provide easy export options so you can download all your inventory data at any time. If you cancel, we keep your data for 30 days in case you change your mind.",
    },
    {
      question: "Is my business data secure?",
      answer: "Absolutely. We use bank-level encryption to protect your data. Your information is stored on secure servers with daily backups, and only you and your authorized staff can access it.",
    },
    {
      question: "Can I try before I buy?",
      answer: "Yes! We offer a fully functional demo where you can add items, record transactions, and explore all features. You can also get a 14-day free trial of any paid plan.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Got questions? We have answers. If you don't see your question here, feel free to contact us.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-lg px-6 border-none shadow-card"
              >
                <AccordionTrigger className="text-left font-heading font-semibold text-card-foreground hover:text-primary hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;