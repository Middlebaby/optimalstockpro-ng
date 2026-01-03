import { useState } from "react";
import { Plus, FileText, Search, Send, Check, Clock, X, Download, Eye } from "lucide-react";
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

interface PurchaseOrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: "draft" | "sent" | "confirmed" | "received" | "cancelled";
  items: PurchaseOrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  createdDate: string;
  expectedDelivery: string;
  deliveryAddress: string;
  notes?: string;
  createdBy: string;
}

const PurchaseOrders = () => {
  const [orders] = useState<PurchaseOrder[]>([
    {
      id: "1",
      poNumber: "PO-2026-001",
      supplier: "Dangote Cement",
      status: "confirmed",
      items: [
        { id: "1", name: "Premium Cement", quantity: 500, unit: "bags", unitPrice: 4500 },
        { id: "2", name: "Binding Wire", quantity: 50, unit: "rolls", unitPrice: 2500 },
      ],
      subtotal: 2375000,
      vat: 178125,
      total: 2553125,
      createdDate: "2026-01-02",
      expectedDelivery: "2026-01-10",
      deliveryAddress: "Main Warehouse, Industrial Estate, Ikeja",
      notes: "Urgent delivery needed for VI project",
      createdBy: "Chidi Okonkwo"
    },
    {
      id: "2",
      poNumber: "PO-2026-002",
      supplier: "Steel Masters Nigeria",
      status: "sent",
      items: [
        { id: "1", name: "Steel Rods (12mm)", quantity: 1000, unit: "pieces", unitPrice: 2500 },
        { id: "2", name: "Steel Rods (16mm)", quantity: 500, unit: "pieces", unitPrice: 3500 },
      ],
      subtotal: 4250000,
      vat: 318750,
      total: 4568750,
      createdDate: "2026-01-03",
      expectedDelivery: "2026-01-15",
      deliveryAddress: "VI Site Office, Adeola Odeku, Victoria Island",
      createdBy: "Amina Ibrahim"
    },
    {
      id: "3",
      poNumber: "PO-2025-098",
      supplier: "Dulux Nigeria",
      status: "received",
      items: [
        { id: "1", name: "Paint - White", quantity: 100, unit: "buckets", unitPrice: 8000 },
        { id: "2", name: "Paint - Cream", quantity: 50, unit: "buckets", unitPrice: 8500 },
      ],
      subtotal: 1225000,
      vat: 91875,
      total: 1316875,
      createdDate: "2025-12-20",
      expectedDelivery: "2025-12-28",
      deliveryAddress: "Lekki Store, Admiralty Way, Lekki Phase 1",
      createdBy: "Tunde Adeyemi"
    },
    {
      id: "4",
      poNumber: "PO-2026-003",
      supplier: "Pipe World Ltd",
      status: "draft",
      items: [
        { id: "1", name: "PVC Pipes (4 inch)", quantity: 200, unit: "pieces", unitPrice: 3500 },
      ],
      subtotal: 700000,
      vat: 52500,
      total: 752500,
      createdDate: "2026-01-03",
      expectedDelivery: "2026-01-20",
      deliveryAddress: "Main Warehouse, Industrial Estate, Ikeja",
      createdBy: "Ngozi Eze"
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getStatusIcon = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "draft": return <FileText className="w-4 h-4" />;
      case "sent": return <Send className="w-4 h-4" />;
      case "confirmed": return <Check className="w-4 h-4" />;
      case "received": return <Check className="w-4 h-4" />;
      case "cancelled": return <X className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "draft": return "bg-muted text-muted-foreground";
      case "sent": return "bg-primary/10 text-primary";
      case "confirmed": return "bg-accent/10 text-accent";
      case "received": return "bg-green-500/10 text-green-600";
      case "cancelled": return "bg-destructive/10 text-destructive";
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "sent" || o.status === "confirmed").length,
    totalValue: orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Purchase Orders
            </h1>
            <Badge variant="outline" className="text-xs">Professional</Badge>
          </div>
          <p className="text-muted-foreground">
            Create and manage purchase orders for suppliers
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dangote">Dangote Cement</SelectItem>
                      <SelectItem value="steel">Steel Masters Nigeria</SelectItem>
                      <SelectItem value="dulux">Dulux Nigeria</SelectItem>
                      <SelectItem value="pipe">Pipe World Ltd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expected Delivery *</Label>
                  <Input type="date" className="mt-1" />
                </div>
              </div>
              
              <div>
                <Label>Delivery Address *</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select delivery location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">Main Warehouse, Industrial Estate, Ikeja</SelectItem>
                    <SelectItem value="vi">VI Site Office, Adeola Odeku, Victoria Island</SelectItem>
                    <SelectItem value="lekki">Lekki Store, Admiralty Way, Lekki Phase 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label>Order Items</Label>
                  <Button variant="outline" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium">
                    <div className="col-span-5">Item</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Unit</div>
                    <div className="col-span-3">Price</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cement">Premium Cement</SelectItem>
                          <SelectItem value="steel12">Steel Rods (12mm)</SelectItem>
                          <SelectItem value="steel16">Steel Rods (16mm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" placeholder="0" />
                    </div>
                    <div className="col-span-2">
                      <Input placeholder="bags" disabled />
                    </div>
                    <div className="col-span-3">
                      <Input placeholder="₦0" disabled />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea className="mt-1" placeholder="Additional instructions or notes..." />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button variant="outline">Save as Draft</Button>
                <Button onClick={() => setIsDialogOpen(false)}>Create & Send</Button>
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
          <p className="text-sm text-muted-foreground">Pending Delivery</p>
          <p className="text-2xl font-heading font-bold text-primary">{stats.pending}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-heading font-bold text-foreground">₦{(stats.totalValue / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by PO number or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">PO Number</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Supplier</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Items</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Total</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Expected</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-medium text-card-foreground">{order.poNumber}</p>
                    <p className="text-xs text-muted-foreground">Created {order.createdDate}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-card-foreground">{order.supplier}</td>
                  <td className="py-4 px-4 text-sm text-card-foreground">{order.items.length} items</td>
                  <td className="py-4 px-4 text-sm font-medium text-card-foreground">
                    ₦{order.total.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-sm text-card-foreground">{order.expectedDelivery}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">{selectedOrder.poNumber}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{selectedOrder.supplier}</p>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created By</p>
                  <p className="text-foreground">{selectedOrder.createdBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Delivery</p>
                  <p className="text-foreground">{selectedOrder.expectedDelivery}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Delivery Address</p>
                  <p className="text-foreground">{selectedOrder.deliveryAddress}</p>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Qty</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Unit Price</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-b border-border/50">
                        <td className="py-3 px-4 text-sm text-card-foreground">{item.name}</td>
                        <td className="py-3 px-4 text-sm text-card-foreground">{item.quantity} {item.unit}</td>
                        <td className="py-3 px-4 text-sm text-card-foreground">₦{item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-right text-card-foreground">₦{(item.quantity * item.unitPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-b border-border/50">
                      <td colSpan={3} className="py-2 px-4 text-sm text-right text-muted-foreground">Subtotal</td>
                      <td className="py-2 px-4 text-sm text-right text-card-foreground">₦{selectedOrder.subtotal.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td colSpan={3} className="py-2 px-4 text-sm text-right text-muted-foreground">VAT (7.5%)</td>
                      <td className="py-2 px-4 text-sm text-right text-card-foreground">₦{selectedOrder.vat.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-sm text-right font-medium text-foreground">Total</td>
                      <td className="py-3 px-4 text-sm text-right font-bold text-foreground">₦{selectedOrder.total.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedOrder.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm text-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                {selectedOrder.status === "draft" && (
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    Send to Supplier
                  </Button>
                )}
                {selectedOrder.status === "confirmed" && (
                  <Button>
                    <Check className="w-4 h-4 mr-2" />
                    Mark as Received
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PurchaseOrders;
