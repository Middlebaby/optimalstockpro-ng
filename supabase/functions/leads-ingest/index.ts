import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.25.76";
import { scoreLead } from "../_shared/lead-scoring.ts";
import { syncLeadToCrm } from "../_shared/crm-sync.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const leadIngestSchema = z.object({
  source: z.string().min(1).max(50),
  source_detail: z.string().max(100).optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  company_name: z.string().max(100).optional(),
  business_type: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  employee_count: z.string().max(50).optional(),
  interest: z.string().max(100).optional(),
  budget_range: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
  ndpr_consent: z.boolean().default(false),
  session_id: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
  raw_data: z.record(z.unknown()).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: unknown = await req.json();
    const parsed = leadIngestSchema.parse(body);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: lead, error: insertError } = await supabase
      .from("leads")
      .insert({
        source: parsed.source,
        source_detail: parsed.source_detail ?? null,
        name: parsed.name ?? null,
        email: parsed.email || null,
        phone: parsed.phone ?? null,
        company_name: parsed.company_name ?? null,
        business_type: parsed.business_type ?? null,
        location: parsed.location ?? null,
        employee_count: parsed.employee_count ?? null,
        interest: parsed.interest ?? null,
        budget_range: parsed.budget_range ?? null,
        message: parsed.message ?? null,
        ndpr_consent: parsed.ndpr_consent,
        session_id: parsed.session_id ?? null,
        metadata: parsed.metadata ?? {},
        raw_data: parsed.raw_data ?? parsed.metadata ?? {},
      })
      .select("*")
      .single();

    if (insertError) throw insertError;
    if (!lead) throw new Error("Lead insert returned no data");

    // Score and summarize the lead asynchronously; failures should not block the response.
    let scoreResult: Awaited<ReturnType<typeof scoreLead>> | null = null;
    let syncError: string | null = null;
    try {
      scoreResult = await scoreLead(lead);
    } catch (err) {
      console.error("Lead scoring failed:", err);
    }

    if (scoreResult) {
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
        syncError = err instanceof Error ? err.message : String(err);
        console.error("CRM sync failed:", syncError);
      }

      await supabase.from("leads").update(update).eq("id", lead.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        score: scoreResult?.score ?? null,
        ai_summary: scoreResult?.aiSummary ?? null,
        recommended_plan: scoreResult?.recommendedPlan ?? null,
        sync_error: syncError,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("leads-ingest error:", error);
    const status = error instanceof z.ZodError ? 400 : 500;
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process lead",
      }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
