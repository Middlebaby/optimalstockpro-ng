import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { PLANS, PlanId, formatNaira, getPlan } from "@/lib/plans";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState<PlanId>(
    (getPlan(searchParams.get("plan")).id as PlanId)
  );
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const plan = PLANS.find((p) => p.id === selected)!;

  const handlePay = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Enter a valid email", description: "We need your email to send the receipt.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("paystack", {
        body: {
          action: "initialize",
          email,
          amount: plan.price,
          callback_url: `${window.location.origin}/payment/verify`,
          metadata: { plan: plan.id, plan_name: plan.name },
        },
      });

      if (error) throw error;
      const url = data?.data?.authorization_url;
      if (!url) throw new Error(data?.error || "Could not start payment");
      window.location.href = url;
    } catch (err) {
      toast({
        title: "Payment could not start",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
              Choose your plan
            </h1>
            <p className="text-muted-foreground">
              Monthly billing in Naira. Cancel anytime — no hidden fees.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {PLANS.map((p, i) => {
              const active = p.id === selected;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className={`text-left rounded-xl border p-6 transition-all ${
                    active
                      ? "border-primary ring-2 ring-primary/30 bg-card shadow-lg"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-heading font-semibold text-foreground">{p.name}</h2>
                    {p.popular && <Badge>Most popular</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{p.tagline}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">{formatNaira(p.price)}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                  <ul className="space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>

          <div className="max-w-md mx-auto mt-12 rounded-xl border border-border bg-card p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Payment summary</h3>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">{plan.name} plan</span>
              <span className="font-medium text-foreground">{formatNaira(plan.price)}/mo</span>
            </div>
            <div className="border-t border-border my-4" />

            <div className="space-y-2 mb-4">
              <Label htmlFor="checkout-email">Email for receipt</Label>
              <Input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                disabled={!!user?.email}
              />
            </div>

            <Button className="w-full" size="lg" onClick={handlePay} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting payment...
                </>
              ) : (
                <>
                  Pay {formatNaira(plan.price)}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Secured by Paystack. Cards, transfer & USSD supported.
            </p>

            {!user && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                Already paid?{" "}
                <Link to="/auth" className="text-primary underline">
                  Sign in
                </Link>{" "}
                to access your dashboard.
              </p>
            )}
            <button
              type="button"
              onClick={() => navigate("/demo")}
              className="w-full text-xs text-muted-foreground mt-3 underline"
            >
              Not ready? Try the live demo
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
