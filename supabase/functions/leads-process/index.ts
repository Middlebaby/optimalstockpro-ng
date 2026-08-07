import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { scoreLead } from "../_shared/lead-scoring.ts";
import { syncLeadToCrm } from "../_shared/crm-sync.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function isAuthorized(req: Request): Promise<{ authorized: boolean; userId?: string }> {
  const CRON_SECRET = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret") ?? "";
  if (CRON_SECRET && providedSecret && timingSafeEqual(CRON_SECRET, providedSecret)) {
    return { authorized: true };
  }

  // Scheduled runs authenticate with an internal token stored in the database.
  if (providedSecret) {
    try {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      const { data: jobToken } = await admin
        .from("job_tokens")
        .select("token")
        .eq("name", "leads-process")
        .maybeSingle();
      if (jobToken?.token && timingSafeEqual(jobToken.token, providedSecret)) {
        return { authorized: true };
      }
    } catch (err) {
      console.error("Job token check failed:", err);
    }
  }

  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return { authorized: false };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) return { authorized: false };

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["admin", "manager"])
    .maybeSingle();

  if (!role) return { authorized: false };
  return { authorized: true, userId: user.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await isAuthorized(req);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .or("ai_summary.is.null,score.eq.0")
      .is("synced_crm_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    let processed = 0;
    let failed = 0;

    for (const lead of leads ?? []) {
      try {
        const scoreResult = await scoreLead(lead);
        const update: Record<string, unknown> = {
          score: scoreResult.score,
          ai_summary: scoreResult.aiSummary,
          tags: scoreResult.tags,
          pain_points: scoreResult.painPoints,
          recommended_plan: scoreResult.recommendedPlan,
        };

        try {
          const sync = await syncLeadToCrm({ ...lead, ...scoreResult });
          if (sync) {
            update.synced_crm_at = sync.syncedAt;
            update.crm_record_id = sync.crmRecordId ?? null;
            update.crm_provider = sync.crmProvider ?? null;
          }
        } catch (err) {
          console.error("CRM sync failed for lead", lead.id, err);
        }

        const { error: updateError } = await supabase
          .from("leads")
          .update(update)
          .eq("id", lead.id);

        if (updateError) throw updateError;
        processed++;
      } catch (err) {
        console.error("Failed to process lead", lead.id, err);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ processed, failed, total_pending: leads?.length ?? 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("leads-process error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process leads" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
