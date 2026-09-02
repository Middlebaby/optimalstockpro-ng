import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Plus, Trash2, Loader2, Package } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  unit: string | null;
  unit_price: number | null;
  item_type: string;
  quantity: number;
}

interface RecipeLine {
  material_item_id: string;
  quantity_per_unit: number;
  scrap_allowance_pct: number;
  stage: string;
}

interface Recipe {
  id: string;
  recipe_name: string;
  version: number;
  product_item_id: string;
  notes: string | null;
  lines: (RecipeLine & { name?: string; unit?: string | null })[];
}

const STAGES = ["", "Cutting", "Welding", "Fabrication", "Assembly", "Finishing", "Painting", "QC/Packing"];

const emptyLine = (): RecipeLine => ({
  material_item_id: "",
  quantity_per_unit: 1,
  scrap_allowance_pct: 0,
  stage: "",
});

const BillOfMaterials = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [recipeName, setRecipeName] = useState("");
  const [productItemId, setProductItemId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<RecipeLine[]>([emptyLine()]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [itemsRes, recipesRes, linesRes] = await Promise.all([
        supabase.from("inventory_items").select("id, name, unit, unit_price, item_type, quantity").eq("user_id", user.id).order("name"),
        supabase.from("product_recipes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("recipe_lines").select("*, inventory_items(name, unit)"),
      ]);
      const linesByRecipe = new Map<string, Recipe["lines"]>();
      (linesRes.data || []).forEach((l: any) => {
        const list = linesByRecipe.get(l.recipe_id) || [];
        list.push({
          material_item_id: l.material_item_id,
          quantity_per_unit: Number(l.quantity_per_unit),
          scrap_allowance_pct: Number(l.scrap_allowance_pct),
          stage: l.stage || "",
          name: l.inventory_items?.name,
          unit: l.inventory_items?.unit,
        });
        linesByRecipe.set(l.recipe_id, list);
      });
      setItems(itemsRes.data || []);
      setRecipes(
        (recipesRes.data || []).map((r: any) => ({
          id: r.id,
          recipe_name: r.recipe_name,
          version: r.version,
          product_item_id: r.product_item_id,
          notes: r.notes,
          lines: linesByRecipe.get(r.id) || [],
        }))
      );
    } finally {
      // Always clear the loading state, even if the user is signed out mid-load
      setTimeout(() => setLoading(false), 0);
    }
  }, [user]);

  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user, load]);

  const itemName = useMemo(
    () => (id: string) => items.find((i) => i.id === id)?.name || "Unknown item",
    [items]
  );

  const unitCost = (recipe: Recipe) =>
    recipe.lines.reduce(
      (sum, l) =>
        sum +
        l.quantity_per_unit * (1 + l.scrap_allowance_pct / 100) *
          (items.find((i) => i.id === l.material_item_id)?.unit_price || 0),
      0
    );

  const resetForm = () => {
    setRecipeName("");
    setProductItemId("");
    setNotes("");
    setLines([emptyLine()]);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!recipeName.trim() || !productItemId) {
      toast.error("Give the recipe a name and pick the finished product");
      return;
    }
    const valid = lines.filter((l) => l.material_item_id);
    if (valid.length === 0) {
      toast.error("Add at least one material");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("product_recipes")
      .insert({
        user_id: user.id,
        recipe_name: recipeName.trim(),
        product_item_id: productItemId,
        notes: notes || null,
      })
      .select("id")
      .single();
    if (error || !data) {
      setSaving(false);
      toast.error("Could not save the recipe");
      return;
    }
    const { error: linesError } = await supabase.from("recipe_lines").insert(
      valid.map((l) => ({
        recipe_id: data.id,
        material_item_id: l.material_item_id,
        quantity_per_unit: Number(l.quantity_per_unit) || 0,
        scrap_allowance_pct: Number(l.scrap_allowance_pct) || 0,
        stage: l.stage || null,
      }))
    );
    setSaving(false);
    if (linesError) {
      toast.error("Could not save the recipe materials");
      return;
    }
    toast.success("Recipe saved");
    setDialogOpen(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("product_recipes").delete().eq("id", id).eq("user_id", user?.id);
    if (error) {
      toast.error("Could not delete the recipe");
      return;
    }
    toast.success("Recipe deleted");
    load();
  };

  const finishedItems = items.filter((i) => i.item_type === "finished");
  const productOptions = finishedItems.length > 0 ? finishedItems : items;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" /> Bills of Material
          </h1>
          <p className="text-muted-foreground text-sm">
            Define exactly which materials make each finished product — production runs deduct from these recipes.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Recipe
        </Button>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Layers className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-1">No recipes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first recipe, e.g. "Roof Truss 6m" using steel, welding rods and paint.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Recipe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recipes.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{r.recipe_name}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Package className="w-3 h-3" /> Produces: {itemName(r.product_item_id)}
                    </p>
                  </div>
                  <Badge variant="secondary">v{r.version}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border divide-y divide-border mb-3">
                  {r.lines.map((l, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div>
                        <span className="text-foreground">{l.name || itemName(l.material_item_id)}</span>
                        {l.stage && <span className="ml-2 text-xs text-muted-foreground">({l.stage})</span>}
                      </div>
                      <span className="text-muted-foreground whitespace-nowrap ml-2">
                        {l.quantity_per_unit} {l.unit || ""}/unit
                        {l.scrap_allowance_pct > 0 && (
                          <span className="text-destructive"> +{l.scrap_allowance_pct}%</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    Material cost per unit:{" "}
                    <span className="font-semibold text-foreground">
                      ₦{unitCost(r).toLocaleString("en-NG", { maximumFractionDigits: 2 })}
                    </span>
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Recipe (Bill of Material)</DialogTitle>
            <DialogDescription>
              Pick the finished product, then list the materials needed to make one unit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Recipe name *</Label>
                <Input
                  value={recipeName}
                  placeholder="e.g. Roof Truss 6m"
                  onChange={(e) => setRecipeName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Finished product *</Label>
                <Select value={productItemId} onValueChange={setProductItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productOptions.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Materials (per 1 unit of product)</Label>
                <Button variant="outline" size="sm" onClick={() => setLines((p) => [...p, emptyLine()])}>
                  <Plus className="w-3 h-3 mr-1" /> Add material
                </Button>
              </div>
              {lines.map((l, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Select
                      value={l.material_item_id}
                      onValueChange={(v) =>
                        setLines((p) => p.map((x, i) => (i === idx ? { ...x, material_item_id: v } : x)))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Material" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.name} ({i.quantity} {i.unit || ""} in stock)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={l.quantity_per_unit}
                      onChange={(e) =>
                        setLines((p) => p.map((x, i) => (i === idx ? { ...x, quantity_per_unit: Number(e.target.value) } : x)))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Scrap %"
                      value={l.scrap_allowance_pct}
                      onChange={(e) =>
                        setLines((p) => p.map((x, i) => (i === idx ? { ...x, scrap_allowance_pct: Number(e.target.value) } : x)))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={l.stage || "none"}
                      onValueChange={(v) =>
                        setLines((p) => p.map((x, i) => (i === idx ? { ...x, stage: v === "none" ? "" : v } : x)))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No stage</SelectItem>
                        {STAGES.filter(Boolean).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLines((p) => (p.length > 1 ? p.filter((_, i) => i !== idx) : p))}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Columns: material · qty per unit · scrap allowance % · production stage</p>
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional instructions" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Recipe
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillOfMaterials;
