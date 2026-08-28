import { useCallback, useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle, XCircle, Loader2, BarChart3, RefreshCw, CreditCard, LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { getPlan, isPlanId, formatNaira } from "@/lib/plans";

/** Turn Paystack gateway responses into something a shop owner understands. */
const explainFailure = (raw?: string | null) => {
  const g = (raw ?? "").toLowerCase();
  if (g.includes("insufficient")) {
    return {
      title: "Insufficient funds",
      help: "Your card or account didn't have enough balance. Top up or try bank transfer / USSD instead.",
    };
  }
  if (g.includes("declined") || g.includes("do not honor") || g.includes("do not honour")) {
    return {
      title: "Card declined by your bank",
      help: "Nigerian banks often block online payments by default. Call your bank to enable online transactions, or pay with transfer / USSD.",
    };
  }
  if (g.includes("expired")) {
    return { title: "Card expired", help: "Use a different card or pay via bank transfer." };
  }
  if (g.includes("abandon") || g.includes("cancel")) {
    return { title: "Payment not completed", help: "You closed the payment window before it finished. Nothing was charged." };
  }
  if (g.includes("timeout") || g.includes("timed out")) {
    return { title: "Payment timed out", help: "The bank took too long to respond. No money was taken — please try again." };
  }
  return {
    title: "Payment failed",
    help: raw || "We couldn't confirm this payment. If you were debited, it will be reversed automatically within 24 hours.",
  };
};

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [failure, setFailure] = useState<{ title: string; help: string }>({ title: "", help: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [planLabel, setPlanLabel] = useState<string | null>(null);
  const [retryPlan, setRetryPlan] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const verify = useCallback(async () => {
    if (!reference) {
      setStatus("failed");
      setFailure({
        title: "No payment reference",
        help: "We didn't get a reference from Paystack, so there's nothing to verify. Start the checkout again.",
      });
      return;
    }

    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("paystack", {
        body: { action: "verify", reference },
      });

      if (error) throw error;

      const d = data?.data;
      // Plan mapping safeguard: only show a plan name we actually recognise.
      const rawPlan =
        d?.metadata?.plan ??
        d?.metadata?.custom_fields?.find((f: { variable_name?: string }) => f.variable_name === "plan")?.value;
      if (isPlanId(rawPlan)) {
        setRetryPlan(rawPlan);
        setPlanLabel(getPlan(rawPlan).name);
      }

      if (data?.status && d?.status === "success") {
        setStatus("success");
        const amount = typeof d.amount === "number" ? formatNaira(d.amount / 100) : null;
        setSuccessMessage(
          isPlanId(rawPlan)
            ? `Your ${getPlan(rawPlan).name} plan is active${amount ? ` — ${amount} paid` : ""}.`
            : "Payment successful! Your subscription is now active."
        );
      } else {
        setStatus("failed");
        setFailure(explainFailure(d?.gateway_response ?? data?.error));
      }
    } catch {
      setStatus("failed");
      setFailure({
        title: "We couldn't reach the payment service",
        help: "Check your internet connection and try again. If you were debited, contact support with your reference below.",
      });
    }
  }, [reference]);

  useEffect(() => {
    verify();
  }, [verify, attempt]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Verifying Payment...
                </h1>
                <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Payment Successful!
                </h1>
                <p className="text-muted-foreground mb-8">{successMessage}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto">
                      <BarChart3 className="w-5 h-5" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to="/billing">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <CreditCard className="w-5 h-5" />
                      View billing
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-6">
                  <XCircle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  {failure.title}
                </h1>
                <p className="text-muted-foreground mb-2">{failure.help}</p>
                {planLabel && (
                  <p className="text-sm text-muted-foreground mb-6">
                    Plan attempted: <span className="font-medium text-foreground">{planLabel}</span>
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <Button size="lg" onClick={() => setAttempt((a) => a + 1)} variant="outline">
                    <RefreshCw className="w-4 h-4" />
                    Check again
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => navigate(retryPlan ? `/checkout?plan=${retryPlan}` : "/checkout")}
                  >
                    <CreditCard className="w-4 h-4" />
                    Try payment again
                  </Button>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 text-left">
                  <p className="text-xs text-muted-foreground mb-1">Payment reference</p>
                  <p className="text-sm font-mono text-foreground break-all mb-3">
                    {reference ?? "none"}
                  </p>
                  <a
                    href={`mailto:info@optimalstockpro.com?subject=Payment%20issue%20${encodeURIComponent(reference ?? "")}`}
                    className="inline-flex items-center gap-2 text-sm text-primary underline"
                  >
                    <LifeBuoy className="w-4 h-4" />
                    Contact support with this reference
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentVerify;
