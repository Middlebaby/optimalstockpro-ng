import { useState } from "react";
import { Plus, ArrowRightLeft, MapPin, Search, Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Location {
  id: string;
  name: string;
  address: string;
  type: "warehouse" | "store" | "site";
  itemCount: number;
  manager: string;
}

interface Transfer {
  id: string;
  fromLocation: string;
  toLocation: string;
  item: string;
  quantity: number;
  unit: string;
  status: "pending" | "in-transit" | "completed" | "cancelled";
  requestedBy: string;
  requestedDate: string;
  completedDate?: string;
  notes?: string;
}

const StoreTransfers = () => {
  const [locations] = useState<Location[]>([
    { id: "1", name: "Main Warehouse", address: "Industrial Estate, Ikeja", type: "warehouse", itemCount: 156, manager: "Chidi Okonkwo" },
    { id: "2", name: "Lekki Store", address: "Admiralty Way, Lekki Phase 1", type: "store", itemCount: 45, manager: "Amina Ibrahim" },
    { id: "3", name: "VI Site Office", address: "Adeola Odeku, Victoria Island", type: "site", itemCount: 23, manager: "Tunde Adeyemi" },
    { id: "4", name: "Apapa Depot", address: "Wharf Road, Apapa", type: "warehouse", itemCount: 89, manager: "Ngozi Eze" },
  ]);

  const [transfers] = useState<Transfer[]>([
    { id: "1", fromLocation: "Main Warehouse", toLocation: "VI Site Office", item: "Premium Cement", quantity: 100, unit: "bags", status: "in-transit", requestedBy: "Tunde Adeyemi", requestedDate: "2026-01-02", notes: "Urgent for foundation work" },
    { id: "2", fromLocation: "Apapa Depot", toLocation: "Main Warehouse", item: "Steel Rods (12mm)", quantity: 500, unit: "pieces", status: "completed", requestedBy: "Chidi Okonkwo", requestedDate: "2025-12-28", completedDate: "2025-12-30" },
    { id: "3", fromLocation: "Main Warehouse", toLocation: "Lekki Store", item: "Paint - White", quantity: 25, unit: "buckets", status: "pending", requestedBy: "Amina Ibrahim", requestedDate: "2026-01-03" },
    { id: "4", fromLocation: "Lekki Store", toLocation: "VI Site Office", item: "PVC Pipes", quantity: 30, unit: "pieces", status: "cancelled", requestedBy: "Tunde Adeyemi", requestedDate: "2025-12-20", notes: "No longer needed" },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"transfers" | "locations">("transfers");

  const getStatusIcon = (status: Transfer["status"]) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "in-transit": return <ArrowRightLeft className="w-4 h-4" />;
      case "completed": return <Check className="w-4 h-4" />;
      case "cancelled": return <X className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Transfer["status"]) => {
    switch (status) {
      case "pending": return "bg-accent/10 text-accent";
      case "in-transit": return "bg-primary/10 text-primary";
      case "completed": return "bg-green-500/10 text-green-600";
      case "cancelled": return "bg-destructive/10 text-destructive";
    }
  };

  const getLocationTypeColor = (type: Location["type"]) => {
    switch (type) {
      case "warehouse": return "bg-primary/10 text-primary";
      case "store": return "bg-accent/10 text-accent";
      case "site": return "bg-green-500/10 text-green-600";
    }
  };

  const filteredTransfers = transfers.filter(t =>
    t.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.toLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Store Transfers
            </h1>
            <Badge variant="outline" className="text-xs">Professional</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage multi-location inventory transfers
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Transfer Request</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Location *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Location *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Item *</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select item to transfer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cement">Premium Cement</SelectItem>
                    <SelectItem value="steel">Steel Rods (12mm)</SelectItem>
                    <SelectItem value="paint">Paint - White</SelectItem>
                    <SelectItem value="pvc">PVC Pipes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity *</Label>
                  <Input type="number" className="mt-1" placeholder="0" />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Normal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Input className="mt-1" placeholder="Reason for transfer..." />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsDialogOpen(false)}>Submit Request</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "transfers" ? "default" : "outline"}
          onClick={() => setActiveTab("transfers")}
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Transfers
        </Button>
        <Button
          variant={activeTab === "locations" ? "default" : "outline"}
          onClick={() => setActiveTab("locations")}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Locations
        </Button>
      </div>

      {activeTab === "transfers" && (
        <>
          {/* Search */}
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transfers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Transfers Table */}
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Item</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">From → To</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Quantity</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Requested By</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-medium text-card-foreground">{transfer.item}</p>
                        {transfer.notes && (
                          <p className="text-xs text-muted-foreground">{transfer.notes}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-card-foreground">
                          <span>{transfer.fromLocation}</span>
                          <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                          <span>{transfer.toLocation}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-card-foreground">
                        {transfer.quantity} {transfer.unit}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(transfer.status)}`}>
                          {getStatusIcon(transfer.status)}
                          {transfer.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-card-foreground">{transfer.requestedBy}</td>
                      <td className="py-4 px-4 text-sm text-card-foreground">{transfer.requestedDate}</td>
                      <td className="py-4 px-4">
                        {transfer.status === "pending" && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Approve</Button>
                            <Button variant="ghost" size="sm" className="text-destructive">Cancel</Button>
                          </div>
                        )}
                        {transfer.status === "in-transit" && (
                          <Button variant="outline" size="sm">Mark Complete</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "locations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => (
            <div key={location.id} className="bg-card rounded-xl p-6 shadow-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <Badge className={getLocationTypeColor(location.type)}>
                    {location.type}
                  </Badge>
                </div>
              </div>
              <h3 className="font-heading font-semibold text-card-foreground mb-1">{location.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{location.address}</p>
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <div>
                  <p className="text-muted-foreground">Items</p>
                  <p className="font-semibold text-foreground">{location.itemCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Manager</p>
                  <p className="font-medium text-foreground">{location.manager}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View Inventory
              </Button>
            </div>
          ))}
          <div className="bg-muted/30 rounded-xl p-6 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
            <Plus className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="font-medium text-muted-foreground">Add Location</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreTransfers;
