import { useState, useEffect } from "react";
import { Plus, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

const IncomingStock = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    itemId: "",
    quantity: 0,
    toLocation: "",
    notes: "",
  });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [movementsRes, itemsRes] = await Promise.all([
      supabase
        .from("stock_movements")
        .select("*, inventory_items(name, unit)")
        .eq("user_id", user.id)
        .eq("movement_type", "incoming")
        .order("created_at", { ascending: false }),
      supabase
        .from("inventory_items")
        .select("id, name, unit")
        .eq("user_id", user.id)
        .order("name"),
    ]);

    if (movementsRes.error) console.error(movementsRes.error);
    if (itemsRes.error) console.error(itemsRes.error);

    setRecords(movementsRes.data || []);
    setInventoryItems(itemsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddRecord = async () => {
    if (!user || !newRecord.itemId || newRecord.quantity <= 0) return;

    // Create stock movement
    const { error } = await supabase.from("stock_movements").insert({
      user_id: user.id,
      inventory_item_id: newRecord.itemId,
      movement_type: "incoming",
      quantity: newRecord.quantity,
      to_location: newRecord.toLocation || null,
      created_by: user.id,
      notes: newRecord.notes || null,
    });

    if (error) {
      toast.error("Failed to record incoming stock");
      return;
    }

    // Update inventory quantity
    const item = inventoryItems.find((i) => i.id === newRecord.itemId);
    if (item) {
      const { data: current } = await supabase
        .from("inventory_items")
        .select("quantity")
        .eq("id", newRecord.itemId)
        .single();

      if (current) {
        await supabase
          .from("inventory_items")
          .update({ quantity: current.quantity + newRecord.quantity })
          .eq("id", newRecord.itemId);
      }
    }

    toast.success("Incoming stock recorded!");
    setNewRecord({ date: new Date().toISOString().split("T")[0], itemId: "", quantity: 0, toLocation: "", notes: "" });
    setIsDialogOpen(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Incoming Stock</h1>
          <p className="text-muted-foreground">Record stock arrivals and deliveries</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={inventoryItems.length === 0}>
              <Plus className="w-4 h-4" />
              Record Incoming Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Record Incoming Stock</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={newRecord.date} onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Item *</Label>
                  <Select value={newRecord.itemId} onValueChange={(v) => setNewRecord({ ...newRecord, itemId: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select item" /></SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity *</Label>
                  <Input type="number" value={newRecord.quantity} onChange={(e) => setNewRecord({ ...newRecord, quantity: parseInt(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div>
                  <Label>Destination Location</Label>
                  <Input value={newRecord.toLocation} onChange={(e) => setNewRecord({ ...newRecord, toLocation: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={newRecord.notes} onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })} className="mt-1" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddRecord}>Record</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {records.length === 0 ? (
        <div className="bg-card rounded-xl shadow-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ArrowDownCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-heading font-semibold text-card-foreground mb-2">No incoming stock records</h2>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            {inventoryItems.length === 0
              ? "Add items to your Master Inventory first, then record incoming stock here."
              : "Record your first stock delivery or arrival."}
          </p>
          {inventoryItems.length > 0 && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Record First Incoming
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Item</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Quantity</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Location</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 text-sm text-card-foreground">
                      {format(new Date(record.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-card-foreground">
                      {record.inventory_items?.name || "Unknown Item"}
                    </td>
                    <td className="py-4 px-4 text-sm text-primary font-medium">
                      +{record.quantity} {record.inventory_items?.unit || ""}
                    </td>
                    <td className="py-4 px-4 text-sm text-card-foreground">{record.to_location || "—"}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{record.notes || "—"}</td>
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

export default IncomingStock;
