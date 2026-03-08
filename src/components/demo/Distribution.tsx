import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Package, MapPin, Phone, Clock, AlertTriangle, Plus, MessageCircle,
  TrendingUp, DollarSign, Truck, RefreshCw, Send, User, Edit2, Trash2,
  CheckCircle2, XCircle, Eye, CreditCard, BarChart3, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, differenceInDays, parseISO } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────
interface Location {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

interface Batch {
  id: string;
  batch_number: string;
  product_name: string;
  quantity_produced: number;
  quantity_remaining: number;
  unit_price: number;
  production_date: string;
  expiry_date: string | null;
  status: string;
  notes: string | null;
}

interface Distribution {
  id: string;
  location_id: string;
  batch_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  status: string;
  distributed_at: string;
  notes: string | null;
  // joined
  location_name?: string;
  batch_number?: string;
  product_name?: string;
}

interface Sale {
  id: string;
  location_id: string;
  distribution_id: string | null;
  product_name: string;
  units_sold: number;
  unit_price: number;
  revenue: number;
  returns: number;
  sale_date: string;
  notes: string | null;
  location_name?: string;
}

// ─── Component ───────────────────────────────────────────────────────
const Distribution = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("locations");
  const [loading, setLoading] = useState(true);

  // Data
  const [locations, setLocations] = useState<Location[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Dialogs
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // Forms
  const [locForm, setLocForm] = useState({ name: "", contact_person: "", phone: "", address: "", notes: "" });
  const [batchForm, setBatchForm] = useState({ product_name: "", quantity_produced: "", unit_price: "", production_date: format(new Date(), "yyyy-MM-dd"), expiry_date: "", notes: "" });
  const [distForm, setDistForm] = useState({ location_id: "", batch_id: "", quantity: "", notes: "" });
  const [saleForm, setSaleForm] = useState({ location_id: "", product_name: "", units_sold: "", unit_price: "", returns: "0", sale_date: format(new Date(), "yyyy-MM-dd"), notes: "" });
  const [paymentForm, setPaymentForm] = useState({ distribution_id: "", amount: "" });

  const [saving, setSaving] = useState(false);

  // ─── Fetch All Data ──────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [locRes, batchRes, distRes, salesRes] = await Promise.all([
      supabase.from("distribution_locations").select("*").eq("user_id", user.id).order("name"),
      supabase.from("production_batches").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("distributions").select("*, distribution_locations(name), production_batches(batch_number, product_name)").eq("user_id", user.id).order("distributed_at", { ascending: false }),
      supabase.from("distribution_sales").select("*, distribution_locations(name)").eq("user_id", user.id).order("sale_date", { ascending: false }).limit(50),
    ]);

    setLocations(locRes.data || []);
    setBatches(batchRes.data || []);
    setDistributions(
      (distRes.data || []).map((d: any) => ({
        ...d,
        location_name: d.distribution_locations?.name,
        batch_number: d.production_batches?.batch_number,
        product_name: d.production_batches?.product_name,
      }))
    );
    setSales(
      (salesRes.data || []).map((s: any) => ({
        ...s,
        location_name: s.distribution_locations?.name,
      }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Helpers ─────────────────────────────────────────────────────
  const getDaysToExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    return differenceInDays(parseISO(expiryDate), new Date());
  };

  const generateBatchNumber = () => {
    const d = format(new Date(), "ddMMyy");
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `BATCH-${d}-${rand}`;
  };

  // ─── CRUD: Locations ─────────────────────────────────────────────
  const handleSaveLocation = async () => {
    if (!user || !locForm.name.trim()) return;
    setSaving(true);
    try {
      if (editingLocation) {
        const { error } = await supabase.from("distribution_locations").update({
          name: locForm.name, contact_person: locForm.contact_person || null,
          phone: locForm.phone || null, address: locForm.address || null, notes: locForm.notes || null,
        }).eq("id", editingLocation.id);
        if (error) throw error;
        toast.success("Location updated");
      } else {
        const { error } = await supabase.from("distribution_locations").insert({
          user_id: user.id, name: locForm.name, contact_person: locForm.contact_person || null,
          phone: locForm.phone || null, address: locForm.address || null, notes: locForm.notes || null,
        });
        if (error) throw error;
        toast.success("Location added");
      }
      setShowLocationDialog(false);
      setEditingLocation(null);
      setLocForm({ name: "", contact_person: "", phone: "", address: "", notes: "" });
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    const { error } = await supabase.from("distribution_locations").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Location deleted");
    fetchAll();
  };

  const openEditLocation = (loc: Location) => {
    setEditingLocation(loc);
    setLocForm({ name: loc.name, contact_person: loc.contact_person || "", phone: loc.phone || "", address: loc.address || "", notes: loc.notes || "" });
    setShowLocationDialog(true);
  };

  // ─── CRUD: Production Batches ─────────────────────────────────────
  const handleSaveBatch = async () => {
    if (!user || !batchForm.product_name.trim() || !batchForm.quantity_produced) return;
    setSaving(true);
    try {
      const qty = parseInt(batchForm.quantity_produced);
      const { error } = await supabase.from("production_batches").insert({
        user_id: user.id,
        batch_number: generateBatchNumber(),
        product_name: batchForm.product_name,
        quantity_produced: qty,
        quantity_remaining: qty,
        unit_price: parseFloat(batchForm.unit_price) || 0,
        production_date: batchForm.production_date,
        expiry_date: batchForm.expiry_date || null,
        notes: batchForm.notes || null,
      });
      if (error) throw error;
      toast.success("Production batch recorded!");
      setShowBatchDialog(false);
      setBatchForm({ product_name: "", quantity_produced: "", unit_price: "", production_date: format(new Date(), "yyyy-MM-dd"), expiry_date: "", notes: "" });
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── CRUD: Distributions ──────────────────────────────────────────
  const handleDistribute = async () => {
    if (!user || !distForm.location_id || !distForm.batch_id || !distForm.quantity) return;
    setSaving(true);
    try {
      const qty = parseInt(distForm.quantity);
      const batch = batches.find((b) => b.id === distForm.batch_id);
      if (!batch) throw new Error("Batch not found");
      if (qty > batch.quantity_remaining) throw new Error(`Only ${batch.quantity_remaining} units available in this batch`);

      const unitPrice = batch.unit_price;
      const totalAmount = qty * unitPrice;

      const { error: distError } = await supabase.from("distributions").insert({
        user_id: user.id,
        location_id: distForm.location_id,
        batch_id: distForm.batch_id,
        quantity: qty,
        unit_price: unitPrice,
        total_amount: totalAmount,
        amount_paid: 0,
        amount_due: totalAmount,
        status: "delivered",
        notes: distForm.notes || null,
      });
      if (distError) throw distError;

      // Reduce batch quantity
      const newRemaining = batch.quantity_remaining - qty;
      const { error: batchError } = await supabase.from("production_batches").update({
        quantity_remaining: newRemaining,
        status: newRemaining <= 0 ? "fully_distributed" : "active",
      }).eq("id", batch.id);
      if (batchError) throw batchError;

      toast.success(`${qty} units distributed successfully!`);
      setShowDistributeDialog(false);
      setDistForm({ location_id: "", batch_id: "", quantity: "", notes: "" });
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── CRUD: Sales ──────────────────────────────────────────────────
  const handleRecordSale = async () => {
    if (!user || !saleForm.location_id || !saleForm.product_name || !saleForm.units_sold) return;
    setSaving(true);
    try {
      const unitsSold = parseInt(saleForm.units_sold);
      const unitPrice = parseFloat(saleForm.unit_price) || 0;
      const returns = parseInt(saleForm.returns) || 0;

      const { error } = await supabase.from("distribution_sales").insert({
        user_id: user.id,
        location_id: saleForm.location_id,
        product_name: saleForm.product_name,
        units_sold: unitsSold,
        unit_price: unitPrice,
        revenue: unitsSold * unitPrice,
        returns,
        sale_date: saleForm.sale_date,
        notes: saleForm.notes || null,
      });
      if (error) throw error;
      toast.success("Sale recorded!");
      setShowSaleDialog(false);
      setSaleForm({ location_id: "", product_name: "", units_sold: "", unit_price: "", returns: "0", sale_date: format(new Date(), "yyyy-MM-dd"), notes: "" });
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Record Payment ───────────────────────────────────────────────
  const handleRecordPayment = async () => {
    if (!paymentForm.distribution_id || !paymentForm.amount) return;
    setSaving(true);
    try {
      const dist = distributions.find((d) => d.id === paymentForm.distribution_id);
      if (!dist) throw new Error("Distribution not found");

      const payment = parseFloat(paymentForm.amount);
      if (payment > dist.amount_due) throw new Error("Payment exceeds amount due");

      const newPaid = dist.amount_paid + payment;
      const newDue = dist.amount_due - payment;

      const { error } = await supabase.from("distributions").update({
        amount_paid: newPaid,
        amount_due: newDue,
        status: newDue <= 0 ? "paid" : "delivered",
      }).eq("id", dist.id);
      if (error) throw error;

      toast.success(`₦${payment.toLocaleString()} payment recorded!`);
      setShowPaymentDialog(false);
      setPaymentForm({ distribution_id: "", amount: "" });
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── WhatsApp Stock Count Request ─────────────────────────────────
  const handleSendWhatsApp = (loc: Location) => {
    if (!loc.phone) { toast.error("No phone number for this location"); return; }
    const message = encodeURIComponent(
      `STOCK COUNT REQUEST - ${loc.name}\n\nHi ${loc.contact_person || "there"},\n\nPlease send today's stock count.\n\nFormat:\nSTOCK COUNT - ${loc.name}\n[Product]: [units remaining]\n\nThank you!`
    );
    const phone = loc.phone.replace(/[\s-]/g, "").replace(/^0/, "234");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    toast.success(`WhatsApp opened for ${loc.name}`);
  };

  // ─── Computed Stats ───────────────────────────────────────────────
  const totalWarehouseStock = batches.filter((b) => b.status === "active").reduce((s, b) => s + b.quantity_remaining, 0);
  const totalDistributed = distributions.reduce((s, d) => s + d.quantity, 0);
  const totalOutstanding = distributions.reduce((s, d) => s + d.amount_due, 0);
  const totalRevenue = sales.reduce((s, x) => s + x.revenue, 0);
  const activeBatchCount = batches.filter((b) => b.status === "active").length;
  const expiringBatches = batches.filter((b) => {
    const days = getDaysToExpiry(b.expiry_date);
    return days !== null && days <= 10 && days > 0 && b.status === "active";
  });
  const warehouseValue = batches.filter((b) => b.status === "active").reduce((s, b) => s + b.quantity_remaining * b.unit_price, 0);

  // Location summaries
  const locationSummaries = locations.map((loc) => {
    const locDists = distributions.filter((d) => d.location_id === loc.id);
    const locSales = sales.filter((s) => s.location_id === loc.id);
    const totalUnits = locDists.reduce((s, d) => s + d.quantity, 0);
    const totalDue = locDists.reduce((s, d) => s + d.amount_due, 0);
    const totalPaid = locDists.reduce((s, d) => s + d.amount_paid, 0);
    const totalSold = locSales.reduce((s, x) => s + x.units_sold, 0);
    const totalReturns = locSales.reduce((s, x) => s + x.returns, 0);
    const locRevenue = locSales.reduce((s, x) => s + x.revenue, 0);
    const sellThrough = totalUnits > 0 ? Math.round((totalSold / totalUnits) * 100) : 0;
    return { ...loc, totalUnits, totalDue, totalPaid, totalSold, totalReturns, locRevenue, sellThrough };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Distribution Hub</h1>
          <p className="text-muted-foreground">Production → Distribution → Sales → Payments — all in one place</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { setBatchForm({ product_name: "", quantity_produced: "", unit_price: "", production_date: format(new Date(), "yyyy-MM-dd"), expiry_date: "", notes: "" }); setShowBatchDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Batch
          </Button>
          <Button variant="outline" onClick={() => { setDistForm({ location_id: "", batch_id: "", quantity: "", notes: "" }); setShowDistributeDialog(true); }}>
            <Truck className="w-4 h-4 mr-2" />
            Distribute
          </Button>
          <Button onClick={() => { setSaleForm({ location_id: "", product_name: "", units_sold: "", unit_price: "", returns: "0", sale_date: format(new Date(), "yyyy-MM-dd"), notes: "" }); setShowSaleDialog(true); }}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Record Sale
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Package className="w-4 h-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">In Warehouse</p>
                <p className="text-xl font-bold">{totalWarehouseStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg"><Truck className="w-4 h-4 text-accent" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Distributed</p>
                <p className="text-xl font-bold">{totalDistributed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><DollarSign className="w-4 h-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Warehouse Value</p>
                <p className="text-xl font-bold">₦{warehouseValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={totalOutstanding > 0 ? "ring-2 ring-destructive/20" : ""}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${totalOutstanding > 0 ? "bg-destructive/10" : "bg-muted"}`}>
                <Clock className={`w-4 h-4 ${totalOutstanding > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold">₦{totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="w-4 h-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">₦{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={expiringBatches.length > 0 ? "ring-2 ring-destructive/20" : ""}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${expiringBatches.length > 0 ? "bg-destructive/10" : "bg-muted"}`}>
                <AlertTriangle className={`w-4 h-4 ${expiringBatches.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
                <p className="text-xl font-bold">{expiringBatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Batches Alert */}
      {expiringBatches.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">⚠️ Expiring batches need urgent distribution!</p>
                <div className="mt-2 space-y-1">
                  {expiringBatches.map((b) => (
                    <p key={b.id} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{b.product_name}</span> — Batch {b.batch_number}: {b.quantity_remaining} units, expires in <span className="text-destructive font-medium">{getDaysToExpiry(b.expiry_date)} days</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="locations" className="gap-1.5">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Locations</span>
          </TabsTrigger>
          <TabsTrigger value="batches" className="gap-1.5">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Batches</span>
          </TabsTrigger>
          <TabsTrigger value="distributions" className="gap-1.5">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Distributions</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Sales</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── Locations Tab ──────────────────────────────────────── */}
        <TabsContent value="locations" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{locations.length} retail location{locations.length !== 1 ? "s" : ""}</p>
            <Button size="sm" onClick={() => { setEditingLocation(null); setLocForm({ name: "", contact_person: "", phone: "", address: "", notes: "" }); setShowLocationDialog(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Location
            </Button>
          </div>

          {locations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No retail locations yet</h3>
                <p className="text-muted-foreground mb-4">Add your first retail location to start tracking distribution</p>
                <Button onClick={() => { setEditingLocation(null); setLocForm({ name: "", contact_person: "", phone: "", address: "", notes: "" }); setShowLocationDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Add First Location
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {locationSummaries.map((loc) => (
                <Card key={loc.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{loc.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                          {loc.contact_person && <><User className="w-3 h-3" /><span>{loc.contact_person}</span></>}
                          {loc.phone && <><Phone className="w-3 h-3 ml-1" /><span>{loc.phone}</span></>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditLocation(loc)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteLocation(loc.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-muted-foreground">Received</p>
                        <p className="text-lg font-bold">{loc.totalUnits}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-muted-foreground">Sold</p>
                        <p className="text-lg font-bold text-primary">{loc.totalSold}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-muted-foreground">Sell-through</p>
                        <p className="text-lg font-bold">{loc.sellThrough}%</p>
                      </div>
                    </div>

                    {loc.sellThrough > 0 && (
                      <Progress value={loc.sellThrough} className="h-2" />
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Revenue: <span className="text-primary font-medium">₦{loc.locRevenue.toLocaleString()}</span></span>
                      {loc.totalDue > 0 && (
                        <Badge variant="outline" className="text-destructive border-destructive/30">
                          ₦{loc.totalDue.toLocaleString()} due
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {loc.phone && (
                        <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => handleSendWhatsApp(loc)}>
                          <MessageCircle className="w-3.5 h-3.5" />
                          Stock Count
                        </Button>
                      )}
                      {loc.totalDue > 0 && (
                        <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => {
                          const unpaid = distributions.find((d) => d.location_id === loc.id && d.amount_due > 0);
                          if (unpaid) { setPaymentForm({ distribution_id: unpaid.id, amount: "" }); setShowPaymentDialog(true); }
                        }}>
                          <CreditCard className="w-3.5 h-3.5" />
                          Record Payment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Batches Tab ────────────────────────────────────────── */}
        <TabsContent value="batches" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{batches.length} batch{batches.length !== 1 ? "es" : ""} ({activeBatchCount} active)</p>
            <Button size="sm" onClick={() => { setBatchForm({ product_name: "", quantity_produced: "", unit_price: "", production_date: format(new Date(), "yyyy-MM-dd"), expiry_date: "", notes: "" }); setShowBatchDialog(true); }}>
              <Plus className="w-4 h-4 mr-1" /> New Batch
            </Button>
          </div>

          {batches.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No production batches</h3>
                <p className="text-muted-foreground mb-4">Record your first production batch to start tracking</p>
                <Button onClick={() => setShowBatchDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Record First Batch
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Produced</TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((batch) => {
                        const daysLeft = getDaysToExpiry(batch.expiry_date);
                        const distributed = batch.quantity_produced - batch.quantity_remaining;
                        const distPercent = batch.quantity_produced > 0 ? Math.round((distributed / batch.quantity_produced) * 100) : 0;
                        return (
                          <TableRow key={batch.id}>
                            <TableCell className="font-mono text-xs">{batch.batch_number}</TableCell>
                            <TableCell className="font-medium">{batch.product_name}</TableCell>
                            <TableCell className="text-right">{batch.quantity_produced}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-medium">{batch.quantity_remaining}</span>
                                <span className="text-xs text-muted-foreground">({distPercent}% out)</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {batch.expiry_date ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">{format(parseISO(batch.expiry_date), "MMM d")}</span>
                                  {daysLeft !== null && (
                                    <Badge variant={daysLeft <= 7 ? "destructive" : daysLeft <= 14 ? "secondary" : "outline"} className="text-[10px]">
                                      {daysLeft <= 0 ? "EXPIRED" : `${daysLeft}d`}
                                    </Badge>
                                  )}
                                </div>
                              ) : <span className="text-muted-foreground text-sm">—</span>}
                            </TableCell>
                            <TableCell>
                              <Badge variant={batch.status === "active" ? "default" : "secondary"}>
                                {batch.status === "fully_distributed" ? "Distributed" : batch.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">₦{(batch.quantity_remaining * batch.unit_price).toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Distributions Tab ──────────────────────────────────── */}
        <TabsContent value="distributions" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{distributions.length} distribution{distributions.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setPaymentForm({ distribution_id: "", amount: "" }); setShowPaymentDialog(true); }}>
                <CreditCard className="w-4 h-4 mr-1" /> Record Payment
              </Button>
              <Button size="sm" onClick={() => { setDistForm({ location_id: "", batch_id: "", quantity: "", notes: "" }); setShowDistributeDialog(true); }}>
                <Truck className="w-4 h-4 mr-1" /> Distribute
              </Button>
            </div>
          </div>

          {distributions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Truck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No distributions yet</h3>
                <p className="text-muted-foreground mb-4">Add locations and batches first, then distribute stock</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Due</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributions.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="text-sm">{format(new Date(d.distributed_at), "MMM d")}</TableCell>
                          <TableCell className="font-medium">{d.location_name}</TableCell>
                          <TableCell className="text-sm">{d.product_name}</TableCell>
                          <TableCell className="text-right">{d.quantity}</TableCell>
                          <TableCell className="text-right">₦{d.total_amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-primary">₦{d.amount_paid.toLocaleString()}</TableCell>
                          <TableCell className={`text-right font-medium ${d.amount_due > 0 ? "text-destructive" : ""}`}>
                            ₦{d.amount_due.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={d.status === "paid" ? "default" : d.amount_due > 0 ? "destructive" : "secondary"}>
                              {d.status === "paid" ? "Paid" : d.amount_due > 0 ? "Owing" : d.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Sales Tab ──────────────────────────────────────────── */}
        <TabsContent value="sales" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{sales.length} sale record{sales.length !== 1 ? "s" : ""}</p>
            <Button size="sm" onClick={() => { setSaleForm({ location_id: "", product_name: "", units_sold: "", unit_price: "", returns: "0", sale_date: format(new Date(), "yyyy-MM-dd"), notes: "" }); setShowSaleDialog(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Record Sale
            </Button>
          </div>

          {/* WhatsApp Integration Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">WhatsApp Sales Reporting</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Request daily stock counts from your retail locations via WhatsApp. Go to the <button className="underline text-primary" onClick={() => setActiveTab("locations")}>Locations tab</button> to send requests.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {sales.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sales recorded yet</h3>
                <p className="text-muted-foreground mb-4">Start recording daily sales from your retail locations</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Returns</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm">{format(parseISO(s.sale_date), "MMM d")}</TableCell>
                        <TableCell className="font-medium">{s.location_name}</TableCell>
                        <TableCell>{s.product_name}</TableCell>
                        <TableCell className="text-right">{s.units_sold}</TableCell>
                        <TableCell className={`text-right ${s.returns > 0 ? "text-destructive" : ""}`}>{s.returns}</TableCell>
                        <TableCell className="text-right font-medium text-primary">₦{s.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════
          DIALOGS
         ═══════════════════════════════════════════════════════════════ */}

      {/* Location Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLocation ? "Edit Location" : "Add Retail Location"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Location Name *</Label><Input placeholder="e.g., Shoprite Ikeja" value={locForm.name} onChange={(e) => setLocForm({ ...locForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Contact Person</Label><Input placeholder="e.g., Mr. Adebayo" value={locForm.contact_person} onChange={(e) => setLocForm({ ...locForm, contact_person: e.target.value })} /></div>
              <div><Label>Phone Number</Label><Input placeholder="0801-234-5678" value={locForm.phone} onChange={(e) => setLocForm({ ...locForm, phone: e.target.value })} /></div>
            </div>
            <div><Label>Address</Label><Input placeholder="Shop address" value={locForm.address} onChange={(e) => setLocForm({ ...locForm, address: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea placeholder="Any notes..." value={locForm.notes} onChange={(e) => setLocForm({ ...locForm, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveLocation} disabled={saving || !locForm.name.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingLocation ? "Update" : "Add Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Production Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Product Name *</Label><Input placeholder="e.g., Strawberry Yoghurt 200ml" value={batchForm.product_name} onChange={(e) => setBatchForm({ ...batchForm, product_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Quantity Produced *</Label><Input type="number" placeholder="0" value={batchForm.quantity_produced} onChange={(e) => setBatchForm({ ...batchForm, quantity_produced: e.target.value })} /></div>
              <div><Label>Unit Price (₦)</Label><Input type="number" placeholder="300" value={batchForm.unit_price} onChange={(e) => setBatchForm({ ...batchForm, unit_price: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Production Date</Label><Input type="date" value={batchForm.production_date} onChange={(e) => setBatchForm({ ...batchForm, production_date: e.target.value })} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={batchForm.expiry_date} onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })} /></div>
            </div>
            <div><Label>Notes</Label><Textarea placeholder="Batch notes..." value={batchForm.notes} onChange={(e) => setBatchForm({ ...batchForm, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveBatch} disabled={saving || !batchForm.product_name.trim() || !batchForm.quantity_produced}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Distribute Dialog */}
      <Dialog open={showDistributeDialog} onOpenChange={setShowDistributeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Distribute Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Retail Location *</Label>
              <Select value={distForm.location_id} onValueChange={(v) => setDistForm({ ...distForm, location_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Production Batch *</Label>
              <Select value={distForm.batch_id} onValueChange={(v) => setDistForm({ ...distForm, batch_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>
                  {batches.filter((b) => b.status === "active" && b.quantity_remaining > 0).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.product_name} — {b.batch_number} ({b.quantity_remaining} left)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Quantity *</Label><Input type="number" placeholder="0" value={distForm.quantity} onChange={(e) => setDistForm({ ...distForm, quantity: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea placeholder="Distribution notes..." value={distForm.notes} onChange={(e) => setDistForm({ ...distForm, notes: e.target.value })} /></div>
            {distForm.batch_id && distForm.quantity && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p>Total: <span className="font-bold">₦{((parseInt(distForm.quantity) || 0) * (batches.find((b) => b.id === distForm.batch_id)?.unit_price || 0)).toLocaleString()}</span></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleDistribute} disabled={saving || !distForm.location_id || !distForm.batch_id || !distForm.quantity}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Distribute Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sale Dialog */}
      <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Daily Sales</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Retail Location *</Label>
              <Select value={saleForm.location_id} onValueChange={(v) => setSaleForm({ ...saleForm, location_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Product Name *</Label><Input placeholder="e.g., Strawberry Yoghurt 200ml" value={saleForm.product_name} onChange={(e) => setSaleForm({ ...saleForm, product_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Units Sold *</Label><Input type="number" placeholder="0" value={saleForm.units_sold} onChange={(e) => setSaleForm({ ...saleForm, units_sold: e.target.value })} /></div>
              <div><Label>Unit Price (₦)</Label><Input type="number" placeholder="300" value={saleForm.unit_price} onChange={(e) => setSaleForm({ ...saleForm, unit_price: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Returns</Label><Input type="number" placeholder="0" value={saleForm.returns} onChange={(e) => setSaleForm({ ...saleForm, returns: e.target.value })} /></div>
              <div><Label>Sale Date</Label><Input type="date" value={saleForm.sale_date} onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })} /></div>
            </div>
            {saleForm.units_sold && saleForm.unit_price && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p>Revenue: <span className="font-bold text-primary">₦{((parseInt(saleForm.units_sold) || 0) * (parseFloat(saleForm.unit_price) || 0)).toLocaleString()}</span></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleRecordSale} disabled={saving || !saleForm.location_id || !saleForm.product_name || !saleForm.units_sold}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Record Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Distribution *</Label>
              <Select value={paymentForm.distribution_id} onValueChange={(v) => setPaymentForm({ ...paymentForm, distribution_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select distribution" /></SelectTrigger>
                <SelectContent>
                  {distributions.filter((d) => d.amount_due > 0).map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.location_name} — {d.product_name} (₦{d.amount_due.toLocaleString()} due)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Amount (₦)</Label><Input type="number" placeholder="0" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} /></div>
            {paymentForm.distribution_id && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                {(() => {
                  const d = distributions.find((x) => x.id === paymentForm.distribution_id);
                  return d ? <p>Outstanding: <span className="font-bold text-destructive">₦{d.amount_due.toLocaleString()}</span></p> : null;
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleRecordPayment} disabled={saving || !paymentForm.distribution_id || !paymentForm.amount}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Distribution;
