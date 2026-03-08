import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, QrCode, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { format, differenceInDays, isPast, isToday } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface MasterInventoryProps {
  onOpenScanner?: () => void;
  triggerAddDialog?: boolean;
  onAddDialogOpened?: () => void;
}

const categories = [
  "Raw Materials", "Food Products", "Beverages", "Electronics",
  "Textiles", "Clothing", "Supplies", "Equipment", "Other",
];

const MasterInventory = ({ onOpenScanner, triggerAddDialog, onAddDialogOpened }: MasterInventoryProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newItem, setNewItem] = useState({
    name: "", category: "", quantity: 0, unit: "pcs",
    unitCost: 0, reorderLevel: 10, location: "", supplier: "",
    expiryDate: "", sku: "",
  });

  // Open dialog when triggered by onboarding tour
  useEffect(() => {
    if (triggerAddDialog) {
      setIsDialogOpen(true);
      onAddDialogOpened?.();
    }
  }, [triggerAddDialog, onAddDialogOpened]);

  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*, suppliers(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const resetForm = () => {
    setNewItem({
      name: "", category: "", quantity: 0, unit: "pcs",
      unitCost: 0, reorderLevel: 10, location: "", supplier: "",
      expiryDate: "", sku: "",
    });
    setEditingItem(null);
  };

  const handleAddItem = async () => {
    if (!user || !newItem.name || !newItem.category) return;

    const insertData: any = {
      user_id: user.id,
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity,
      unit: newItem.unit,
      unit_price: newItem.unitCost,
      reorder_level: newItem.reorderLevel,
      location: newItem.location || null,
      sku: newItem.sku || null,
      expiry_date: newItem.expiryDate || null,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("inventory_items")
        .update(insertData)
        .eq("id", editingItem.id);

      if (error) {
        toast.error("Failed to update item");
        return;
      }
      toast.success("Item updated successfully");
    } else {
      const { data: created, error } = await supabase
        .from("inventory_items")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        toast.error("Failed to add item");
        return;
      }

      // Create incoming stock movement for initial quantity
      if (created && newItem.quantity > 0) {
        await supabase.from("stock_movements").insert({
          user_id: user.id,
          inventory_item_id: created.id,
          movement_type: "incoming",
          quantity: newItem.quantity,
          to_location: newItem.location || null,
          created_by: user.id,
          notes: "Initial stock entry",
        });
      }

      toast.success("Item added to inventory!");
    }

    resetForm();
    setIsDialogOpen(false);
    fetchItems();
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category || "",
      quantity: item.quantity,
      unit: item.unit || "pcs",
      unitCost: item.unit_price || 0,
      reorderLevel: item.reorder_level || 10,
      location: item.location || "",
      supplier: item.suppliers?.name || "",
      expiryDate: item.expiry_date || "",
      sku: item.sku || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete item");
      return;
    }
    toast.success("Item deleted");
    fetchItems();
  };

  const getStatus = (quantity: number, reorderLevel: number, expiryDate?: string) => {
    if (expiryDate) {
      const expDate = new Date(expiryDate);
      const daysLeft = differenceInDays(expDate, new Date());
      if (isPast(expDate) && !isToday(expDate)) {
        return { label: "Expired", color: "bg-destructive text-destructive-foreground" };
      }
      if (isToday(expDate) || daysLeft <= 3) {
        return { label: "Expiring Soon", color: "bg-accent text-accent-foreground" };
      }
    }
    if (quantity === 0) return { label: "Out of Stock", color: "bg-destructive text-destructive-foreground" };
    if (quantity <= reorderLevel) return { label: "Low Stock", color: "bg-accent text-accent-foreground" };
    return { label: "In Stock", color: "bg-primary/10 text-primary" };
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-heading font-bold text-foreground">Master Inventory</h1>
          <p className="text-muted-foreground">Manage all your inventory items in one place</p>
        </div>
        <div className="flex gap-2">
          {onOpenScanner && (
            <Button variant="outline" onClick={onOpenScanner}>
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Scan Barcode</span>
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Item Name *</Label>
                    <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Quantity *</Label>
                    <Input type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Unit *</Label>
                    <Input value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} placeholder="e.g., bags, pcs" className="mt-1" />
                  </div>
                  <div>
                    <Label>Reorder Level</Label>
                    <Input type="number" value={newItem.reorderLevel} onChange={(e) => setNewItem({ ...newItem, reorderLevel: parseInt(e.target.value) || 0 })} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Unit Cost (₦)</Label>
                    <Input type="number" value={newItem.unitCost} onChange={(e) => setNewItem({ ...newItem, unitCost: parseInt(e.target.value) || 0 })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SKU</Label>
                    <Input value={newItem.sku} onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input type="date" value={newItem.expiryDate} onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })} className="mt-1" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                  <Button onClick={handleAddItem}>{editingItem ? "Update Item" : "Add Item"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="bg-card rounded-xl shadow-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-heading font-semibold text-card-foreground mb-2">
            No inventory items yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Start by adding your first product. Items you add here will automatically appear in incoming stock records.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Your First Item
          </Button>
        </div>
      ) : (
        /* Table */
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Item Name</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Category</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Quantity</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Unit Cost</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Total Value</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Location</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = getStatus(item.quantity, item.reorder_level || 10, item.expiry_date);
                  return (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-medium text-card-foreground">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {item.suppliers?.name && <span>{item.suppliers.name}</span>}
                          {item.sku && <span className="font-mono bg-muted px-1 rounded">{item.sku}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-card-foreground">{item.category}</td>
                      <td className="py-4 px-4 text-sm text-card-foreground">{item.quantity} {item.unit}</td>
                      <td className="py-4 px-4 text-sm text-card-foreground">₦{(item.unit_price || 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm font-medium text-card-foreground">₦{((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full w-fit ${status.color}`}>{status.label}</span>
                          {item.expiry_date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(item.expiry_date), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-card-foreground">{item.location || "—"}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditItem(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterInventory;
