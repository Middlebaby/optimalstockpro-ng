import { Package, DollarSign, AlertTriangle, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DashboardView = () => {
  const stats = [
    { label: "Total Items", value: "24", icon: Package, color: "bg-primary" },
    { label: "Total Value", value: "₦1,250,000", icon: DollarSign, color: "bg-primary-glow" },
    { label: "Low Stock Items", value: "3", icon: AlertTriangle, color: "bg-accent" },
    { label: "Out of Stock", value: "1", icon: XCircle, color: "bg-destructive" },
  ];

  const recentActivity = [
    { date: "2026-01-02", item: "Premium Cement", type: "Outgoing", quantity: -50, staff: "Chidi O.", signoff: true },
    { date: "2026-01-02", item: "Steel Rods", type: "Incoming", quantity: 100, staff: "Amina I.", signoff: true },
    { date: "2026-01-01", item: "Paint - White", type: "Outgoing", quantity: -20, staff: "Tunde A.", signoff: true },
    { date: "2026-01-01", item: "Nails (Box)", type: "Incoming", quantity: 500, staff: "Chidi O.", signoff: false },
  ];

  const stockAlerts = [
    { item: "Plywood Sheets", current: 5, reorder: 10 },
    { item: "PVC Pipes", current: 8, reorder: 15 },
    { item: "Electrical Wire", current: 2, reorder: 10 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Business Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} rounded-xl p-6 text-primary-foreground`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-80">{stat.label}</span>
              <stat.icon className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-3xl font-heading font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Alerts */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h2 className="text-lg font-heading font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            Stock Alerts
          </h2>
          {stockAlerts.length > 0 ? (
            <div className="space-y-3">
              {stockAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-accent/10 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-card-foreground">{alert.item}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.current} left (reorder at {alert.reorder})
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No stock alerts
            </p>
          )}
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-card-foreground">
              Activity Log
            </h2>
            <div className="flex items-center gap-2">
              <Input type="date" className="w-auto" />
              <Button variant="outline" size="sm">Filter</Button>
              <Button variant="ghost" size="sm">Show All</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Item</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Qty</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Staff</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Sign-off</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-3 px-2 text-sm text-card-foreground">{activity.date}</td>
                    <td className="py-3 px-2 text-sm text-card-foreground">{activity.item}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.type === "Incoming" 
                          ? "bg-primary/10 text-primary" 
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td className={`py-3 px-2 text-sm font-medium ${
                      activity.quantity > 0 ? "text-primary" : "text-destructive"
                    }`}>
                      {activity.quantity > 0 ? "+" : ""}{activity.quantity}
                    </td>
                    <td className="py-3 px-2 text-sm text-card-foreground">{activity.staff}</td>
                    <td className="py-3 px-2">
                      {activity.signoff ? (
                        <span className="text-primary">✓</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* End of Day Sign-off */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-heading font-semibold text-card-foreground mb-2">
          End-of-Day Sign-off
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Sign off on today's transactions to confirm accuracy
        </p>
        <div className="flex items-center gap-4">
          <Input placeholder="Your name" className="max-w-xs" />
          <Button>Sign Off Today</Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;