import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  cover_emoji: string | null;
  author_name: string | null;
  read_time: string | null;
  published_at: string | null;
  created_at: string;
}

const categories = ["All", "Industry Insights", "Tips & Guides", "Best Practices", "Case Study"];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filtered = activeCategory === "All"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`}>
                    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow border-border/50 cursor-pointer">
                      <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-t-lg">
                        <span className="text-5xl">{post.cover_emoji || "📝"}</span>
                      </div>
                      <CardContent className="flex-1 flex flex-col p-6">
                        <Badge variant="outline" className="w-fit mb-3 text-xs">
                          {post.category}
                        </Badge>
                        <h2 className="text-lg font-heading font-semibold text-foreground mb-2 line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                          {post.excerpt || post.content.substring(0, 150) + "..."}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {post.author_name || "Author"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {post.read_time || "5 min read"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/70 mb-3">
                          {formatDate(post.published_at || post.created_at)}
                        </p>
                        <Button variant="ghost" size="sm" className="w-fit p-0 text-primary hover:text-primary/80">
                          Read more <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
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
