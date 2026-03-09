import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, User } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Why Nigerian SMEs Lose Millions to Poor Inventory Management",
    excerpt: "Studies show that over 60% of Nigerian small businesses experience stock losses due to manual tracking. Learn how digital inventory management can save your business.",
    category: "Industry Insights",
    author: "Arinola Abolarin",
    date: "March 5, 2026",
    readTime: "5 min read",
    slug: "nigerian-smes-inventory-losses",
  },
  {
    id: "2",
    title: "5 Signs Your Business Needs an Inventory Management System",
    excerpt: "Still tracking stock with pen and paper? Here are five telltale signs that your business has outgrown manual inventory methods.",
    category: "Tips & Guides",
    author: "Arinola Abolarin",
    date: "February 28, 2026",
    readTime: "4 min read",
    slug: "signs-you-need-inventory-system",
  },
  {
    id: "3",
    title: "How to Reduce Stock Theft with Smart Tracking Technology",
    excerpt: "Employee theft and unrecorded stock movements cost businesses thousands monthly. Discover practical strategies and tools to prevent stock shrinkage.",
    category: "Best Practices",
    author: "Arinola Abolarin",
    date: "February 20, 2026",
    readTime: "6 min read",
    slug: "reduce-stock-theft-smart-tracking",
  },
  {
    id: "4",
    title: "The Complete Guide to Barcode Scanning for Small Businesses",
    excerpt: "Barcode scanning isn't just for big corporations. Learn how your SME can leverage phone-based barcode scanning for faster, more accurate stock management.",
    category: "Tips & Guides",
    author: "Arinola Abolarin",
    date: "February 15, 2026",
    readTime: "7 min read",
    slug: "barcode-scanning-guide-smes",
  },
  {
    id: "5",
    title: "Managing Expiry Dates: A Food & FMCG Business Essential",
    excerpt: "For businesses dealing with perishable goods, expiry date management can make or break profitability. Here's how to stay ahead of product expiration.",
    category: "Industry Insights",
    author: "Arinola Abolarin",
    date: "February 8, 2026",
    readTime: "5 min read",
    slug: "managing-expiry-dates-fmcg",
  },
  {
    id: "6",
    title: "How OptimalStock Pro Helped a Lagos Retailer Save ₦2M Monthly",
    excerpt: "A real-world case study of how a medium-sized retail business in Lagos transformed their operations with digital inventory management.",
    category: "Case Study",
    author: "Arinola Abolarin",
    date: "February 1, 2026",
    readTime: "8 min read",
    slug: "case-study-lagos-retailer",
  },
];

const categories = ["All", "Industry Insights", "Tips & Guides", "Best Practices", "Case Study"];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4">Blog</Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Insights for Smarter Inventory
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tips, guides, and industry insights to help Nigerian businesses master their inventory management.
            </p>
          </motion.div>
        </section>

        {/* Category Filter */}
        <section className="container mx-auto px-4 mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>
        </section>

        {/* Posts Grid */}
        <section className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow border-border/50">
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-t-lg">
                    <span className="text-5xl">
                      {post.category === "Industry Insights" && "📊"}
                      {post.category === "Tips & Guides" && "💡"}
                      {post.category === "Best Practices" && "✅"}
                      {post.category === "Case Study" && "📈"}
                    </span>
                  </div>
                  <CardContent className="flex-1 flex flex-col p-6">
                    <Badge variant="outline" className="w-fit mb-3 text-xs">
                      {post.category}
                    </Badge>
                    <h2 className="text-lg font-heading font-semibold text-foreground mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/70 mb-3">{post.date}</p>
                    <Button variant="ghost" size="sm" className="w-fit p-0 text-primary hover:text-primary/80">
                      Read more <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No posts in this category yet. Check back soon!</p>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 mt-20">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              Ready to take control of your inventory?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join hundreds of Nigerian businesses already using OptimalStock Pro to reduce losses and grow profits.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/demo">
                <Button size="lg">Try Live Demo</Button>
              </Link>
              <Link to="/survey">
                <Button size="lg" variant="outline">Get Early Access</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
