// Shared CRM sync helper. Pushes scored leads to a configured webhook.

export interface CrmSyncResult {
  syncedAt: string;
  crmRecordId?: string;
  crmProvider?: string;
}

export async function syncLeadToCrm(lead: Record<string, unknown>): Promise<CrmSyncResult | null> {
  const CRM_WEBHOOK_URL = Deno.env.get("CRM_WEBHOOK_URL");
  if (!CRM_WEBHOOK_URL) {
    return null;
  }

  const CRM_WEBHOOK_API_KEY = Deno.env.get("CRM_WEBHOOK_API_KEY");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (CRM_WEBHOOK_API_KEY) {
    headers["Authorization"] = `Bearer ${CRM_WEBHOOK_API_KEY}`;
  }

  const payload = {
    id: lead.id,
    created_at: lead.created_at,
    source: lead.source,
    source_detail: lead.source_detail,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company_name: lead.company_name,
    business_type: lead.business_type,
    location: lead.location,
    employee_count: lead.employee_count,
    interest: lead.interest,
    budget_range: lead.budget_range,
    message: lead.message,
    score: lead.score,
    ai_summary: lead.ai_summary,
    tags: lead.tags,
    pain_points: lead.pain_points,
    recommended_plan: lead.recommended_plan,
  };

  const res = await fetch(CRM_WEBHOOK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CRM webhook returned ${res.status}: ${text}`);
  }

  let crmRecordId: string | undefined;
  let crmProvider: string | undefined;
  try {
    const body = await res.json();
    if (typeof body.id === "string") crmRecordId = body.id;
    if (typeof body.record_id === "string") crmRecordId = body.record_id;
    if (typeof body.provider === "string") crmProvider = body.provider;
  } catch {
    // Webhook may return an empty or non-JSON body; ignore.
  }

  return {
    syncedAt: new Date().toISOString(),
    crmRecordId,
    crmProvider,
  };
}
