import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "low_stock_report",
  title: "Low stock report",
  description:
    "List inventory items whose quantity is at or below their reorder level, so restocking can be planned.",
  inputSchema: {
    limit: z.number().int().min(1).max(200).optional().describe("Maximum rows to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("inventory_items")
      .select("id,name,sku,quantity,unit,reorder_level,location,supplier_id")
      .order("quantity")
      .limit(500);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const low = (data ?? [])
      .filter((item) => item.reorder_level != null && item.quantity <= (item.reorder_level as number))
      .slice(0, limit ?? 50);

    return {
      content: [{ type: "text", text: JSON.stringify(low, null, 2) }],
      structuredContent: { items: low, count: low.length },
    };
  },
});
