import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
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

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  reorderLevel: number;
  location: string;
  supplier: string;
}

const MasterInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([
    // Construction Materials
    { id: "1", name: "Premium Cement", category: "Raw Materials", quantity: 150, unit: "bags", unitCost: 4500, reorderLevel: 50, location: "Warehouse A", supplier: "Dangote Cement" },
    { id: "2", name: "Steel Rods (12mm)", category: "Raw Materials", quantity: 200, unit: "pieces", unitCost: 2500, reorderLevel: 100, location: "Warehouse A", supplier: "Steel Masters" },
    // Food & Restaurant
    { id: "3", name: "Rice (50kg bags)", category: "Food Products", quantity: 100, unit: "bags", unitCost: 45000, reorderLevel: 30, location: "Main Store", supplier: "Lagos Rice Mill" },
    { id: "4", name: "Chicken Laps", category: "Food Products", quantity: 50, unit: "kilos", unitCost: 3500, reorderLevel: 20, location: "Cold Room", supplier: "Obasanjo Farms" },
    { id: "5", name: "Vegetable Oil (25L)", category: "Food Products", quantity: 25, unit: "kegs", unitCost: 35000, reorderLevel: 10, location: "Main Store", supplier: "Kings Oil" },
    { id: "6", name: "Frozen Fish (Tilapia)", category: "Food Products", quantity: 8, unit: "cartons", unitCost: 28000, reorderLevel: 15, location: "Cold Room", supplier: "Fresh Catch Ltd" },
    // Retail & General
    { id: "7", name: "Bottled Water (75cl)", category: "Beverages", quantity: 500, unit: "cartons", unitCost: 2500, reorderLevel: 100, location: "Warehouse B", supplier: "Eva Water" },
    { id: "8", name: "Soft Drinks (35cl)", category: "Beverages", quantity: 3, unit: "crates", unitCost: 3200, reorderLevel: 50, location: "Shop Floor", supplier: "Coca-Cola" },
    // Electronics & Tech
    { id: "9", name: "Phone Chargers (Type-C)", category: "Electronics", quantity: 150, unit: "pieces", unitCost: 1500, reorderLevel: 50, location: "Display Unit", supplier: "Tech Hub" },
    { id: "10", name: "LED Bulbs (18W)", category: "Electronics", quantity: 0, unit: "pieces", unitCost: 1200, reorderLevel: 30, location: "Warehouse A", supplier: "Philips Nigeria" },
    // Fashion & Clothing
    { id: "11", name: "Ankara Fabric", category: "Textiles", quantity: 75, unit: "yards", unitCost: 2500, reorderLevel: 25, location: "Fabric Section", supplier: "ABC Wax" },
    { id: "12", name: "Men's Polo Shirts", category: "Clothing", quantity: 45, unit: "pieces", unitCost: 4500, reorderLevel: 20, location: "Shop Floor", supplier: "Fashion House" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    unitCost: 0,
    reorderLevel: 0,
    location: "",
    supplier: "",
  });

  const categories = ["Raw Materials", "Food Products", "Beverages", "Electronics", "Textiles", "Clothing", "Supplies", "Equipment"];

  const getStatus = (quantity: number, reorderLevel: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-destructive text-destructive-foreground" };
    if (quantity <= reorderLevel) return { label: "Low Stock", color: "bg-accent text-accent-foreground" };
    return { label: "In Stock", color: "bg-primary/10 text-primary" };
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.category) {
      setItems([...items, { ...newItem, id: Date.now().toString() }]);
      setNewItem({
        name: "",
        category: "",
        quantity: 0,
        unit: "",
        unitCost: 0,
        reorderLevel: 0,
        location: "",
        supplier: "",
      });
      setIsDialogOpen(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Master Inventory
          </h1>
          <p className="text-muted-foreground">
            Manage all your inventory items in one place
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="e.g., bags, pieces"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="reorder">Reorder Level *</Label>
                  <Input
                    id="reorder"
                    type="number"
                    value={newItem.reorderLevel}
                    onChange={(e) => setNewItem({ ...newItem, reorderLevel: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost">Unit Cost (₦) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({ ...newItem, unitCost: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
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
                const status = getStatus(item.quantity, item.reorderLevel);
                return (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-medium text-card-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.supplier}</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-card-foreground">{item.category}</td>
                    <td className="py-4 px-4 text-sm text-card-foreground">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-sm text-card-foreground">
                      ₦{item.unitCost.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-card-foreground">
                      ₦{(item.quantity * item.unitCost).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-card-foreground">{item.location}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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
    </div>
  );
};

export default MasterInventory;