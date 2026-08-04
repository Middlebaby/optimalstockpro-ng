import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_inventory",
  title: "List inventory items",
  description:
    "List the signed-in user's inventory items, optionally filtered by a name/SKU search term, category or location.",
  inputSchema: {
    search: z.string().optional().describe("Text to match against item name or SKU."),
    category: z.string().optional().describe("Filter by category."),
    location: z.string().optional().describe("Filter by storage location."),
    limit: z.number().int().min(1).max(200).optional().describe("Maximum rows to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, category, location, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("inventory_items")
      .select("id,name,sku,category,quantity,unit,unit_price,reorder_level,location,expiry_date")
      .order("name")
      .limit(limit ?? 50);

    if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    if (category) query = query.eq("category", category);
    if (location) query = query.eq("location", location);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
