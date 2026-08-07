import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCard, Loader2, ArrowUpRight, CheckCircle2, AlertTriangle,
  Clock, XCircle, ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { PLANS, PlanId, formatNaira, getPlan, planRank, isPlanId } from "@/lib/plans";

interface SubscriptionRow {
  id: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  paystack_reference: string | null;
  current_period_end: string | null;
  created_at: string;
}

const statusStyles: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  active: { label: "Active", icon: CheckCircle2, className: "bg-primary/10 text-primary border-primary/30" },
  pending: { label: "Pending", icon: Clock, className: "bg-muted text-muted-foreground border-border" },
  past_due: { label: "Payment failed", icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/30" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-muted text-muted-foreground border-border" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = statusStyles[status] ?? statusStyles.pending;
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={`gap-1 ${s.className}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </Badge>
  );
};

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

const Billing = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profilePlan, setProfilePlan] = useState<string | null>(null);
  const [rows, setRows] = useState<SubscriptionRow[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?mode=signin");
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [{ data: profile }, { data: subs }] = await Promise.all([
        supabase.from("profiles").select("plan").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("subscriptions")
          .select("id, plan, status, amount, currency, paystack_reference, current_period_end, created_at")
          .order("created_at", { ascending: false })
          .limit(25),
      ]);
      if (cancelled) return;
      setProfilePlan(profile?.plan ?? null);
      setRows((subs ?? []) as SubscriptionRow[]);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  const latest = rows[0];
  // Plan mapping safeguard: fall back to the plan card only when the id is known.
  const currentPlanId: PlanId | null = isPlanId(profilePlan)
    ? profilePlan
    : isPlanId(latest?.plan)
      ? (latest!.plan as PlanId)
      : null;
  const currentPlan = currentPlanId ? getPlan(currentPlanId) : null;
  const activeSub = rows.find((r) => r.status === "active");
  const failedSub = rows.find((r) => r.status === "past_due");

  const upgrades = PLANS.filter((p) => planRank(p.id) > planRank(currentPlanId));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
              Billing & subscription
            </h1>
            <p className="text-muted-foreground">
              Manage your Optimalstock Pro plan, payment history and renewals.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </div>
          ) : (
            <>
              {failedSub && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-xl border border-destructive/40 bg-destructive/5 p-5"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h2 className="font-heading font-semibold text-foreground mb-1">
                        Your last payment did not go through
                      </h2>
                      <p className="text-sm text-muted-foreground mb-3">
                        We could not charge {formatNaira(Number(failedSub.amount))} for the{" "}
                        {getPlan(failedSub.plan).name} plan. Your access continues until{" "}
                        {formatDate(failedSub.current_period_end)} — retry to avoid interruption.
                      </p>
                      <Button size="sm" onClick={() => navigate(`/checkout?plan=${failedSub.plan}`)}>
                        Retry payment
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Current plan */}
              <div className="rounded-xl border border-border bg-card p-6 mb-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current plan</p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-heading font-bold text-foreground">
                        {currentPlan ? currentPlan.name : "No active plan"}
                      </h2>
                      {latest && <StatusBadge status={activeSub ? "active" : latest.status} />}
                    </div>
                    {currentPlan && (
                      <p className="text-sm text-muted-foreground mt-1">{currentPlan.tagline}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {currentPlan ? formatNaira(currentPlan.price) : formatNaira(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Renews on</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(activeSub?.current_period_end ?? latest?.current_period_end ?? null)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Billing email</p>
                    <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                {!currentPlan && (
                  <div className="mt-5">
                    <Button onClick={() => navigate("/checkout")}>
                      <CreditCard className="w-4 h-4" />
                      Choose a plan
                    </Button>
                  </div>
                )}
              </div>

              {/* Upgrades */}
              {upgrades.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6 mb-6">
                  <h3 className="font-heading font-semibold text-foreground mb-4">
                    {currentPlan ? "Upgrade your plan" : "Available plans"}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {upgrades.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border p-4"
                      >
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNaira(p.price)}/mo
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/checkout?plan=${p.id}`)}>
                          Upgrade
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-primary" />
                  Payment history
                </h3>
                {rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No payments yet.{" "}
                    <Link to="/checkout" className="text-primary underline">
                      Pick a plan
                    </Link>{" "}
                    to get started.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="py-2 pr-4 font-medium">Date</th>
                          <th className="py-2 pr-4 font-medium">Plan</th>
                          <th className="py-2 pr-4 font-medium">Amount</th>
                          <th className="py-2 pr-4 font-medium">Status</th>
                          <th className="py-2 font-medium">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.id} className="border-b border-border/60 last:border-0">
                            <td className="py-3 pr-4 text-foreground">{formatDate(r.created_at)}</td>
                            <td className="py-3 pr-4 text-foreground">{getPlan(r.plan).name}</td>
                            <td className="py-3 pr-4 text-foreground">
                              {formatNaira(Number(r.amount ?? 0))}
                            </td>
                            <td className="py-3 pr-4">
                              <StatusBadge status={r.status} />
                            </td>
                            <td className="py-3 text-xs text-muted-foreground font-mono truncate max-w-[10rem]">
                              {r.paystack_reference ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  Need an invoice or want to cancel? Email{" "}
                  <a href="mailto:support@optimalstockpro.com" className="text-primary underline">
                    support@optimalstockpro.com
                  </a>
                  .
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Billing;
