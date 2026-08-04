import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "expiring_items",
  title: "Expiring items",
  description:
    "List perishable inventory items expiring within a number of days (including already-expired items).",
  inputSchema: {
    days: z.number().int().min(0).max(365).optional().describe("Days ahead to look (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const horizonDays = days ?? 30;
    const cutoff = new Date(Date.now() + horizonDays * 86400000).toISOString().slice(0, 10);

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("inventory_items")
      .select("id,name,sku,quantity,unit,location,expiry_date")
      .not("expiry_date", "is", null)
      .lte("expiry_date", cutoff)
      .order("expiry_date")
      .limit(200);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { items: data ?? [], cutoff, days: horizonDays },
    };
  },
});
