import { useState, useEffect } from "react";
import { Plus, ArrowRightLeft, Search, Check, Clock, X } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface StockMovement {
  id: string;
  inventory_item_id: string;
  movement_type: string;
  quantity: number;
  from_location: string | null;
  to_location: string | null;
  notes: string | null;
  created_at: string;
  item_name?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  location: string | null;
  quantity: number;
}

const StoreTransfers = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<StockMovement[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    inventory_item_id: "", from_location: "", to_location: "", quantity: "", notes: "",
  });

  const fetchData = async () => {
    if (!user) return;
    const [movementsRes, itemsRes] = await Promise.all([
      supabase.from("stock_movements").select("*").eq("movement_type", "transfer").order("created_at", { ascending: false }),
      supabase.from("inventory_items").select("id, name, location, quantity"),
    ]);
    
    const itemsData = itemsRes.data || [];
    setItems(itemsData);
    
    // Map item names to movements
    const itemMap = new Map(itemsData.map(i => [i.id, i.name]));
    const movementsWithNames = (movementsRes.data || []).map(m => ({
      ...m,
      item_name: itemMap.get(m.inventory_item_id) || "Unknown Item",
    }));
    setTransfers(movementsWithNames);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.inventory_item_id || !form.quantity || !form.from_location || !form.to_location) {
      toast.error("Please fill all required fields");
      return;
    }
    const { error } = await supabase.from("stock_movements").insert({
      inventory_item_id: form.inventory_item_id,
      movement_type: "transfer",
      quantity: Number(form.quantity),
      from_location: form.from_location,
      to_location: form.to_location,
      notes: form.notes || null,
      user_id: user.id,
      created_by: user.id,
    });
    if (error) { toast.error("Failed to create transfer"); return; }
    toast.success("Transfer recorded");
    setForm({ inventory_item_id: "", from_location: "", to_location: "", quantity: "", notes: "" });
    setIsDialogOpen(false);
    fetchData();
  };

  const filtered = transfers.filter(t =>
    (t.item_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.from_location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.to_location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique locations from inventory items
  const locations = [...new Set(items.map(i => i.location).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-heading font-bold text-foreground">Store Transfers</h1>
            <Badge variant="outline" className="text-xs">Professional</Badge>
          </div>
          <p className="text-muted-foreground">Track inventory transfers between locations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" /> New Transfer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Transfer</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Item *</Label>
                <Select value={form.inventory_item_id} onValueChange={(v) => setForm({ ...form, inventory_item_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select item" /></SelectTrigger>
                  <SelectContent>
                    {items.map(item => (
                      <SelectItem key={item.id} value={item.id}>{item.name} (Qty: {item.quantity})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Location *</Label>
                  <Input className="mt-1" value={form.from_location} onChange={(e) => setForm({ ...form, from_location: e.target.value })} placeholder="e.g., Main Warehouse" />
                </div>
                <div>
                  <Label>To Location *</Label>
                  <Input className="mt-1" value={form.to_location} onChange={(e) => setForm({ ...form, to_location: e.target.value })} placeholder="e.g., Store B" />
                </div>
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input type="number" className="mt-1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Input className="mt-1" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Reason for transfer..." />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Submit Transfer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transfers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Transfers Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading transfers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No transfers yet</p>
          <p className="text-sm text-muted-foreground">Click "New Transfer" to record a stock movement</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Item</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">From → To</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Quantity</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((transfer) => (
                  <tr key={transfer.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-card-foreground">{transfer.item_name}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-card-foreground">
                        <span>{transfer.from_location || "—"}</span>
                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                        <span>{transfer.to_location || "—"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-card-foreground">{transfer.quantity}</td>
                    <td className="py-4 px-4 text-sm text-card-foreground">
                      {new Date(transfer.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{transfer.notes || "—"}</td>
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

export default StoreTransfers;
