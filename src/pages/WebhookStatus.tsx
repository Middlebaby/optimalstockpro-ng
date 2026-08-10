import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface WebhookEvent {
  id: string;
  event: string;
  reference: string | null;
  email: string | null;
  signature_valid: boolean;
  handled: boolean;
  error: string | null;
  created_at: string;
}

const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-webhook`;

const WebhookStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; reference?: string } | null>(null);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    const { data, error } = await supabase.functions.invoke("paystack-webhook-test", { body: {} });
    if (error) {
      setTestResult({ ok: false, message: error.message || "Test failed to run." });
    } else {
      setTestResult({ ok: Boolean(data?.ok), message: data?.message ?? "No response", reference: data?.reference });
    }
    setTesting(false);
    await load();
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("paystack_webhook_events")
      .select("id, event, reference, email, signature_valid, handled, error, created_at")
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) {
      setDenied(true);
    } else {
      setDenied(false);
      setEvents((data ?? []) as WebhookEvent[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setDenied(true);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(WEBHOOK_URL);
    toast({ title: "Webhook URL copied", description: "Paste it into your Paystack dashboard." });
  };

  const last = events[0];
  const lastGood = events.find((e) => e.signature_valid && e.handled);
  const configured = Boolean(lastGood);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/billing" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to billing
        </Link>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Paystack webhook status
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Confirms whether Paystack is successfully notifying Optimalstock Pro about payments,
              renewals and failures.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={runTest} disabled={testing || denied}>
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              Run test
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading || denied}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {testResult && (
          <div
            className={`rounded-xl border p-4 mb-6 flex gap-3 ${
              testResult.ok ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/5"
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm">
                {testResult.ok ? "Test passed" : "Test failed"}
              </p>
              <p className="text-sm text-muted-foreground">{testResult.message}</p>
              {testResult.reference && (
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  Reference: {testResult.reference}
                </p>
              )}
            </div>
          </div>
        )}




        {/* Status card */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : denied ? (
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Admin access required</p>
                <p className="text-sm text-muted-foreground">
                  Sign in with an admin account to view webhook delivery history.
                </p>
              </div>
            </div>
          ) : configured ? (
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Webhook is receiving events</p>
                <p className="text-sm text-muted-foreground">
                  Last successful event{" "}
                  <span className="font-medium text-foreground">{lastGood!.event}</span> on{" "}
                  {new Date(lastGood!.created_at).toLocaleString()}.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">No webhook events received yet</p>
                <p className="text-sm text-muted-foreground">
                  {last
                    ? `The last attempt (${last.event}) was rejected — check that the secret key here matches the one in Paystack.`
                    : "Register the URL below in your Paystack dashboard, then make a test payment."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Setup instructions */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h2 className="font-heading font-semibold text-foreground mb-3">
            How to register the webhook URL
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <code className="flex-1 text-xs bg-muted rounded-md px-3 py-2 break-all text-foreground">
              {WEBHOOK_URL}
            </code>
            <Button variant="outline" size="sm" onClick={copyUrl}>
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
            <li>
              Log in at <span className="text-foreground">dashboard.paystack.com</span>.
            </li>
            <li>
              Open <span className="text-foreground">Settings → API Keys &amp; Webhooks</span>.
            </li>
            <li>
              Paste the URL above into <span className="text-foreground">Test Webhook URL</span> (and
              into <span className="text-foreground">Live Webhook URL</span> once you go live), then
              save.
            </li>
            <li>
              Make a test payment from <Link to="/checkout" className="text-primary underline">checkout</Link>{" "}
              and refresh this page — the event should appear below within seconds.
            </li>
          </ol>
          <p className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Every request is verified against your Paystack secret key before it is processed.
          </p>
        </div>

        {/* Event log */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading font-semibold text-foreground mb-4">Recent events</h2>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing logged yet. Events appear here as soon as Paystack calls the URL above.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {events.map((e) => (
                <div key={e.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{e.event}</span>
                      {!e.signature_valid && <Badge variant="destructive">Bad signature</Badge>}
                      {e.signature_valid && !e.handled && <Badge variant="secondary">Failed</Badge>}
                      {e.signature_valid && e.handled && <Badge>Processed</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {[e.email, e.reference, e.error].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(e.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {authLoading && (
          <div className="flex justify-center mt-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </main>
    </div>
  );
};

export default WebhookStatus;
