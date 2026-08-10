import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user: caller } } = await supabaseClient.auth.getUser(token);
  if (!caller) return json({ error: "Unauthorized" }, 401);

  const { data: roleData } = await supabaseClient
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleData) return json({ error: "Forbidden: Admin only" }, 403);

  if (!PAYSTACK_SECRET_KEY) {
    return json({ ok: false, step: "config", message: "Paystack secret key is not configured." }, 200);
  }

  const url = `${SUPABASE_URL}/functions/v1/paystack-webhook`;
  const payload = {
    event: "webhook.test",
    data: {
      id: Date.now(),
      reference: `test-${crypto.randomUUID()}`,
      amount: 0,
      currency: "NGN",
      customer: { email: caller.email ?? "test@optimalstockpro.ng" },
      metadata: { source: "webhook-status-page-test" },
    },
  };
  const rawBody = JSON.stringify(payload);
  const signature = createHmac("sha512", PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");

  try {
    // 1. Signed request — should be accepted and logged as processed
    const signed = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-paystack-signature": signature },
      body: rawBody,
    });
    const signedBody = await signed.text();

    // 2. Unsigned request — should be rejected with 401
    const unsigned = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-paystack-signature": "invalid" },
      body: rawBody,
    });

    const ok = signed.status === 200 && unsigned.status === 401;
    return json({
      ok,
      reference: payload.data.reference,
      signed_status: signed.status,
      unsigned_status: unsigned.status,
      response: signedBody.slice(0, 300),
      message: ok
        ? "Webhook endpoint accepted a correctly signed event and rejected an unsigned one."
        : "Webhook endpoint did not behave as expected — check the secret key and function logs.",
    });
  } catch (e) {
    return json({ ok: false, message: e instanceof Error ? e.message : "Test request failed" }, 200);
  }
});
