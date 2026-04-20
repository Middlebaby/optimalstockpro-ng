import { useState, useRef, useEffect } from "react";
import {
  Printer, Download, FileText, Receipt, Loader2, Eye, Plus, ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ReceiptData {
  receipt_number: string;
  date: string;
  customer_name: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment_method: string;
  notes: string;
}

interface SaleRecord {
  id: string;
  product_name: string;
  units_sold: number;
  unit_price: number;
  revenue: number;
  sale_date: string;
  location_name?: string;
  location_id: string;
  notes: string | null;
}

const ReceiptPrinter = () => {
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [companyName, setCompanyName] = useState("Optimalstock Pro");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [printerType, setPrinterType] = useState<"thermal" | "pdf">("pdf");

  // Sales data
  const [recentSales, setRecentSales] = useState<SaleRecord[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([]);
  const [deductingInventory, setDeductingInventory] = useState(false);

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"thermal" | "pdf">("pdf");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deductionPreview, setDeductionPreview] = useState<
    Array<{ name: string; requested: number; available: number; willDeduct: number; matched: boolean; newQty: number; invId?: string }>
  >([]);

  // Sales filters
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterLocationId, setFilterLocationId] = useState<string>("all");

  const filteredSales = recentSales.filter((s) => {
    if (filterLocationId !== "all" && s.location_id !== filterLocationId) return false;
    if (filterStartDate && s.sale_date < filterStartDate) return false;
    if (filterEndDate && s.sale_date > filterEndDate) return false;
    return true;
  });

  const uniqueLocations = Array.from(
    new Map(
      recentSales
        .filter((s) => s.location_id)
        .map((s) => [s.location_id, { id: s.location_id, name: s.location_name || "Unknown" }])
    ).values()
  );

  const clearFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterLocationId("all");
  };

  const [receipt, setReceipt] = useState<ReceiptData>({
    receipt_number: `RCT-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString(),
    customer_name: "",
    items: [{ name: "", quantity: 1, unit_price: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    payment_method: "cash",
    notes: "",
  });

  // Load company info from profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("company_name, phone")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        if (data.company_name) setCompanyName(data.company_name);
        if (data.phone) setCompanyPhone(data.phone);
      }
    };
    loadProfile();
  }, [user]);

  // Load recent sales
  useEffect(() => {
    const loadSales = async () => {
      if (!user) return;
      setLoadingSales(true);
      const { data, error } = await supabase
        .from("distribution_sales")
        .select("*, distribution_locations(name)")
        .eq("user_id", user.id)
        .order("sale_date", { ascending: false })
        .limit(50);
      if (!error && data) {
        setRecentSales(
          data.map((s: any) => ({
            ...s,
            location_name: s.distribution_locations?.name,
          }))
        );
      }
      setLoadingSales(false);
    };
    loadSales();
  }, [user]);

  const recalcTotals = (items: ReceiptItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.075;
    return { subtotal, tax, total: subtotal + tax };
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...receipt.items];
    (newItems[index] as any)[field] = value;
    newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    const totals = recalcTotals(newItems);
    setReceipt({ ...receipt, items: newItems, ...totals });
  };

  const addItem = () => {
    setReceipt({
      ...receipt,
      items: [...receipt.items, { name: "", quantity: 1, unit_price: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (receipt.items.length <= 1) return;
    const newItems = receipt.items.filter((_, i) => i !== index);
    const totals = recalcTotals(newItems);
    setReceipt({ ...receipt, items: newItems, ...totals });
  };

  // Populate receipt from selected sales
  const populateFromSales = (saleIds: string[]) => {
    const selected = recentSales.filter((s) => saleIds.includes(s.id));
    if (selected.length === 0) return;

    const items: ReceiptItem[] = selected.map((s) => ({
      name: s.product_name,
      quantity: s.units_sold,
      unit_price: Number(s.unit_price) || 0,
      total: Number(s.revenue) || s.units_sold * (Number(s.unit_price) || 0),
    }));

    const customerName = selected[0].location_name || "";
    const totals = recalcTotals(items);

    setReceipt({
      ...receipt,
      receipt_number: `RCT-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString(),
      customer_name: customerName,
      items,
      ...totals,
      notes: selected.map((s) => s.notes).filter(Boolean).join("; "),
    });

    setSelectedSaleIds(saleIds);
    toast.success(`Receipt populated with ${selected.length} sale(s)`);
  };

  const toggleSaleSelection = (saleId: string) => {
    setSelectedSaleIds((prev) =>
      prev.includes(saleId) ? prev.filter((id) => id !== saleId) : [...prev, saleId]
    );
  };

  const handleLoadSelected = () => {
    if (selectedSaleIds.length === 0) {
      toast.error("Select at least one sale record");
      return;
    }
    populateFromSales(selectedSaleIds);
  };

  // Deduct from inventory_items based on receipt items
  // Build a preview of inventory deductions without writing
  const buildDeductionPreview = async () => {
    if (!user) return [];
    const preview: Array<{ name: string; requested: number; available: number; willDeduct: number; matched: boolean; newQty: number; invId?: string }> = [];
    for (const item of receipt.items) {
      if (!item.name.trim()) continue;
      const { data: invItems } = await supabase
        .from("inventory_items")
        .select("id, quantity, name")
        .eq("user_id", user.id)
        .ilike("name", item.name.trim())
        .limit(1);
      if (invItems && invItems.length > 0) {
        const inv = invItems[0];
        const willDeduct = Math.min(item.quantity, inv.quantity);
        preview.push({
          name: inv.name,
          requested: item.quantity,
          available: inv.quantity,
          willDeduct,
          matched: true,
          newQty: Math.max(0, inv.quantity - item.quantity),
          invId: inv.id,
        });
      } else {
        preview.push({
          name: item.name.trim(),
          requested: item.quantity,
          available: 0,
          willDeduct: 0,
          matched: false,
          newQty: 0,
        });
      }
    }
    return preview;
  };

  // Apply the previewed deductions
  const applyDeductions = async () => {
    if (!user) return { deducted: 0, errors: 0 };
    let deducted = 0;
    let errors = 0;
    for (const row of deductionPreview) {
      if (!row.matched || !row.invId) continue;
      const { error } = await supabase
        .from("inventory_items")
        .update({ quantity: row.newQty })
        .eq("id", row.invId);
      if (!error) {
        deducted++;
        await supabase.from("stock_movements").insert({
          user_id: user.id,
          created_by: user.id,
          inventory_item_id: row.invId,
          movement_type: "outgoing",
          quantity: row.willDeduct,
          notes: `Auto-deducted via receipt ${receipt.receipt_number}`,
        });
      } else {
        errors++;
      }
    }
    return { deducted, errors };
  };

  const formatCurrency = (amount: number) =>
    `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  const openConfirmDialog = async (action: "thermal" | "pdf") => {
    const validItems = receipt.items.filter((i) => i.name.trim());
    if (validItems.length === 0) {
      toast.error("Add at least one item to the receipt");
      return;
    }
    setConfirmAction(action);
    setConfirmOpen(true);
    setConfirmLoading(true);
    const preview = await buildDeductionPreview();
    setDeductionPreview(preview);
    setConfirmLoading(false);
  };

  const handleConfirmAndPrint = async () => {
    setDeductingInventory(true);
    const { deducted, errors } = await applyDeductions();
    setDeductingInventory(false);
    setConfirmOpen(false);

    if (deducted > 0) toast.success(`Inventory deducted for ${deducted} item(s)`);
    if (errors > 0) toast.error(`Failed to deduct ${errors} item(s)`);

    if (confirmAction === "thermal") {
      const printWindow = window.open("", "_blank", "width=300,height=600");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups.");
        return;
      }
      printWindow.document.write(generateThermalHTML());
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      };
      toast.success("Sent to printer");
    } else {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups.");
        return;
      }
      printWindow.document.write(generatePDFHTML());
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
      toast.success("PDF receipt opened for download");
    }
  };

  const generateThermalHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: 80mm auto; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 4mm; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 4px 0; }
        .row { display: flex; justify-content: space-between; padding: 1px 0; }
        .item-name { flex: 1; }
        .item-qty { width: 30px; text-align: center; }
        .item-price { width: 70px; text-align: right; }
        h2 { font-size: 16px; margin-bottom: 2px; }
        .small { font-size: 10px; }
        .total-row { font-size: 14px; font-weight: bold; }
        @media print { body { width: 80mm; } }
      </style>
    </head>
    <body>
      <div class="center">
        <h2 class="bold">${companyName}</h2>
        ${companyAddress ? `<p class="small">${companyAddress}</p>` : ""}
        ${companyPhone ? `<p class="small">Tel: ${companyPhone}</p>` : ""}
      </div>
      <div class="line"></div>
      <div class="row"><span>Receipt: ${receipt.receipt_number}</span></div>
      <div class="row"><span>Date: ${format(new Date(receipt.date), "dd/MM/yyyy HH:mm")}</span></div>
      ${receipt.customer_name ? `<div class="row"><span>Customer: ${receipt.customer_name}</span></div>` : ""}
      <div class="line"></div>
      <div class="row bold">
        <span class="item-name">Item</span>
        <span class="item-qty">Qty</span>
        <span class="item-price">Amount</span>
      </div>
      <div class="line"></div>
      ${receipt.items.filter((item) => item.name).map((item) => `
        <div class="row">
          <span class="item-name">${item.name}</span>
          <span class="item-qty">${item.quantity}</span>
          <span class="item-price">${formatCurrency(item.total)}</span>
        </div>
        <div class="row small"><span>&nbsp;&nbsp;@ ${formatCurrency(item.unit_price)}</span></div>
      `).join("")}
      <div class="line"></div>
      <div class="row"><span>Subtotal</span><span>${formatCurrency(receipt.subtotal)}</span></div>
      <div class="row"><span>VAT (7.5%)</span><span>${formatCurrency(receipt.tax)}</span></div>
      <div class="line"></div>
      <div class="row total-row"><span>TOTAL</span><span>${formatCurrency(receipt.total)}</span></div>
      <div class="line"></div>
      <div class="row"><span>Payment: ${receipt.payment_method.toUpperCase()}</span></div>
      ${receipt.notes ? `<div class="row small"><span>Note: ${receipt.notes}</span></div>` : ""}
      <div class="line"></div>
      <div class="center small" style="margin-top:8px;">
        <p>Thank you for your patronage!</p>
        <p>Powered by OptimalStock Pro</p>
      </div>
    </body>
    </html>
  `;

  const generatePDFHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: A4; margin: 20mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company h1 { font-size: 24px; color: #16a34a; margin-bottom: 4px; }
        .company p { font-size: 12px; color: #666; }
        .receipt-info { text-align: right; }
        .receipt-info h2 { font-size: 20px; color: #333; }
        .receipt-info p { font-size: 12px; color: #666; }
        .customer { background: #f8f9fa; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #16a34a; color: white; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
        .totals { width: 300px; margin-left: auto; }
        .totals .row { display: flex; justify-content: space-between; padding: 6px 0; }
        .totals .total { font-size: 18px; font-weight: bold; border-top: 2px solid #16a34a; padding-top: 8px; margin-top: 4px; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 16px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company">
          <h1>${companyName}</h1>
          ${companyAddress ? `<p>${companyAddress}</p>` : ""}
          ${companyPhone ? `<p>Tel: ${companyPhone}</p>` : ""}
        </div>
        <div class="receipt-info">
          <h2>RECEIPT</h2>
          <p><strong>${receipt.receipt_number}</strong></p>
          <p>Date: ${format(new Date(receipt.date), "dd MMMM yyyy")}</p>
        </div>
      </div>
      ${receipt.customer_name ? `<div class="customer"><strong>Customer:</strong> ${receipt.customer_name}</div>` : ""}
      <table>
        <thead><tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Total</th></tr></thead>
        <tbody>
          ${receipt.items.filter((item) => item.name).map((item) => `
            <tr>
              <td>${item.name}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unit_price)}</td>
              <td class="text-right">${formatCurrency(item.total)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="totals">
        <div class="row"><span>Subtotal</span><span>${formatCurrency(receipt.subtotal)}</span></div>
        <div class="row"><span>VAT (7.5%)</span><span>${formatCurrency(receipt.tax)}</span></div>
        <div class="row total"><span>Total</span><span>${formatCurrency(receipt.total)}</span></div>
      </div>
      <div style="margin-top:20px;">
        <p><strong>Payment Method:</strong> ${receipt.payment_method.charAt(0).toUpperCase() + receipt.payment_method.slice(1)}</p>
        ${receipt.notes ? `<p style="margin-top:8px;"><strong>Notes:</strong> ${receipt.notes}</p>` : ""}
      </div>
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Powered by OptimalStock Pro</p>
      </div>
    </body>
    </html>
  `;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-heading font-bold">Receipt Printer</h2>
          <p className="text-muted-foreground">
            Generate receipts from sales records — inventory auto-deducts on print
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          {printerType === "thermal" ? (
            <Button onClick={handlePrintThermal} disabled={deductingInventory}>
              {deductingInventory ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
              Print Thermal
            </Button>
          ) : (
            <Button onClick={handleDownloadPDF} disabled={deductingInventory}>
              {deductingInventory ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Quick Load from Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Load from Sales Records
          </CardTitle>
          <CardDescription>
            Select sales to auto-populate the receipt. Inventory will be deducted when you print.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSales ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading sales...
            </div>
          ) : recentSales.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No sales records yet. Record sales in the Distribution Hub first.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 border rounded-md bg-muted/30">
                <div>
                  <Label className="text-xs">From date</Label>
                  <Input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">To date</Label>
                  <Input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Location</Label>
                  <Select value={filterLocationId} onValueChange={setFilterLocationId}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {uniqueLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">
                    Showing {filteredSales.length} of {recentSales.length} sale(s)
                  </span>
                  {(filterStartDate || filterEndDate || filterLocationId !== "all") && (
                    <Button size="sm" variant="ghost" onClick={clearFilters} className="h-7 text-xs">
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>

              {filteredSales.length === 0 ? (
                <p className="text-muted-foreground text-sm py-6 text-center border rounded-md">
                  No sales match the selected filters.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
                  {filteredSales.map((sale) => (
                    <label
                      key={sale.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedSaleIds.includes(sale.id) ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSaleIds.includes(sale.id)}
                        onChange={() => toggleSaleSelection(sale.id)}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{sale.product_name}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {sale.location_name || "Unknown"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sale.units_sold} units × ₦{Number(sale.unit_price).toLocaleString()} = ₦{Number(sale.revenue).toLocaleString()} · {sale.sale_date}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleLoadSelected}
                  disabled={selectedSaleIds.length === 0}
                >
                  <Receipt className="w-4 h-4 mr-1" />
                  Load {selectedSaleIds.length} sale(s) into receipt
                </Button>
                {selectedSaleIds.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => setSelectedSaleIds([])}>
                    Clear selection
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receipt Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receipt Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Receipt Number</Label>
                  <Input
                    value={receipt.receipt_number}
                    onChange={(e) => setReceipt({ ...receipt, receipt_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Customer Name (optional)</Label>
                  <Input
                    placeholder="Walk-in customer"
                    value={receipt.customer_name}
                    onChange={(e) => setReceipt({ ...receipt, customer_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Method</Label>
                  <Select value={receipt.payment_method} onValueChange={(v) => setReceipt({ ...receipt, payment_method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card">Card (POS)</SelectItem>
                      <SelectItem value="mobile">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Print Format</Label>
                  <Select value={printerType} onValueChange={(v: "thermal" | "pdf") => setPrinterType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF / A4 Receipt</SelectItem>
                      <SelectItem value="thermal">Thermal (80mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {receipt.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      {index === 0 && <Label className="text-xs">Item Name</Label>}
                      <Input
                        placeholder="Product name"
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <Label className="text-xs">Qty</Label>}
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <Label className="text-xs">Price (₦)</Label>}
                      <Input
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <Label className="text-xs">Total</Label>}
                      <Input readOnly value={formatCurrency(item.total)} className="bg-muted" />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={receipt.items.length <= 1}
                        className="text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="pt-6">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Additional notes for the receipt..."
                value={receipt.notes}
                onChange={(e) => setReceipt({ ...receipt, notes: e.target.value })}
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span>{receipt.items.filter((i) => i.name).length}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(receipt.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (7.5%)</span>
                <span>{formatCurrency(receipt.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(receipt.total)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <Badge variant="secondary">
                  {receipt.payment_method.charAt(0).toUpperCase() + receipt.payment_method.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Format</span>
                <Badge variant="outline">
                  {printerType === "thermal" ? "Thermal 80mm" : "PDF / A4"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Auto-deduct</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Enabled
                </Badge>
              </div>

              <div className="pt-4 space-y-2">
                <Button className="w-full" onClick={printerType === "thermal" ? handlePrintThermal : handleDownloadPDF} disabled={deductingInventory}>
                  {deductingInventory ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                  ) : printerType === "thermal" ? (
                    <><Printer className="w-4 h-4 mr-2" />Print & Deduct</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" />Download & Deduct</>
                  )}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {
                  setReceipt({
                    receipt_number: `RCT-${Date.now().toString(36).toUpperCase()}`,
                    date: new Date().toISOString(),
                    customer_name: "",
                    items: [{ name: "", quantity: 1, unit_price: 0, total: 0 }],
                    subtotal: 0,
                    tax: 0,
                    total: 0,
                    payment_method: "cash",
                    notes: "",
                  });
                  setSelectedSaleIds([]);
                }}>
                  New Receipt
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Company Settings */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Company Details on Receipt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Business Name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Address</Label>
                <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Shop 5, Balogun Market, Lagos" className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="+234 xxx xxx xxxx" className="text-sm" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-6 bg-white text-black font-mono text-sm space-y-2">
            <div className="text-center">
              <p className="text-lg font-bold">{companyName}</p>
              {companyAddress && <p className="text-xs">{companyAddress}</p>}
              {companyPhone && <p className="text-xs">Tel: {companyPhone}</p>}
            </div>
            <Separator className="border-dashed" />
            <div className="flex justify-between text-xs">
              <span>Receipt: {receipt.receipt_number}</span>
              <span>{format(new Date(receipt.date), "dd/MM/yy HH:mm")}</span>
            </div>
            {receipt.customer_name && (
              <p className="text-xs">Customer: {receipt.customer_name}</p>
            )}
            <Separator className="border-dashed" />
            <div className="flex justify-between text-xs font-bold">
              <span className="flex-1">Item</span>
              <span className="w-8 text-center">Qty</span>
              <span className="w-20 text-right">Amount</span>
            </div>
            <Separator className="border-dashed" />
            {receipt.items.filter((item) => item.name).map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs">
                  <span className="flex-1">{item.name}</span>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <span className="w-20 text-right">{formatCurrency(item.total)}</span>
                </div>
                <p className="text-[10px] text-gray-500 ml-2">@ {formatCurrency(item.unit_price)}</p>
              </div>
            ))}
            <Separator className="border-dashed" />
            <div className="flex justify-between text-xs">
              <span>Subtotal</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>VAT (7.5%)</span>
              <span>{formatCurrency(receipt.tax)}</span>
            </div>
            <Separator className="border-dashed" />
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(receipt.total)}</span>
            </div>
            <Separator className="border-dashed" />
            <p className="text-xs">Payment: {receipt.payment_method.toUpperCase()}</p>
            {receipt.notes && <p className="text-xs text-gray-500">Note: {receipt.notes}</p>}
            <Separator className="border-dashed" />
            <div className="text-center text-xs text-gray-500 pt-2">
              <p>Thank you for your patronage!</p>
              <p>Powered by OptimalStock Pro</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptPrinter;
