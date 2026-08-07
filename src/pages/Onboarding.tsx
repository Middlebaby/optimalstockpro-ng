import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Building2, Warehouse, Package, CheckCircle2, ArrowRight, ArrowLeft,
  Plus, Trash2, Upload, Loader2, PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EmailVerificationGuard from "@/components/auth/EmailVerificationGuard";
import CsvImportDialog from "@/components/inventory/CsvImportDialog";

export const onboardingKey = (userId: string) => `onboarding_completed_${userId}`;

const categories = [
  "Raw Materials", "Food Products", "Beverages", "Electronics",
  "Textiles", "Clothing", "Supplies", "Equipment", "Other",
];

interface DraftProduct {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  reorderLevel: string;
}

const emptyProduct = (): DraftProduct => ({
  name: "", category: "Other", quantity: "0", unit: "pcs", unitPrice: "0", reorderLevel: "10",
});

const steps = [
  { id: 1, title: "Your business", icon: Building2 },
  { id: 2, title: "First warehouse", icon: Warehouse },
  { id: 3, title: "First products", icon: Package },
  { id: 4, title: "All set", icon: PartyPopper },
];

const OnboardingContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const [business, setBusiness] = useState({ fullName: "", companyName: "", phone: "" });
  const [warehouse, setWarehouse] = useState({ name: "", address: "", contactPerson: "", phone: "" });
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [products, setProducts] = useState<DraftProduct[]>([emptyProduct()]);
  const [savedProducts, setSavedProducts] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?next=/onboarding");
  }, [user, loading, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, company_name, phone")
        .eq("user_id", user.id)
        .maybeSingle();
      setBusiness({
        fullName: data?.full_name || (user.user_metadata?.full_name as string) || "",
        companyName: data?.company_name || "",
        phone: data?.phone || "",
      });
    };
    loadProfile();
  }, [user]);

  const finish = () => {
    if (user) localStorage.setItem(onboardingKey(user.id), "true");
    navigate("/dashboard");
  };

  const saveBusiness = async () => {
    if (!user) return;
    if (!business.companyName.trim()) {
      toast.error("Please enter your business name");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: business.fullName || null,
        company_name: business.companyName,
        phone: business.phone || null,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save your business details");
      return;
    }
    setStep(2);
  };

  const saveWarehouse = async () => {
    if (!user) return;
    if (!warehouse.name.trim()) {
      toast.error("Give your warehouse or store a name");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("distribution_locations")
      .insert({
        user_id: user.id,
        name: warehouse.name.trim(),
        address: warehouse.address || null,
        contact_person: warehouse.contactPerson || null,
        phone: warehouse.phone || null,
      })
      .select("id")
      .single();
    setSaving(false);
    if (error) {
      toast.error("Could not create the warehouse");
      return;
    }
    setWarehouseId(data.id);
    toast.success(`${warehouse.name} created`);
    setStep(3);
  };

  const saveProducts = async () => {
    if (!user) return;
    const valid = products.filter((p) => p.name.trim());
    if (valid.length === 0) {
      if (importedCount > 0) {
        setStep(4);
        return;
      }
      toast.error("Add at least one product, or import a CSV");
      return;
    }

    setSaving(true);
    const payload = valid.map((p) => ({
      user_id: user.id,
      name: p.name.trim(),
      category: p.category,
      quantity: Number(p.quantity) || 0,
      unit: p.unit || "pcs",
      unit_price: Number(p.unitPrice) || 0,
      reorder_level: Number(p.reorderLevel) || 0,
      location: warehouse.name || null,
    }));

    const { data, error } = await supabase
      .from("inventory_items")
      .insert(payload)
      .select("id, quantity, location");

    if (!error && data) {
      const movements = data
        .filter((row) => (row.quantity || 0) > 0)
        .map((row) => ({
          user_id: user.id,
          inventory_item_id: row.id,
          movement_type: "incoming",
          quantity: row.quantity,
          to_location: row.location,
          created_by: user.id,
          notes: "Onboarding initial stock",
        }));
      if (movements.length > 0) await supabase.from("stock_movements").insert(movements);
    }

    setSaving(false);
    if (error) {
      toast.error("Could not save your products");
      return;
    }
    setSavedProducts(valid.length);
    setStep(4);
  };

  const updateProduct = (index: number, patch: Partial<DraftProduct>) => {
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 bg-hero-gradient flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-foreground/20">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-heading font-bold text-primary-foreground">
              Optimalstock Pro
            </span>
            <p className="text-xs text-primary-foreground/70">Account setup</p>
          </div>
        </div>
        <Button variant="ghost" className="ml-auto text-primary-foreground" onClick={finish}>
          Skip for now
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Stepper */}
        <ol className="flex items-center justify-between mb-10">
          {steps.map((s, index) => {
            const StepIcon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <li key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : active
                        ? "bg-primary/15 text-primary ring-2 ring-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs text-center ${
                      active ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 mb-6 ${done ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-2xl shadow-card p-6 sm:p-8"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-card-foreground">
                  Tell us about your business
                </h1>
                <p className="text-muted-foreground">
                  This personalises your dashboard, reports and receipts.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Business name *</Label>
                  <Input
                    className="mt-1"
                    value={business.companyName}
                    placeholder="e.g. Adeola Foods Ltd"
                    onChange={(e) => setBusiness({ ...business, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Your full name</Label>
                  <Input
                    className="mt-1"
                    value={business.fullName}
                    onChange={(e) => setBusiness({ ...business, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone number</Label>
                  <Input
                    className="mt-1"
                    value={business.phone}
                    placeholder="080..."
                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveBusiness} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-card-foreground">
                  Create your first warehouse
                </h1>
                <p className="text-muted-foreground">
                  A warehouse, shop or store where your stock lives. You can add more later.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Warehouse / store name *</Label>
                  <Input
                    className="mt-1"
                    value={warehouse.name}
                    placeholder="e.g. Main Warehouse, Ikeja"
                    onChange={(e) => setWarehouse({ ...warehouse, name: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Address</Label>
                  <Input
                    className="mt-1"
                    value={warehouse.address}
                    onChange={(e) => setWarehouse({ ...warehouse, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contact person</Label>
                  <Input
                    className="mt-1"
                    value={warehouse.contactPerson}
                    onChange={(e) => setWarehouse({ ...warehouse, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contact phone</Label>
                  <Input
                    className="mt-1"
                    value={warehouse.phone}
                    onChange={(e) => setWarehouse({ ...warehouse, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button onClick={saveWarehouse} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create warehouse
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-heading font-bold text-card-foreground">
                    Add your first products
                  </h1>
                  <p className="text-muted-foreground">
                    Type a few items, or import your whole list from a spreadsheet.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setCsvOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </div>

              {importedCount > 0 && (
                <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
                  {importedCount} item{importedCount === 1 ? "" : "s"} imported from CSV.
                </div>
              )}

              <div className="space-y-4">
                {products.map((product, index) => (
                  <div key={index} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Product {index + 1}
                      </span>
                      {products.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setProducts(products.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Product name</Label>
                        <Input
                          className="mt-1"
                          value={product.name}
                          placeholder="e.g. Rice (50kg bag)"
                          onChange={(e) => updateProduct(index, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={product.category}
                          onValueChange={(v) => updateProduct(index, { category: v })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          className="mt-1"
                          value={product.quantity}
                          onChange={(e) => updateProduct(index, { quantity: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input
                          className="mt-1"
                          value={product.unit}
                          onChange={(e) => updateProduct(index, { unit: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Unit cost (₦)</Label>
                        <Input
                          type="number"
                          className="mt-1"
                          value={product.unitPrice}
                          onChange={(e) => updateProduct(index, { unitPrice: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Reorder level</Label>
                        <Input
                          type="number"
                          className="mt-1"
                          value={product.reorderLevel}
                          onChange={(e) => updateProduct(index, { reorderLevel: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setProducts([...products, emptyProduct()])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add another product
                </Button>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button onClick={saveProducts} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save products
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <PartyPopper className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-card-foreground mb-2">
                  You're ready to go{business.companyName ? `, ${business.companyName}` : ""}!
                </h1>
                <p className="text-muted-foreground">
                  {warehouse.name ? `${warehouse.name} is set up` : "Your workspace is set up"} with{" "}
                  {savedProducts + importedCount} product
                  {savedProducts + importedCount === 1 ? "" : "s"}. Next: record incoming stock,
                  print receipts and watch your expiry alerts.
                </p>
              </div>
              <Button size="lg" onClick={finish}>
                Go to my dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      <CsvImportDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
        defaultLocation={warehouse.name || undefined}
        onImported={(count) => setImportedCount((prev) => prev + count)}
      />
    </div>
  );
};

const Onboarding = () => (
  <EmailVerificationGuard>
    <OnboardingContent />
  </EmailVerificationGuard>
);

export default Onboarding;
