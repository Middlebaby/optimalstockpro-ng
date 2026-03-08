import { useState, useEffect } from "react";
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InventoryFlowDiagram from "./InventoryFlowDiagram";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfMonth } from "date-fns";

const DashboardView = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    stockValue: 0,
    stockIn: 0,
    stockOut: 0,
    lowStockCount: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      setLoading(true);
      const monthStart = startOfMonth(new Date()).toISOString();

      // Fetch all in parallel
      const [itemsRes, incomingRes, outgoingRes, movementsRes] = await Promise.all([
        supabase
          .from("inventory_items")
          .select("id, name, quantity, unit_price, reorder_level, unit")
          .eq("user_id", user.id),
        supabase
          .from("stock_movements")
          .select("quantity, inventory_items(unit_price)")
          .eq("user_id", user.id)
          .eq("movement_type", "incoming")
          .gte("created_at", monthStart),
        supabase
          .from("stock_movements")
          .select("quantity, inventory_items(unit_price)")
          .eq("user_id", user.id)
          .in("movement_type", ["sale", "production", "transfer", "waste", "outgoing"])
          .gte("created_at", monthStart),
        supabase
          .from("stock_movements")
          .select("*, inventory_items(name, unit)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const items = itemsRes.data || [];
      const incoming = incomingRes.data || [];
      const outgoing = outgoingRes.data || [];

      // Calculate stats
      const stockValue = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0), 0);
      const stockIn = incoming.reduce((sum, m) => sum + (m.quantity || 0) * (m.inventory_items?.unit_price || 0), 0);
      const stockOut = outgoing.reduce((sum, m) => sum + (m.quantity || 0) * (m.inventory_items?.unit_price || 0), 0);
      const lowStockItems = items.filter((i) => i.quantity <= (i.reorder_level || 10));

      setStats({ stockValue, stockIn, stockOut, lowStockCount: lowStockItems.length });
      setStockAlerts(lowStockItems.slice(0, 5));
      setRecentActivity(movementsRes.data || []);
      setLoading(false);
    };

    fetchDashboard();
  }, [user]);

  const statCards = [
    { label: "Stock Value", value: `₦${stats.stockValue.toLocaleString()}`, icon: Package, color: "bg-primary", subtitle: "In warehouse" },
    { label: "Stock In", value: `₦${stats.stockIn.toLocaleString()}`, icon: DollarSign, color: "bg-primary", subtitle: "This month" },
    { label: "Stock Out", value: `₦${stats.stockOut.toLocaleString()}`, icon: TrendingUp, color: "bg-accent", subtitle: "This month" },
    { label: "Low Stock", value: String(stats.lowStockCount), icon: AlertTriangle, color: "bg-destructive", subtitle: "Items" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Business Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-xl p-6 text-primary-foreground`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-80">{stat.label}</span>
              <stat.icon className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-3xl font-heading font-bold">{stat.value}</p>
            <p className="text-xs opacity-70 mt-1">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Inventory Flow Diagram */}
      <InventoryFlowDiagram />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Alerts */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h2 className="text-lg font-heading font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            Stock Alerts
          </h2>
          {stockAlerts.length > 0 ? (
            <div className="space-y-3">
              {stockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">{alert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.quantity} left (reorder at {alert.reorder_level || 10})
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Reorder</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No stock alerts — you're all good! ✅</p>
          )}
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-card-foreground">Activity Log</h2>
          </div>
          {recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Item</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => {
                    const isIncoming = activity.movement_type === "incoming";
                    return (
                      <tr key={activity.id} className="border-b border-border/50">
                        <td className="py-3 px-2 text-sm text-card-foreground">
                          {format(new Date(activity.created_at), "MMM d")}
                        </td>
                        <td className="py-3 px-2 text-sm text-card-foreground">
                          {activity.inventory_items?.name || "—"}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isIncoming ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                          }`}>
                            {isIncoming ? "Incoming" : "Outgoing"}
                          </span>
                        </td>
                        <td className={`py-3 px-2 text-sm font-medium ${
                          isIncoming ? "text-primary" : "text-destructive"
                        }`}>
                          {isIncoming ? "+" : "-"}{activity.quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No activity yet. Start by adding items to your inventory!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
