import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    if (action === "initialize") {
      // Initialize a transaction (subscription or one-time)
      const { email, amount, plan_code, callback_url, metadata } = params;

      const body: Record<string, any> = {
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        callback_url,
        metadata: {
          ...metadata,
          custom_fields: [
            {
              display_name: "Plan",
              variable_name: "plan",
              value: metadata?.plan || "starter",
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

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      const { reference } = params;

      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const data = await response.json();

      if (data.status && data.data.status === "success") {
        // Update user profile with plan if authenticated
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
          const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: authHeader } },
          });

          const { data: claims, error: claimsError } =
            await supabase.auth.getUser();
          if (!claimsError && claims.user) {
            const plan =
              data.data.metadata?.plan ||
              data.data.metadata?.custom_fields?.find(
                (f: any) => f.variable_name === "plan"
              )?.value ||
              "starter";

            await supabase
              .from("profiles")
              .update({ plan })
              .eq("user_id", claims.user.id);
          }
        }
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
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
