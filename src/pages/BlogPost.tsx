import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User, Calendar, Loader2 } from "lucide-react";
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

// Simple markdown renderer
const renderMarkdown = (text: string) => {
  let html = text
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-heading font-semibold text-foreground mt-6 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-heading font-bold text-foreground mt-8 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-heading font-bold text-foreground mt-8 mb-4">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-muted-foreground">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed mb-4">')
    // Line breaks
    .replace(/\n/g, '<br/>');

  return `<p class="text-muted-foreground leading-relaxed mb-4">${html}</p>`;
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setPost(data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20 container mx-auto px-4 text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog">
            <Button className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Blog</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <article className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>

            <div className="mb-6">
              <Badge variant="outline" className="mb-3">{post.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                {post.author_name && (
                  <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author_name}</span>
                )}
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {publishDate}</span>
                {post.read_time && (
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.read_time}</span>
                )}
              </div>
            </div>

            {/* Cover emoji */}
            <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-xl mb-8">
              <span className="text-7xl">{post.cover_emoji || "📝"}</span>
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            <div className="mt-12 pt-8 border-t border-border text-center">
              <Link to="/blog">
                <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> More Articles</Button>
              </Link>
            </div>
          </motion.div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
