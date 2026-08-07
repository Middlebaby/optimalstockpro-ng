import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = () =>
  createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    if (action === "initialize") {
      // Initialize a transaction (subscription or one-time)
      const { email, plan_code, callback_url, metadata } = params;

      if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new Response(JSON.stringify({ error: "A valid email is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Plan mapping safeguard: the plan must be a known id and the amount is
      // always taken from the server-side price map, never from the client.
      const requestedPlan = metadata?.plan;
      if (!isPlanId(requestedPlan)) {
        return new Response(
          JSON.stringify({ error: "Unknown plan. Choose Basic, Distribution or Professional." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const plan = requestedPlan;
      const amount = PLAN_PRICES[plan];

      // If the client sent an amount that disagrees, log it and use ours.
      if (typeof params.amount === "number" && Math.round(params.amount) !== amount) {
        console.warn(
          `Plan/amount mismatch for ${plan}: client sent ${params.amount}, charging ${amount}`
        );
      }

      const body: Record<string, any> = {
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        callback_url,
        metadata: {
          ...metadata,
          plan,
          custom_fields: [
            {
              display_name: "Plan",
              variable_name: "plan",
              value: plan,
            },
          ],
        },
      };

      // If plan_code is provided, use subscription
      if (plan_code) {
        body.plan = plan_code;
      }

      const response = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!data.status) {
        return new Response(JSON.stringify({ error: data.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Record a pending subscription so we can reconcile the payment later.
      const { error: recordError } = await admin()
        .from("subscriptions")
        .upsert(
          {
            email,
            plan,
            status: "pending",
            amount,
            currency: "NGN",
            paystack_reference: data.data?.reference ?? null,
            metadata: metadata ?? {},
          },
          { onConflict: "paystack_reference" }
        );
      if (recordError) console.error("Failed to record pending subscription:", recordError);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      const { reference } = params;

      if (!reference || typeof reference !== "string" || reference.length > 200) {
        return new Response(JSON.stringify({ error: "A valid reference is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const data = await response.json();

      if (data.status && data.data.status === "success") {
        const plan =
          data.data.metadata?.plan ||
          data.data.metadata?.custom_fields?.find(
            (f: any) => f.variable_name === "plan"
          )?.value ||
          "basic";

        // Resolve the signed-in user, if any.
        let userId: string | null = null;
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
          const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: authHeader } },
          });

          const { data: claims, error: claimsError } = await supabase.auth.getUser();
          if (!claimsError && claims.user) {
            userId = claims.user.id;
            await supabase
              .from("profiles")
              .update({ plan })
              .eq("user_id", claims.user.id);
          }
        }

        const paidAt = data.data.paid_at ? new Date(data.data.paid_at) : new Date();
        const periodEnd = new Date(paidAt);
        periodEnd.setDate(periodEnd.getDate() + 30);

        const { error: subError } = await admin()
          .from("subscriptions")
          .upsert(
            {
              user_id: userId,
              email: data.data.customer?.email ?? "",
              plan,
              status: "active",
              amount: (data.data.amount ?? 0) / 100,
              currency: data.data.currency ?? "NGN",
              paystack_reference: data.data.reference,
              paystack_customer_code: data.data.customer?.customer_code ?? null,
              current_period_end: periodEnd.toISOString(),
              metadata: data.data.metadata ?? {},
            },
            { onConflict: "paystack_reference" }
          );
        if (subError) console.error("Failed to record subscription:", subError);
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "plans") {
      // List available plans from Paystack
      const response = await fetch("https://api.paystack.co/plan", {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("paystack error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
