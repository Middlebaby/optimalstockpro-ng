import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
}

const Suppliers = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const fetchSuppliers = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load suppliers");
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, [user]);

  const resetForm = () => {
    setForm({ name: "", contact_person: "", phone: "", email: "", address: "", notes: "" });
    setEditingSupplier(null);
  };

  const handleSave = async () => {
    if (!user || !form.name) {
      toast.error("Company name is required");
      return;
    }

    const payload = {
      name: form.name,
      contact_person: form.contact_person || null,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      notes: form.notes || null,
      user_id: user.id,
    };

    if (editingSupplier) {
      const { error } = await supabase
        .from("suppliers")
        .update(payload)
        .eq("id", editingSupplier.id);
      if (error) {
        toast.error("Failed to update supplier");
        return;
      }
      toast.success("Supplier updated");
    } else {
      const { error } = await supabase.from("suppliers").insert(payload);
      if (error) {
        toast.error("Failed to add supplier");
        return;
      }
      toast.success("Supplier added");
    }

    resetForm();
    setIsDialogOpen(false);
    fetchSuppliers();
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete supplier");
      return;
    }
    toast.success("Supplier deleted");
    fetchSuppliers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier contacts and information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" /> Add Supplier</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleSave}>{editingSupplier ? "Update" : "Add"} Supplier</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading suppliers...</div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No suppliers yet</p>
          <p className="text-sm text-muted-foreground">Click "Add Supplier" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-heading font-semibold text-card-foreground">{supplier.name}</h3>
                  {supplier.contact_person && <p className="text-sm text-muted-foreground">{supplier.contact_person}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(supplier)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(supplier.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-card-foreground">
                    <Phone className="w-4 h-4 text-muted-foreground" /> {supplier.phone}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-card-foreground">
                    <Mail className="w-4 h-4 text-muted-foreground" /> {supplier.email}
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-sm text-card-foreground">
                    <MapPin className="w-4 h-4 text-muted-foreground" /> {supplier.address}
                  </div>
                )}
              </div>
              {supplier.notes && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">{supplier.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Suppliers;
