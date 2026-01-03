import { useState } from "react";
import { Plus, Wrench, AlertTriangle, CheckCircle, Clock, Search, Calendar, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Equipment {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: "available" | "in-use" | "maintenance" | "retired";
  condition: number; // 0-100
  location: string;
  assignedTo?: string;
  assignedProject?: string;
  purchaseDate: string;
  purchaseValue: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: "routine" | "repair" | "inspection";
  date: string;
  description: string;
  cost: number;
  performedBy: string;
}

const EquipmentTracking = () => {
  const [equipment] = useState<Equipment[]>([
    {
      id: "1",
      name: "Concrete Mixer - 350L",
      category: "Heavy Machinery",
      serialNumber: "CM-2024-001",
      status: "in-use",
      condition: 85,
      location: "VI Site Office",
      assignedTo: "Team Alpha",
      assignedProject: "Victoria Island Office Complex",
      purchaseDate: "2024-03-15",
      purchaseValue: 2500000,
      lastMaintenance: "2025-12-15",
      nextMaintenance: "2026-03-15"
    },
    {
      id: "2",
      name: "Generator - 100KVA",
      category: "Power Equipment",
      serialNumber: "GEN-2023-015",
      status: "available",
      condition: 72,
      location: "Main Warehouse",
      purchaseDate: "2023-06-20",
      purchaseValue: 4500000,
      lastMaintenance: "2025-11-01",
      nextMaintenance: "2026-02-01"
    },
    {
      id: "3",
      name: "Excavator - Mini",
      category: "Heavy Machinery",
      serialNumber: "EXC-2024-003",
      status: "maintenance",
      condition: 45,
      location: "Apapa Depot",
      purchaseDate: "2024-01-10",
      purchaseValue: 15000000,
      lastMaintenance: "2025-12-28",
      nextMaintenance: "2026-01-28"
    },
    {
      id: "4",
      name: "Welding Machine",
      category: "Tools",
      serialNumber: "WM-2022-042",
      status: "in-use",
      condition: 90,
      location: "Lekki Store",
      assignedTo: "Fabrication Team",
      assignedProject: "Lekki Housing Estate Phase 2",
      purchaseDate: "2022-08-05",
      purchaseValue: 350000,
      lastMaintenance: "2025-10-20",
      nextMaintenance: "2026-04-20"
    },
    {
      id: "5",
      name: "Scaffolding Set (20 units)",
      category: "Safety Equipment",
      serialNumber: "SC-2023-100",
      status: "in-use",
      condition: 78,
      location: "VI Site Office",
      assignedTo: "Team Beta",
      assignedProject: "Victoria Island Office Complex",
      purchaseDate: "2023-02-28",
      purchaseValue: 1200000,
      lastMaintenance: "2025-09-15",
      nextMaintenance: "2026-03-15"
    },
  ]);

  const [maintenanceRecords] = useState<MaintenanceRecord[]>([
    { id: "1", equipmentId: "1", type: "routine", date: "2025-12-15", description: "Oil change and belt inspection", cost: 45000, performedBy: "Maintenance Team" },
    { id: "2", equipmentId: "3", type: "repair", date: "2025-12-28", description: "Hydraulic system repair - cylinder replacement", cost: 850000, performedBy: "CAT Service Center" },
    { id: "3", equipmentId: "2", type: "routine", date: "2025-11-01", description: "Full service and filter replacement", cost: 120000, performedBy: "Maintenance Team" },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getStatusColor = (status: Equipment["status"]) => {
    switch (status) {
      case "available": return "bg-green-500/10 text-green-600";
      case "in-use": return "bg-primary/10 text-primary";
      case "maintenance": return "bg-accent/10 text-accent";
      case "retired": return "bg-muted text-muted-foreground";
    }
  };

  const getConditionColor = (condition: number) => {
    if (condition >= 80) return "bg-green-500";
    if (condition >= 50) return "bg-accent";
    return "bg-destructive";
  };

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === "available").length,
    inUse: equipment.filter(e => e.status === "in-use").length,
    maintenance: equipment.filter(e => e.status === "maintenance").length,
    totalValue: equipment.reduce((sum, e) => sum + e.purchaseValue, 0),
  };

  const upcomingMaintenance = equipment
    .filter(e => new Date(e.nextMaintenance) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Equipment & Tools
            </h1>
            <Badge variant="outline" className="text-xs">Professional</Badge>
          </div>
          <p className="text-muted-foreground">
            Track equipment, tools, and maintenance schedules
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Equipment Name *</Label>
                  <Input className="mt-1" placeholder="e.g., Concrete Mixer" />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heavy">Heavy Machinery</SelectItem>
                      <SelectItem value="power">Power Equipment</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="safety">Safety Equipment</SelectItem>
                      <SelectItem value="vehicles">Vehicles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Serial Number *</Label>
                  <Input className="mt-1" placeholder="e.g., CM-2024-001" />
                </div>
                <div>
                  <Label>Purchase Value (₦) *</Label>
                  <Input type="number" className="mt-1" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Purchase Date *</Label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <Label>Location *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehouse">Main Warehouse</SelectItem>
                      <SelectItem value="lekki">Lekki Store</SelectItem>
                      <SelectItem value="vi">VI Site Office</SelectItem>
                      <SelectItem value="apapa">Apapa Depot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsDialogOpen(false)}>Add Equipment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Equipment</p>
          <p className="text-2xl font-heading font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-2xl font-heading font-bold text-green-600">{stats.available}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">In Use</p>
          <p className="text-2xl font-heading font-bold text-primary">{stats.inUse}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Under Maintenance</p>
          <p className="text-2xl font-heading font-bold text-accent">{stats.maintenance}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-heading font-bold text-foreground">₦{(stats.totalValue / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Maintenance Alerts */}
      {upcomingMaintenance.length > 0 && (
        <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="font-medium text-foreground">Upcoming Maintenance (Next 30 Days)</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {upcomingMaintenance.map((e) => (
              <Badge key={e.id} variant="outline" className="bg-background">
                {e.name} - Due {e.nextMaintenance}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredEquipment.map((item) => (
          <div key={item.id} className="bg-card rounded-xl p-5 shadow-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-card-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.serialNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Assign to Project</DropdownMenuItem>
                    <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                    <DropdownMenuItem>View History</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="text-card-foreground">{item.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="text-card-foreground">{item.location}</p>
              </div>
              {item.assignedProject && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Assigned To</p>
                  <p className="text-card-foreground">{item.assignedProject} ({item.assignedTo})</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium text-foreground">{item.condition}%</span>
              </div>
              <Progress value={item.condition} className={`h-2 ${getConditionColor(item.condition)}`} />
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              <span>Last Maintenance: {item.lastMaintenance}</span>
              <span className={new Date(item.nextMaintenance) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) ? "text-accent font-medium" : ""}>
                Next: {item.nextMaintenance}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentTracking;
