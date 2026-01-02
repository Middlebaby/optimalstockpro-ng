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

interface OutgoingRecord {
  id: string;
  date: string;
  item: string;
  quantity: number;
  purpose: string;
  staff: string;
  notes: string;
}

const OutgoingStock = () => {
  const [records, setRecords] = useState<OutgoingRecord[]>([
    { id: "1", date: "2026-01-02", item: "Premium Cement", quantity: 50, purpose: "Sale", staff: "Chidi O.", notes: "Customer: ABC Construction" },
    { id: "2", date: "2026-01-01", item: "Paint - White", quantity: 20, purpose: "Production", staff: "Tunde A.", notes: "" },
    { id: "3", date: "2025-12-30", item: "Steel Rods (12mm)", quantity: 30, purpose: "Transfer", staff: "Amina I.", notes: "Moved to site B" },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    item: "",
    quantity: 0,
    purpose: "",
    staff: "",
    notes: "",
  });

  const items = ["Premium Cement", "Steel Rods (12mm)", "Paint - White", "Plywood Sheets", "PVC Pipes", "Electrical Wire", "Nails (Box)"];
  const purposes = ["Sale", "Production", "Transfer", "Damaged/Waste", "Other"];

  const handleAddRecord = () => {
    if (newRecord.item && newRecord.quantity > 0 && newRecord.staff && newRecord.purpose) {
      setRecords([{ ...newRecord, id: Date.now().toString() }, ...records]);
      setNewRecord({
        date: new Date().toISOString().split("T")[0],
        item: "",
        quantity: 0,
        purpose: "",
        staff: "",
        notes: "",
      });
      setIsDialogOpen(false);
    }
  };

  const getPurposeColor = (purpose: string) => {
    switch (purpose) {
      case "Sale":
        return "bg-primary/10 text-primary";
      case "Production":
        return "bg-accent/20 text-accent-foreground";
      case "Transfer":
        return "bg-muted text-muted-foreground";
      case "Damaged/Waste":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Outgoing Stock
          </h1>
          <p className="text-muted-foreground">
            Record stock usage, sales, and transfers
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              Record Outgoing Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Record Outgoing Stock</DialogTitle>
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
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Select
                    value={newRecord.purpose}
                    onValueChange={(value) => setNewRecord({ ...newRecord, purpose: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {purposes.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Purpose</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Staff</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4 text-sm text-card-foreground">{record.date}</td>
                  <td className="py-4 px-4 text-sm font-medium text-card-foreground">{record.item}</td>
                  <td className="py-4 px-4 text-sm text-destructive font-medium">-{record.quantity}</td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPurposeColor(record.purpose)}`}>
                      {record.purpose}
                    </span>
                  </td>
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

export default OutgoingStock;