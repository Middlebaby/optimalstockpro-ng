import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Factory, Plus, Loader2, PlayCircle, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface RecipeOption {
  id: string;
  recipe_name: string;
  product_name: string;
  unit: string | null;
}

interface Run {
  id: string;
  recipe_id: string;
  recipe_name: string;
  product_name: string;
  planned_quantity: number;
  produced_quantity: number;
  status: string;
  location: string | null;
  project_name: string | null;
  actual_material_cost: number;
  created_at: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-primary text-primary-foreground">Completed</Badge>;
    case "in_progress":
      return <Badge variant="secondary">In Progress</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">Planned</Badge>;
  }
};

const ProductionRuns = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<Run[]>([]);
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const [recipeId, setRecipeId] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [location, setLocation] = useState("");
  const [projectId, setProjectId] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [runsRes, recipesRes, projectsRes] = await Promise.all([
        supabase
          .from("production_runs")
          .select("*, product_recipes(recipe_name, inventory_items(name, unit)), projects(name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("product_recipes")
          .select("id, recipe_name, inventory_items(name, unit)")
          .eq("user_id", user.id)
          .eq("is_active", true),
        supabase.from("projects").select("id, name").eq("user_id", user.id).order("name"),
      ]);
      setRuns(
        (runsRes.data || []).map((r: any) => ({
          id: r.id,
          recipe_id: r.recipe_id,
          recipe_name: r.product_recipes?.recipe_name || "Unknown recipe",
          product_name: r.product_recipes?.inventory_items?.name || "",
          planned_quantity: r.planned_quantity,
          produced_quantity: r.produced_quantity,
          status: r.status,
          location: r.location,
          project_name: r.projects?.name || null,
          actual_material_cost: Number(r.actual_material_cost) || 0,
          created_at: r.created_at,
        }))
      );
      setRecipes(
        (recipesRes.data || []).map((r: any) => ({
          id: r.id,
          recipe_name: r.recipe_name,
          product_name: r.inventory_items?.name || "",
          unit: r.inventory_items?.unit,
        }))
      );
      setProjects(projectsRes.data || []);
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  }, [user]);

  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user, load]);

  const summary = useMemo(
    () => ({
      active: runs.filter((r) => r.status === "in_progress").length,
      planned: runs.filter((r) => r.status === "planned").length,
      produced: runs.reduce((s, r) => s + r.produced_quantity, 0),
      cost: runs.reduce((s, r) => s + r.actual_material_cost, 0),
    }),
    [runs]
  );

  const resetForm = () => {
    setRecipeId("");
    setQuantity("10");
    setLocation("");
    setProjectId("");
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!recipeId) {
      toast.error("Select a recipe");
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty < 1) {
      toast.error("Enter a valid quantity");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("production_runs").insert({
      user_id: user.id,
      recipe_id: recipeId,
      planned_quantity: qty,
      location: location || null,
      project_id: projectId || null,
      status: "planned",
    });
    setSaving(false);
    if (error) {
      toast.error("Could not create the production run");
      return;
    }
    toast.success("Production run created");
    setDialogOpen(false);
    resetForm();
    load();
  };

  const setStatus = async (run: Run, status: string) => {
    setActingId(run.id);
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === "in_progress") patch.started_at = new Date().toISOString();
    const { error } = await supabase.from("production_runs").update(patch).eq("id", run.id).eq("user_id", user?.id);
    setActingId(null);
    if (error) {
      toast.error("Could not update the run");
      return;
    }
    load();
  };

  const handleComplete = async (run: Run) => {
    setActingId(run.id);
    const { data, error } = await supabase.rpc("run_production", { p_run_id: run.id });
    setActingId(null);
    if (error) {
      toast.error("Could not complete the run");
      return;
    }
    const result = data as { ok: boolean; error?: string; material_cost?: number; produced?: number };
    if (!result.ok) {
      toast.error(result.error || "Run failed");
      load();
      return;
    }
    toast.success(
      `Completed: ${result.produced} units produced. Materials deducted (₦${Number(result.material_cost).toLocaleString("en-NG", { maximumFractionDigits: 2 })})`
    );
    load();
  };

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
            <Factory className="w-6 h-6 text-primary" /> Production Runs
          </h1>
          <p className="text-muted-foreground text-sm">
            Turn recipes into finished goods — completing a run deducts materials and adds stock automatically.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Run
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-foreground">{summary.planned}</p><p className="text-xs text-muted-foreground">Planned</p></CardContent></Card>
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-foreground">{summary.active}</p><p className="text-xs text-muted-foreground">In progress</p></CardContent></Card>
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-foreground">{summary.produced.toLocaleString()}</p><p className="text-xs text-muted-foreground">Units produced</p></CardContent></Card>
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-foreground">₦{summary.cost.toLocaleString("en-NG", { maximumFractionDigits: 0 })}</p><p className="text-xs text-muted-foreground">Material cost to date</p></CardContent></Card>
      </div>

      {runs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Factory className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-1">No production runs yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a run from one of your recipes to start producing.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Run
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">All Runs</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Recipe</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Project</th>
                  <th className="py-2 pr-4">Cost</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-3 pr-4 font-medium text-foreground">{r.recipe_name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.product_name}</td>
                    <td className="py-3 pr-4">{r.produced_quantity > 0 ? r.produced_quantity : r.planned_quantity}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.project_name || "—"}</td>
                    <td className="py-3 pr-4">₦{r.actual_material_cost.toLocaleString("en-NG", { maximumFractionDigits: 2 })}</td>
                    <td className="py-3 pr-4">{statusBadge(r.status)}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {r.status === "planned" && (
                          <Button variant="outline" size="sm" disabled={actingId === r.id} onClick={() => setStatus(r, "in_progress")}>
                            {actingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlayCircle className="w-3 h-3 mr-1" />} Start
                          </Button>
                        )}
                        {(r.status === "planned" || r.status === "in_progress") && (
                          <Button size="sm" disabled={actingId === r.id} onClick={() => handleComplete(r)}>
                            {actingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />} Complete
                          </Button>
                        )}
                        {(r.status === "planned" || r.status === "in_progress") && (
                          <Button variant="ghost" size="sm" disabled={actingId === r.id} onClick={() => setStatus(r, "cancelled")}>
                            <XCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Production Run</DialogTitle>
            <DialogDescription>
              Completing the run will deduct materials per the recipe and add the finished goods to inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Recipe *</Label>
              <Select value={recipeId} onValueChange={setRecipeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.recipe_name} → {r.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {recipes.length === 0 && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> You need a recipe first — create one under Bills of Material.
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Quantity to produce *</Label>
                <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Yard / line</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main factory" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Project (optional)</Label>
              <Select value={projectId || "none"} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Link to a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Run
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionRuns;
