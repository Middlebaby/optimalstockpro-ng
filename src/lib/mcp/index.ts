import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listInventoryTool from "./tools/list-inventory";
import lowStockReportTool from "./tools/low-stock-report";
import expiringItemsTool from "./tools/expiring-items";
import recordStockMovementTool from "./tools/record-stock-movement";
import listSuppliersTool from "./tools/list-suppliers";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "optimal-stock-pro",
  title: "Optimal Stock Pro",
  version: "0.1.0",
  instructions:
    "Inventory tools for Optimal Stock Pro. Use `list_inventory` to find items, `low_stock_report` for restocking, `expiring_items` for perishables nearing expiry, `list_suppliers` for supplier contacts, and `record_stock_movement` to log incoming or outgoing stock (this updates item quantities).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listInventoryTool,
    lowStockReportTool,
    expiringItemsTool,
    recordStockMovementTool,
    listSuppliersTool,
  ],
});
