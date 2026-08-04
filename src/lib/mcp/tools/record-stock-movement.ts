import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "record_stock_movement",
  title: "Record stock movement",
  description:
    "Record an incoming or outgoing stock movement for an inventory item and update its quantity accordingly.",
  inputSchema: {
    inventory_item_id: z.string().uuid().describe("ID of the inventory item (from list_inventory)."),
    movement_type: z.enum(["incoming", "outgoing"]).describe("Direction of the movement."),
    quantity: z.number().positive().describe("Quantity moved (positive number)."),
    notes: z.string().optional().describe("Optional note about this movement."),
    from_location: z.string().optional(),
    to_location: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const userId = ctx.getUserId();
    const supabase = supabaseForUser(ctx);

    const { data: item, error: itemError } = await supabase
      .from("inventory_items")
      .select("id,name,quantity")
      .eq("id", input.inventory_item_id)
      .maybeSingle();
    if (itemError) return { content: [{ type: "text", text: itemError.message }], isError: true };
    if (!item) return { content: [{ type: "text", text: "Inventory item not found." }], isError: true };

    const delta = input.movement_type === "incoming" ? input.quantity : -input.quantity;
    const newQuantity = Math.max(0, Number(item.quantity) + delta);

    const { error: moveError } = await supabase.from("stock_movements").insert({
      inventory_item_id: input.inventory_item_id,
      movement_type: input.movement_type,
      quantity: input.quantity,
      notes: input.notes ?? null,
      from_location: input.from_location ?? null,
      to_location: input.to_location ?? null,
      user_id: userId,
      created_by: userId,
    });
    if (moveError) return { content: [{ type: "text", text: moveError.message }], isError: true };

    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({ quantity: newQuantity })
      .eq("id", input.inventory_item_id);
    if (updateError) return { content: [{ type: "text", text: updateError.message }], isError: true };

    const summary = `${input.movement_type} ${input.quantity} of "${item.name}". Stock ${item.quantity} → ${newQuantity}.`;
    return {
      content: [{ type: "text", text: summary }],
      structuredContent: {
        item_id: item.id,
        name: item.name,
        previous_quantity: item.quantity,
        new_quantity: newQuantity,
      },
    };
  },
});
