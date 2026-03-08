import { useState } from "react";
import { Plus, Phone, Mail, MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  items: string[];
}

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    items: "",
  });

  const handleAddSupplier = () => {
    if (newSupplier.name && newSupplier.phone) {
      setSuppliers([
        ...suppliers,
        {
          ...newSupplier,
          id: Date.now().toString(),
          items: newSupplier.items.split(",").map((item) => item.trim()).filter(Boolean),
        },
      ]);
      setNewSupplier({
        name: "",
        contact: "",
        phone: "",
        email: "",
        address: "",
        items: "",
      });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Suppliers
          </h1>
          <p className="text-muted-foreground">
            Manage your supplier contacts and information
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact Person</Label>
                  <Input
                    id="contact"
                    value={newSupplier.contact}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="items">Items Supplied (comma-separated)</Label>
                <Textarea
                  id="items"
                  value={newSupplier.items}
                  onChange={(e) => setNewSupplier({ ...newSupplier, items: e.target.value })}
                  className="mt-1"
                  placeholder="e.g., Cement, Steel Rods, Paint"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSupplier}>Add Supplier</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-heading font-semibold text-card-foreground">
                  {supplier.name}
                </h3>
                <p className="text-sm text-muted-foreground">{supplier.contact}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {supplier.phone}
              </div>
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-card-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {supplier.email}
                </div>
              )}
              {supplier.address && (
                <div className="flex items-center gap-2 text-sm text-card-foreground">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {supplier.address}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Items Supplied:</p>
              <div className="flex flex-wrap gap-2">
                {supplier.items.map((item, index) => (
                  <span
                    key={index}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suppliers;