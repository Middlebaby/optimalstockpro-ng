import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";
import { normalizePlan } from "../_shared/plans.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = () =>
  createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

function addDays(from: Date, days: number) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");

  const logEvent = async (row: Record<string, unknown>) => {
    try {
      await admin().from("paystack_webhook_events").insert(row);
    } catch (e) {
      console.error("Failed to log webhook event:", e);
    }
  };

  if (signature.length !== expected.length || signature !== expected) {
    console.error("Invalid Paystack webhook signature");
    await logEvent({
      event: "invalid_signature",
      signature_valid: false,
      handled: false,
      error: "Signature did not match the Paystack secret key",
      payload: {},
    });
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    await logEvent({ event: "invalid_json", handled: false, error: "Body was not valid JSON" });
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const event: string = payload?.event ?? "";
  const d = payload?.data ?? {};
  const supabase = admin();


  try {
    const email: string | null =
      d.customer?.email ?? d.subscription?.customer?.email ?? null;
    const rawPlan =
      d.metadata?.plan ??
      d.metadata?.custom_fields?.find((f: any) => f.variable_name === "plan")?.value ??
      d.plan?.name ??
      null;
    const plan = rawPlan === null ? null : normalizePlan(rawPlan);

    const applyToProfile = async (nextPlan: string | null) => {
      if (!email || !nextPlan) return;
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("email", email)
        .not("user_id", "is", null)
        .limit(1)
        .maybeSingle();
      if (sub?.user_id) {
        await supabase.from("profiles").update({ plan: nextPlan }).eq("user_id", sub.user_id);
      }
    };

    if (event === "charge.success" || event === "invoice.payment_succeeded") {
      const paidAt = d.paid_at ? new Date(d.paid_at) : new Date();
      const nextEnd = d.subscription?.next_payment_date
        ? new Date(d.subscription.next_payment_date)
        : addDays(paidAt, 30);

      await supabase.from("subscriptions").upsert(
        {
          email: email ?? "",
          plan: plan ?? "basic",
          status: "active",
          amount: (d.amount ?? 0) / 100,
          currency: d.currency ?? "NGN",
          paystack_reference: d.reference ?? `${event}-${d.id ?? crypto.randomUUID()}`,
          paystack_customer_code: d.customer?.customer_code ?? null,
          paystack_subscription_code: d.subscription?.subscription_code ?? null,
          current_period_end: nextEnd.toISOString(),
          metadata: d.metadata ?? {},
        },
        { onConflict: "paystack_reference" }
      );
      await applyToProfile(plan ?? "basic");
    } else if (event === "subscription.create" || event === "subscription.enable") {
      if (email) {
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            paystack_subscription_code: d.subscription_code ?? null,
            current_period_end: d.next_payment_date ?? null,
          })
          .eq("email", email);
      }
    } else if (
      event === "subscription.disable" ||
      event === "subscription.not_renew" ||
      event === "invoice.payment_failed" ||
      event === "charge.failed"
    ) {
      const status = event === "subscription.disable" ? "cancelled" : "past_due";
      if (email) {
        await supabase.from("subscriptions").update({ status }).eq("email", email);
      }
    } else {
      console.log("Unhandled Paystack event:", event);
    }

    await logEvent({
      event,
      reference: d.reference ?? null,
      email: d.customer?.email ?? null,
      signature_valid: true,
      handled: true,
      payload,
    });
  } catch (error) {
    console.error("paystack-webhook processing error:", error);
    await logEvent({
      event: event || "unknown",
      reference: d.reference ?? null,
      email: d.customer?.email ?? null,
      signature_valid: true,
      handled: false,
      error: error instanceof Error ? error.message : "Processing failed",
      payload,
    });
    return new Response(JSON.stringify({ error: "Processing failed" }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
