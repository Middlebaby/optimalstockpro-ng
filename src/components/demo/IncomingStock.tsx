import { useState } from "react";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IncomingRecord {
  id: string;
  date: string;
  item: string;
  quantity: number;
  supplier: string;
  staff: string;
  notes: string;
}

const IncomingStock = () => {
  const [records, setRecords] = useState<IncomingRecord[]>([
    { id: "1", date: "2026-01-02", item: "Steel Rods (12mm)", quantity: 100, supplier: "Steel Masters", staff: "Amina I.", notes: "Delivery on time" },
    { id: "2", date: "2026-01-01", item: "Nails (Box)", quantity: 500, supplier: "Hardware Plus", staff: "Chidi O.", notes: "" },
    { id: "3", date: "2025-12-30", item: "Premium Cement", quantity: 200, supplier: "Dangote Cement", staff: "Tunde A.", notes: "Checked all bags" },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    item: "",
    quantity: 0,
    supplier: "",
    staff: "",
    notes: "",
  });

  const items = ["Premium Cement", "Steel Rods (12mm)", "Paint - White", "Plywood Sheets", "PVC Pipes", "Electrical Wire", "Nails (Box)"];

  const handleAddRecord = () => {
    if (newRecord.item && newRecord.quantity > 0 && newRecord.staff) {
      setRecords([{ ...newRecord, id: Date.now().toString() }, ...records]);
      setNewRecord({
        date: new Date().toISOString().split("T")[0],
        item: "",
        quantity: 0,
        supplier: "",
        staff: "",
        notes: "",
      });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Incoming Stock
          </h1>
          <p className="text-muted-foreground">
            Record stock arrivals and deliveries
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="item">Item *</Label>
                  <Select
                    value={newRecord.item}
                    onValueChange={(value) => setNewRecord({ ...newRecord, item: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newRecord.quantity}
                    onChange={(e) => setNewRecord({ ...newRecord, quantity: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={newRecord.supplier}
                    onChange={(e) => setNewRecord({ ...newRecord, supplier: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="staff">Staff Name *</Label>
                <Input
                  id="staff"
                  value={newRecord.staff}
                  onChange={(e) => setNewRecord({ ...newRecord, staff: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRecord}>Record</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Item</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Quantity</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Supplier</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Staff</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4 text-sm text-card-foreground">{record.date}</td>
                  <td className="py-4 px-4 text-sm font-medium text-card-foreground">{record.item}</td>
                  <td className="py-4 px-4 text-sm text-primary font-medium">+{record.quantity}</td>
                  <td className="py-4 px-4 text-sm text-card-foreground">{record.supplier}</td>
                  <td className="py-4 px-4 text-sm text-card-foreground">{record.staff}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{record.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomingStock;