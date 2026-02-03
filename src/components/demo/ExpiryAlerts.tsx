import { useState } from "react";
import { AlertTriangle, Calendar, Clock, Package, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, differenceInDays, addDays, isPast, isToday } from "date-fns";

interface ExpiringItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  location: string;
  category: string;
}

const ExpiryAlerts = () => {
  const [selectedItem, setSelectedItem] = useState<ExpiringItem | null>(null);

  // Demo data with various expiry dates
  const expiringItems: ExpiringItem[] = [
    {
      id: "1",
      name: "Frozen Fish (Tilapia)",
      sku: "FSH-TLP-001",
      quantity: 8,
      unit: "cartons",
      expiryDate: addDays(new Date(), -2), // Expired 2 days ago
      location: "Cold Room",
      category: "Food Products",
    },
    {
      id: "2",
      name: "Chicken Laps",
      sku: "CHK-LAP-001",
      quantity: 50,
      unit: "kilos",
      expiryDate: new Date(), // Expires today
      location: "Cold Room",
      category: "Food Products",
    },
    {
      id: "3",
      name: "Fresh Milk (Sachet)",
      sku: "MLK-SCH-001",
      quantity: 100,
      unit: "sachets",
      expiryDate: addDays(new Date(), 2), // 2 days left
      location: "Cold Room",
      category: "Dairy",
    },
    {
      id: "4",
      name: "Yoghurt (500ml)",
      sku: "YGT-500-001",
      quantity: 45,
      unit: "bottles",
      expiryDate: addDays(new Date(), 5), // 5 days left
      location: "Cold Room",
      category: "Dairy",
    },
    {
      id: "5",
      name: "Bread (Sliced)",
      sku: "BRD-SLC-001",
      quantity: 30,
      unit: "loaves",
      expiryDate: addDays(new Date(), 1), // 1 day left
      location: "Bakery Section",
      category: "Bakery",
    },
    {
      id: "6",
      name: "Vegetable Oil (25L)",
      sku: "OIL-VEG-025",
      quantity: 25,
      unit: "kegs",
      expiryDate: addDays(new Date(), 30), // 30 days left
      location: "Main Store",
      category: "Cooking Oil",
    },
  ];

  const getExpiryStatus = (expiryDate: Date) => {
    const daysLeft = differenceInDays(expiryDate, new Date());
    
    if (isPast(expiryDate) && !isToday(expiryDate)) {
      return { 
        label: "Expired", 
        color: "bg-destructive text-destructive-foreground",
        priority: 0,
        daysText: `${Math.abs(daysLeft)} days ago`
      };
    }
    if (isToday(expiryDate)) {
      return { 
        label: "Expires Today", 
        color: "bg-destructive text-destructive-foreground",
        priority: 1,
        daysText: "Today"
      };
    }
    if (daysLeft <= 3) {
      return { 
        label: "Critical", 
        color: "bg-accent text-accent-foreground",
        priority: 2,
        daysText: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`
      };
    }
    if (daysLeft <= 7) {
      return { 
        label: "Warning", 
        color: "bg-yellow-500/20 text-yellow-600",
        priority: 3,
        daysText: `${daysLeft} days left`
      };
    }
    return { 
      label: "OK", 
      color: "bg-primary/10 text-primary",
      priority: 4,
      daysText: `${daysLeft} days left`
    };
  };

  // Sort by priority (most urgent first)
  const sortedItems = [...expiringItems].sort((a, b) => {
    const statusA = getExpiryStatus(a.expiryDate);
    const statusB = getExpiryStatus(b.expiryDate);
    return statusA.priority - statusB.priority;
  });

  const expiredCount = expiringItems.filter(item => 
    isPast(item.expiryDate) && !isToday(item.expiryDate)
  ).length;
  
  const criticalCount = expiringItems.filter(item => {
    const days = differenceInDays(item.expiryDate, new Date());
    return days >= 0 && days <= 3;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Expiry Tracking
          </h1>
          <p className="text-muted-foreground">
            Monitor perishable items and prevent wastage
          </p>
        </div>
        <Button variant="outline">
          <Bell className="w-4 h-4 mr-2" />
          Configure Alerts
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired Items</p>
                <p className="text-3xl font-bold text-destructive">{expiredCount}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-destructive/50" />
            </div>
            <p className="text-xs text-destructive mt-2">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-3xl font-bold text-accent-foreground">{criticalCount}</p>
              </div>
              <Clock className="w-10 h-10 text-accent/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Within next 3 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tracked</p>
                <p className="text-3xl font-bold">{expiringItems.length}</p>
              </div>
              <Package className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Perishable items</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiry List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expiry Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {sortedItems.map((item) => {
                const status = getExpiryStatus(item.expiryDate);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded-full ${
                        status.priority === 0 ? 'bg-destructive' :
                        status.priority <= 2 ? 'bg-accent' :
                        status.priority === 3 ? 'bg-yellow-500' :
                        'bg-primary/30'
                      }`} />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{item.sku}</span>
                          <span>•</span>
                          <span>{item.quantity} {item.unit}</span>
                          <span>•</span>
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge className={status.color}>{status.label}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(item.expiryDate, "MMM d, yyyy")}
                        </p>
                        <p className="text-xs font-medium">{status.daysText}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-mono">{selectedItem.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p>{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p>{selectedItem.quantity} {selectedItem.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{selectedItem.location}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="text-lg font-medium">
                    {format(selectedItem.expiryDate, "MMMM d, yyyy")}
                  </p>
                  <Badge className={getExpiryStatus(selectedItem.expiryDate).color}>
                    {getExpiryStatus(selectedItem.expiryDate).daysText}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant="destructive">
                  Mark as Disposed
                </Button>
                <Button className="flex-1" variant="outline">
                  Discount & Sell
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpiryAlerts;
