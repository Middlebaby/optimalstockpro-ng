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
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCheck, Plus, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  unit: string | null;
  quantity: number;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface RequisitionLine {
  inventory_item_id: string;
  quantity: number;
}

interface Requisition {
  id: string;
  requested_by_name: string;
  project_name: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  items: { name: string; quantity: number; quantity_issued: number; unit: string | null }[];
}

const statusBadge = (status: string) => {
  switch (status) {
    case "issued":
      return <Badge className="bg-primary text-primary-foreground">Issued</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

const emptyLine = (): RequisitionLine => ({ inventory_item_id: "", quantity: 1 });

const Requisitions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const [staffName, setStaffName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<RequisitionLine[]>([emptyLine()]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [itemsRes, projectsRes, reqsRes, reqItemsRes] = await Promise.all([
        supabase.from("inventory_items").select("id, name, unit, quantity").eq("user_id", user.id).order("name"),
        supabase.from("projects").select("id, name").eq("user_id", user.id).order("name"),
        supabase.from("requisitions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("requisition_items").select("*, inventory_items(name, unit)"),
      ]);
      setItems(itemsRes.data || []);
      setProjects(projectsRes.data || []);
      const itemsByReq = new Map<string, Requisition["items"]>();
      (reqItemsRes.data || []).forEach((ri: any) => {
        const list = itemsByReq.get(ri.requisition_id) || [];
        list.push({
          name: ri.inventory_items?.name || "Unknown item",
          quantity: ri.quantity,
          quantity_issued: ri.quantity_issued,
          unit: ri.inventory_items?.unit,
        });
        itemsByReq.set(ri.requisition_id, list);
      });
      setRequisitions(
        (reqsRes.data || []).map((r: any) => ({
          id: r.id,
          requested_by_name: r.requested_by_name,
          project_name: r.project_name,
          status: r.status,
          notes: r.notes,
          created_at: r.created_at,
          items: itemsByReq.get(r.id) || [],
        }))
      );
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
      pending: requisitions.filter((r) => r.status === "pending").length,
      issued: requisitions.filter((r) => r.status === "issued").length,
    }),
    [requisitions]
  );

  const resetForm = () => {
    setStaffName("");
    setProjectId("");
    setProjectName("");
    setNotes("");
    setLines([emptyLine()]);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!staffName.trim()) {
      toast.error("Enter the name of the staff requesting the materials");
      return;
    }
    const valid = lines.filter((l) => l.inventory_item_id && Number(l.quantity) > 0);
    if (valid.length === 0) {
      toast.error("Add at least one material with a quantity");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("requisitions")
      .insert({
        user_id: user.id,
        requested_by_name: staffName.trim(),
        project_id: projectId || null,
        project_name: projectId
          ? projects.find((p) => p.id === projectId)?.name || null
          : projectName.trim() || null,
        notes: notes || null,
        status: "pending",
      })
      .select("id")
      .single();
    if (error || !data) {
      setSaving(false);
      toast.error("Could not submit the requisition");
      return;
    }
    const { error: itemsError } = await supabase.from("requisition_items").insert(
      valid.map((l) => ({
        requisition_id: data.id,
        inventory_item_id: l.inventory_item_id,
        quantity: Number(l.quantity),
      }))
    );
    setSaving(false);
    if (itemsError) {
      toast.error("Could not save the requested materials");
      return;
    }
    toast.success("Requisition submitted for approval");
    setDialogOpen(false);
    resetForm();
    load();
  };

  const handleIssue = async (req: Requisition) => {
    setActingId(req.id);
    const { data, error } = await supabase.rpc("issue_requisition", { p_requisition_id: req.id });
    setActingId(null);
    if (error) {
      toast.error("Could not issue the requisition");
      return;
    }
    const result = data as { ok: boolean; error?: string };
    if (!result.ok) {
      toast.error(result.error || "Could not issue the requisition");
      load();
      return;
    }
    toast.success("Materials issued — stock updated automatically");
    load();
  };

  const handleReject = async (req: Requisition) => {
    setActingId(req.id);
    const { error } = await supabase
      .from("requisitions")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", req.id)
      .eq("user_id", user?.id);
    setActingId(null);
    if (error) {
      toast.error("Could not reject the requisition");
      return;
    }
    toast.success("Requisition rejected");
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
            <ClipboardCheck className="w-6 h-6 text-primary" /> Material Requisitions
          </h1>
          <p className="text-muted-foreground text-sm">
            Staff request materials for a job — approving a requisition stocks the materials out automatically.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Requisition
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-foreground">{summary.pending}</p><p className="text-xs text-muted-foreground">Awaiting approval</p></CardContent></Card>
        <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-foreground">{summary.issued}</p><p className="text-xs text-muted-foreground">Issued</p></CardContent></Card>
      </div>

      {requisitions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-1">No requisitions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Submit a requisition to track who took which materials for which job.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Requisition
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requisitions.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{r.requested_by_name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.project_name || "General"} · {new Date(r.created_at).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                  {statusBadge(r.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border divide-y divide-border mb-3">
                  {r.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="text-foreground">{it.name}</span>
                      <span className="text-muted-foreground whitespace-nowrap ml-2">
                        {it.quantity_issued > 0 ? it.quantity_issued : it.quantity} {it.unit || ""}
                        {it.quantity_issued > 0 && it.quantity_issued !== it.quantity && (
                          <span className="text-muted-foreground"> (of {it.quantity})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                {r.notes && <p className="text-xs text-muted-foreground mb-3">{r.notes}</p>}
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" disabled={actingId === r.id} onClick={() => handleIssue(r)}>
                      {actingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                      Approve &amp; Issue
                    </Button>
                    <Button variant="outline" size="sm" disabled={actingId === r.id} onClick={() => handleReject(r)}>
                      <XCircle className="w-3 h-3 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Material Requisition</DialogTitle>
            <DialogDescription>
              Once approved, the listed quantities are deducted from stock automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Staff name *</Label>
                <Input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Who is collecting the materials?" />
              </div>
              <div className="space-y-1.5">
                <Label>Project</Label>
                <Select value={projectId || "none"} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not project-specific</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!projectId && (
              <div className="space-y-1.5">
                <Label>Or type a job / purpose</Label>
                <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Lekki 12-unit villa — roof phase" />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Materials requested *</Label>
                <Button variant="outline" size="sm" onClick={() => setLines((p) => [...p, emptyLine()])}>
                  <Plus className="w-3 h-3 mr-1" /> Add material
                </Button>
              </div>
              {lines.map((l, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-8">
                    <Select
                      value={l.inventory_item_id}
                      onValueChange={(v) => setLines((p) => p.map((x, i) => (i === idx ? { ...x, inventory_item_id: v } : x)))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
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
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="1"
                      value={l.quantity}
                      onChange={(e) => setLines((p) => p.map((x, i) => (i === idx ? { ...x, quantity: Number(e.target.value) } : x)))}
                    />
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
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Requisition
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requisitions;
