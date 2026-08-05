// Shared lead scoring helper using the Lovable AI Gateway Responses API.

export interface LeadScoreResult {
  score: number;
  aiSummary: string;
  tags: string[];
  painPoints: string[];
  recommendedPlan: string;
  reason: string;
}

const leadScoreSchema = {
  type: "object" as const,
  properties: {
    score: { type: "integer" as const, description: "Lead fit score from 0 to 100" },
    aiSummary: { type: "string" as const, description: "1-2 sentence summary of the lead" },
    tags: { type: "array" as const, items: { type: "string" as const } },
    painPoints: { type: "array" as const, items: { type: "string" as const } },
    recommendedPlan: { type: "string" as const, enum: ["Basic", "Distribution", "Professional", "Unknown"] },
    reason: { type: "string" as const, description: "Brief reason for the score and recommendation" },
  },
  required: ["score", "aiSummary", "tags", "painPoints", "recommendedPlan", "reason"],
  additionalProperties: false,
};

export async function scoreLead(lead: Record<string, unknown>): Promise<LeadScoreResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const prompt = `Score this sales lead for OptimalStock Pro, an inventory management SaaS for Nigerian SMEs (especially shops, distributors, manufacturers, and construction businesses).

Return JSON with score (0-100), aiSummary (1-2 sentences), tags (up to 5 strings), painPoints (up to 3 strings), recommendedPlan (Basic, Distribution, Professional, or Unknown), and reason.

Score higher when the lead clearly mentions inventory pain, perishable goods, multiple locations, a sizeable team, budget, or urgency to act. Score lower for vague, incomplete, or clearly irrelevant submissions.

Lead data:
${JSON.stringify(lead, null, 2)}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": LOVABLE_API_KEY,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.6-sol",
      input: [
        { role: "system", content: "You are a lead scoring assistant for OptimalStock Pro." },
        { role: "user", content: prompt },
      ],
      stream: true,
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "lead_score",
          schema: leadScoreSchema,
          strict: true,
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body from AI gateway");

  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const event = JSON.parse(data);
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          fullText += event.delta;
        } else if (event.response?.output_text?.delta) {
          fullText += event.response.output_text.delta;
        } else if (event.type === "response.completed" && event.response?.output_text) {
          fullText += event.response.output_text;
        }
      } catch {
        // Ignore malformed SSE events.
      }
    }
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(fullText);
  } catch {
    return {
      score: 0,
      aiSummary: fullText || "Could not generate summary",
      tags: [],
      painPoints: [],
      recommendedPlan: "Unknown",
      reason: "AI response was not valid JSON",
    };
  }

  return {
    score: typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : 0,
    aiSummary: typeof parsed.aiSummary === "string" ? parsed.aiSummary : "",
    tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t): t is string => typeof t === "string") : [],
    painPoints: Array.isArray(parsed.painPoints) ? parsed.painPoints.filter((p): p is string => typeof p === "string") : [],
    recommendedPlan: ["Basic", "Distribution", "Professional", "Unknown"].includes(String(parsed.recommendedPlan))
      ? String(parsed.recommendedPlan)
      : "Unknown",
    reason: typeof parsed.reason === "string" ? parsed.reason : "",
  };
}
