import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("paystack", {
          body: { action: "verify", reference },
        });

        if (error) throw error;

        if (data?.status && data?.data?.status === "success") {
          setStatus("success");
          setMessage("Payment successful! Your subscription is now active.");
        } else {
          setStatus("failed");
          setMessage(data?.data?.gateway_response || "Payment could not be verified.");
        }
      } catch {
        setStatus("failed");
        setMessage("Unable to verify payment. Please contact support.");
      }
    };

    verify();
  }, [reference]);

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
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Payment Successful!
                </h1>
                <p className="text-muted-foreground mb-8">{message}</p>
                <Link to="/dashboard">
                  <Button size="lg">
                    <BarChart3 className="w-5 h-5" />
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-6">
                  <XCircle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Payment Failed
                </h1>
                <p className="text-muted-foreground mb-8">{message}</p>
                <Link to="/get-started">
                  <Button size="lg" variant="outline">
                    Try Again
                  </Button>
                </Link>
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
