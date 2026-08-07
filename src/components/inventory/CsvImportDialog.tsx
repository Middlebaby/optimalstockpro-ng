import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, Download, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { parseCsv, pickField, downloadCsv } from "@/lib/csv";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: (count: number) => void;
  defaultLocation?: string;
}

interface StagedItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  reorder_level: number;
  location: string | null;
  sku: string | null;
  expiry_date: string | null;
}

const TEMPLATE = `name,category,quantity,unit,unit_price,reorder_level,location,sku,expiry_date
Rice (50kg bag),Food Products,20,bags,52000,5,Main Warehouse,RICE-50,2026-12-31
Bottled Water,Beverages,240,pcs,150,50,Main Warehouse,WTR-75CL,
`;

const toNumber = (value: string, fallback = 0) => {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toDate = (value: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
};

const CsvImportDialog = ({ open, onOpenChange, onImported, defaultLocation }: CsvImportDialogProps) => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<StagedItem[]>([]);
  const [skipped, setSkipped] = useState<number>(0);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setStaged([]);
    setSkipped(0);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    const { rows } = parseCsv(text);

    const items: StagedItem[] = [];
    let invalid = 0;

    for (const row of rows) {
      const name = pickField(row, ["name", "item name", "product", "item"]);
      if (!name) {
        invalid++;
        continue;
      }
      items.push({
        name,
        category: pickField(row, ["category", "type"]) || "Other",
        quantity: toNumber(pickField(row, ["quantity", "qty", "stock"]), 0),
        unit: pickField(row, ["unit", "uom"]) || "pcs",
        unit_price: toNumber(pickField(row, ["unit_price", "unit cost", "price", "cost"]), 0),
        reorder_level: toNumber(pickField(row, ["reorder_level", "reorder level", "min", "minimum"]), 10),
        location: pickField(row, ["location", "warehouse", "store"]) || defaultLocation || null,
        sku: pickField(row, ["sku", "code", "barcode"]) || null,
        expiry_date: toDate(pickField(row, ["expiry_date", "expiry", "expires", "best before"])),
      });
    }

    setStaged(items);
    setSkipped(invalid);

    if (items.length === 0) {
      toast.error("No valid rows found. Make sure your file has a 'name' column.");
    }
  };

  const handleImport = async () => {
    if (!user || staged.length === 0) return;
    setImporting(true);
    try {
      const payload = staged.map((item) => ({ ...item, user_id: user.id }));
      const { data, error } = await supabase
        .from("inventory_items")
        .insert(payload)
        .select("id, quantity, location");

      if (error) throw error;

      const movements = (data || [])
        .filter((row) => (row.quantity || 0) > 0)
        .map((row) => ({
          user_id: user.id,
          inventory_item_id: row.id,
          movement_type: "incoming",
          quantity: row.quantity,
          to_location: row.location,
          created_by: user.id,
          notes: "CSV import",
        }));

      if (movements.length > 0) {
        await supabase.from("stock_movements").insert(movements);
      }

      toast.success(`Imported ${data?.length ?? staged.length} items`);
      onImported?.(data?.length ?? staged.length);
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error("CSV import failed:", err);
      toast.error("Import failed. Please check your file and try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import inventory from CSV</DialogTitle>
          <DialogDescription>
            Upload a spreadsheet exported as CSV. Column names are matched automatically —
            only <span className="font-medium text-foreground">name</span> is required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Choose CSV file
            </Button>
            <Button
              variant="ghost"
              onClick={() => downloadCsv("optimalstock-inventory-template.csv", TEMPLATE)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download template
            </Button>
            {fileName && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <FileSpreadsheet className="w-4 h-4" />
                {fileName}
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {skipped > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-accent/10 p-3 text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-accent" />
              {skipped} row{skipped === 1 ? "" : "s"} skipped because the item name was empty.
            </div>
          )}

          {staged.length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground">
                Preview — {staged.length} item{staged.length === 1 ? "" : "s"} ready to import
              </div>
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Category</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Qty</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Unit cost</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staged.slice(0, 50).map((item, index) => (
                      <tr key={`${item.name}-${index}`} className="border-t border-border/50">
                        <td className="px-4 py-2 text-foreground">{item.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{item.category}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          ₦{item.unit_price.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">{item.location || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={staged.length === 0 || importing}>
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${staged.length || ""} item${staged.length === 1 ? "" : "s"}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CsvImportDialog;
