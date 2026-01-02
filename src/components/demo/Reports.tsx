import { FileText, TrendingUp, AlertTriangle, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Reports = () => {
  const reportTypes = [
    {
      icon: FileText,
      title: "Inventory Summary",
      description: "Complete overview of current stock levels, values, and status",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: TrendingUp,
      title: "Stock Movement",
      description: "Track incoming and outgoing stock over time",
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      icon: AlertTriangle,
      title: "Variance Report",
      description: "Compare physical counts with system records to detect discrepancies",
      color: "bg-destructive/10 text-destructive",
    },
    {
      icon: Calendar,
      title: "Monthly Summary",
      description: "Month-by-month breakdown of inventory activity and trends",
      color: "bg-muted text-muted-foreground",
    },
  ];

  const categoryData = [
    { category: "Raw Materials", items: 12, value: "₦850,000", percentage: 68 },
    { category: "Finished Products", items: 5, value: "₦250,000", percentage: 20 },
    { category: "Supplies", items: 6, value: "₦120,000", percentage: 10 },
    { category: "Equipment", items: 1, value: "₦30,000", percentage: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Reports
          </h1>
          <p className="text-muted-foreground">
            Generate detailed reports and analytics for your inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="january">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="january">January 2026</SelectItem>
              <SelectItem value="december">December 2025</SelectItem>
              <SelectItem value="november">November 2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all cursor-pointer hover:-translate-y-1"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${report.color} mb-4`}>
              <report.icon className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-semibold text-card-foreground mb-2">
              {report.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {report.description}
            </p>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-heading font-semibold text-card-foreground mb-6">
          Inventory by Category
        </h2>
        <div className="space-y-4">
          {categoryData.map((cat, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-card-foreground">{cat.category}</span>
                  <span className="text-sm text-muted-foreground ml-2">({cat.items} items)</span>
                </div>
                <span className="font-semibold text-foreground">{cat.value}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-sm text-muted-foreground mb-2">Total Incoming (This Month)</h3>
          <p className="text-3xl font-heading font-bold text-primary">+850</p>
          <p className="text-sm text-muted-foreground">units across 12 items</p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-sm text-muted-foreground mb-2">Total Outgoing (This Month)</h3>
          <p className="text-3xl font-heading font-bold text-destructive">-620</p>
          <p className="text-sm text-muted-foreground">units across 8 items</p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-sm text-muted-foreground mb-2">Net Change</h3>
          <p className="text-3xl font-heading font-bold text-accent">+230</p>
          <p className="text-sm text-muted-foreground">units net increase</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;