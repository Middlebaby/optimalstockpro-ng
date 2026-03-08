import { useState, useEffect } from "react";
import { Plus, FileText, Search, Send, Check, Clock, X, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string | null;
  status: string | null;
  total_amount: number | null;
  order_date: string | null;
  expected_delivery: string | null;
  notes: string | null;
  project_id: string | null;
}

interface Supplier {
  id: string;
  name: string;
}

const PurchaseOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    order_number: "", supplier_id: "", expected_delivery: "", notes: "", total_amount: "",
  });

  const fetchData = async () => {
    if (!user) return;
    const [ordersRes, suppliersRes] = await Promise.all([
      supabase.from("purchase_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("suppliers").select("id, name"),
    ]);
    if (!ordersRes.error) setOrders(ordersRes.data || []);
    if (!suppliersRes.error) setSuppliers(suppliersRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.order_number) { toast.error("Order number is required"); return; }
    const { error } = await supabase.from("purchase_orders").insert({
      order_number: form.order_number,
      supplier_id: form.supplier_id || null,
      expected_delivery: form.expected_delivery || null,
      notes: form.notes || null,
      total_amount: form.total_amount ? Number(form.total_amount) : null,
      status: "pending",
      user_id: user.id,
    });
    if (error) { toast.error("Failed to create PO"); return; }
    toast.success("Purchase order created");
    setForm({ order_number: "", supplier_id: "", expected_delivery: "", notes: "", total_amount: "" });
    setIsDialogOpen(false);
    fetchData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("purchase_orders").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("PO deleted");
    fetchData();
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "pending": return "bg-accent/10 text-accent";
      case "sent": return "bg-primary/10 text-primary";
      case "confirmed": return "bg-primary/10 text-primary";
      case "received": return "bg-green-500/10 text-green-600";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSupplierName = (id: string | null) => {
    if (!id) return "—";
    return suppliers.find(s => s.id === id)?.name || "—";
  };

  const filtered = orders.filter(o => {
    const matchesSearch = o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSupplierName(o.supplier_id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending" || o.status === "sent" || o.status === "confirmed").length,
    totalValue: orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-heading font-bold text-foreground">Purchase Orders</h1>
            <Badge variant="outline" className="text-xs">Professional</Badge>
          </div>
          <p className="text-muted-foreground">Create and manage purchase orders for suppliers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" /> New Purchase Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order Number *</Label>
                  <Input className="mt-1" value={form.order_number} onChange={(e) => setForm({ ...form, order_number: e.target.value })} placeholder="PO-001" />
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expected Delivery</Label>
                  <Input type="date" className="mt-1" value={form.expected_delivery} onChange={(e) => setForm({ ...form, expected_delivery: e.target.value })} />
                </div>
                <div>
                  <Label>Total Amount (₦)</Label>
                  <Input type="number" className="mt-1" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea className="mt-1" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Create PO</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-heading font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-heading font-bold text-primary">{stats.pending}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-heading font-bold text-foreground">₦{stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search PO number or supplier..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading purchase orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No purchase orders yet</p>
          <p className="text-sm text-muted-foreground">Click "New Purchase Order" to create one</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">PO Number</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Supplier</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Total</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Expected</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-medium text-card-foreground">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{order.order_date}</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-card-foreground">{getSupplierName(order.supplier_id)}</td>
                    <td className="py-4 px-4 text-sm font-medium text-card-foreground">
                      {order.total_amount ? `₦${order.total_amount.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(order.status)}>{order.status || "pending"}</Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-card-foreground">{order.expected_delivery || "—"}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1">
                        {order.status === "pending" && (
                          <Button variant="ghost" size="sm" onClick={() => handleStatusChange(order.id, "sent")}>
                            <Send className="w-3 h-3 mr-1" /> Send
                          </Button>
                        )}
                        {order.status === "sent" && (
                          <Button variant="ghost" size="sm" onClick={() => handleStatusChange(order.id, "confirmed")}>
                            <Check className="w-3 h-3 mr-1" /> Confirm
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button variant="ghost" size="sm" onClick={() => handleStatusChange(order.id, "received")}>
                            <Check className="w-3 h-3 mr-1" /> Received
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(order.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
