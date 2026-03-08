import { useState, useEffect } from "react";
import { Plus, Wrench, Search, MoreVertical, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface EquipmentItem {
  id: string;
  name: string;
  serial_number: string | null;
  status: string | null;
  location: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  description: string | null;
}

const EquipmentTracking = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    name: "", serial_number: "", status: "available", location: "",
    purchase_date: "", purchase_price: "", description: "",
  });

  const fetchEquipment = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load equipment");
    else setEquipment(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEquipment(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.name) { toast.error("Equipment name is required"); return; }
    const { error } = await supabase.from("equipment").insert({
      name: form.name,
      serial_number: form.serial_number || null,
      status: form.status || "available",
      location: form.location || null,
      purchase_date: form.purchase_date || null,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      description: form.description || null,
      user_id: user.id,
    });
    if (error) { toast.error("Failed to add equipment"); return; }
    toast.success("Equipment added");
    setForm({ name: "", serial_number: "", status: "available", location: "", purchase_date: "", purchase_price: "", description: "" });
    setIsDialogOpen(false);
    fetchEquipment();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("equipment").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Equipment deleted");
    fetchEquipment();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("equipment").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    fetchEquipment();
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "available": return "bg-green-500/10 text-green-600";
      case "in-use": return "bg-primary/10 text-primary";
      case "maintenance": return "bg-accent/10 text-accent";
      case "retired": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filtered = equipment.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.serial_number || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === "available").length,
    inUse: equipment.filter(e => e.status === "in-use").length,
    maintenance: equipment.filter(e => e.status === "maintenance").length,
    totalValue: equipment.reduce((sum, e) => sum + (e.purchase_price || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-heading font-bold text-foreground">Equipment & Tools</h1>
            <Badge variant="outline" className="text-xs">Professional</Badge>
          </div>
          <p className="text-muted-foreground">Track equipment, tools, and maintenance schedules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" /> Add Equipment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Equipment</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Equipment Name *</Label>
                  <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input className="mt-1" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Purchase Price (₦)</Label>
                  <Input type="number" className="mt-1" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
                </div>
                <div>
                  <Label>Purchase Date</Label>
                  <Input type="date" className="mt-1" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input className="mt-1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in-use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Add Equipment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total</p>
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
          <p className="text-sm text-muted-foreground">Maintenance</p>
          <p className="text-2xl font-heading font-bold text-accent">{stats.maintenance}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-heading font-bold text-foreground">₦{(stats.totalValue / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search equipment..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading equipment...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No equipment found</p>
          <p className="text-sm text-muted-foreground">Click "Add Equipment" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-card-foreground">{item.name}</h3>
                    {item.serial_number && <p className="text-xs text-muted-foreground">{item.serial_number}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(item.status)}>{item.status || "unknown"}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusChange(item.id, "available")}>Set Available</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(item.id, "in-use")}>Set In Use</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(item.id, "maintenance")}>Set Maintenance</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(item.id, "retired")}>Set Retired</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {item.location && (
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="text-card-foreground">{item.location}</p>
                  </div>
                )}
                {item.purchase_price && (
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="text-card-foreground">₦{item.purchase_price.toLocaleString()}</p>
                  </div>
                )}
                {item.purchase_date && (
                  <div>
                    <p className="text-muted-foreground">Purchased</p>
                    <p className="text-card-foreground">{item.purchase_date}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentTracking;
