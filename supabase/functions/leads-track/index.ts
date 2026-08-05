import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const activitySchema = z.object({
  session_id: z.string().min(1).max(100),
  lead_id: z.string().uuid().optional().or(z.literal("")),
  event_type: z.string().min(1).max(50),
  event_data: z.record(z.unknown()).optional(),
  url: z.string().max(1000).optional(),
  referrer: z.string().max(1000).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: unknown = await req.json();
    const parsed = activitySchema.parse(body);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const leadId = parsed.lead_id || null;

    const { error } = await supabase.from("lead_activities").insert({
      session_id: parsed.session_id,
      lead_id: leadId,
      event_type: parsed.event_type,
      event_data: parsed.event_data ?? {},
      url: parsed.url ?? null,
      referrer: parsed.referrer ?? null,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("leads-track error:", error);
    const status = error instanceof z.ZodError ? 400 : 500;
    return new Response(
      JSON.stringify({ error: error.message || "Failed to track activity" }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
