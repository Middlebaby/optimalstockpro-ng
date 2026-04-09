import { useState, useEffect } from "react";
import {
  Store, Globe, Instagram, ShoppingBag, Plus, Edit2, Trash2,
  CheckCircle2, XCircle, RefreshCw, Loader2, Wifi, WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface SalesChannel {
  id: string;
  channel_name: string;
  channel_type: string;
  is_active: boolean;
  api_config: Record<string, any>;
  last_synced_at: string | null;
  created_at: string;
}

const channelIcons: Record<string, React.ReactNode> = {
  shopify: <ShoppingBag className="w-5 h-5 text-green-600" />,
  instagram: <Instagram className="w-5 h-5 text-pink-500" />,
  pos: <Store className="w-5 h-5 text-blue-600" />,
  website: <Globe className="w-5 h-5 text-purple-600" />,
  manual: <Store className="w-5 h-5 text-muted-foreground" />,
};

const channelTypes = [
  { value: "manual", label: "Manual / Walk-in" },
  { value: "pos", label: "POS System" },
  { value: "shopify", label: "Shopify" },
  { value: "instagram", label: "Instagram Shop" },
  { value: "website", label: "Website / Online Store" },
];

const SalesChannels = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<SalesChannel | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    channel_name: "",
    channel_type: "manual",
    is_active: true,
  });

  const fetchChannels = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("sales_channels")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load channels");
      console.error(error);
    } else {
      setChannels(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChannels();
  }, [user]);

  const openAdd = () => {
    setEditingChannel(null);
    setForm({ channel_name: "", channel_type: "manual", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (ch: SalesChannel) => {
    setEditingChannel(ch);
    setForm({
      channel_name: ch.channel_name,
      channel_type: ch.channel_type,
      is_active: ch.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !form.channel_name.trim()) {
      toast.error("Channel name is required");
      return;
    }
    setSaving(true);

    try {
      if (editingChannel) {
        const { error } = await supabase
          .from("sales_channels")
          .update({
            channel_name: form.channel_name,
            channel_type: form.channel_type,
            is_active: form.is_active,
          })
          .eq("id", editingChannel.id);
        if (error) throw error;
        toast.success("Channel updated");
      } else {
        const { error } = await supabase
          .from("sales_channels")
          .insert({
            user_id: user.id,
            channel_name: form.channel_name,
            channel_type: form.channel_type,
            is_active: form.is_active,
          });
        if (error) throw error;
        toast.success("Channel added");
      }
      setDialogOpen(false);
      fetchChannels();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sales channel?")) return;
    const { error } = await supabase.from("sales_channels").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Channel deleted");
      fetchChannels();
    }
  };

  const toggleActive = async (ch: SalesChannel) => {
    const { error } = await supabase
      .from("sales_channels")
      .update({ is_active: !ch.is_active })
      .eq("id", ch.id);
    if (error) {
      toast.error("Failed to update");
    } else {
      fetchChannels();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold">Sales Channels</h2>
          <p className="text-muted-foreground">
            Manage your sales channels across platforms and locations
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Channel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{channels.length}</p>
                <p className="text-sm text-muted-foreground">Total Channels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Wifi className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {channels.filter((c) => c.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <WifiOff className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {channels.filter((c) => !c.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channels Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Synced</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No sales channels yet. Add your first channel to start tracking.
                  </TableCell>
                </TableRow>
              ) : (
                channels.map((ch) => (
                  <TableRow key={ch.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {channelIcons[ch.channel_type] || channelIcons.manual}
                        <span className="font-medium">{ch.channel_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {channelTypes.find((t) => t.value === ch.channel_type)?.label || ch.channel_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={ch.is_active ? "default" : "outline"}
                        className={ch.is_active ? "bg-green-600" : ""}
                      >
                        {ch.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ch.last_synced_at
                        ? format(new Date(ch.last_synced_at), "MMM dd, HH:mm")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(ch)}
                          title={ch.is_active ? "Deactivate" : "Activate"}
                        >
                          {ch.is_active ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(ch)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(ch.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingChannel ? "Edit Channel" : "Add Sales Channel"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Channel Name</Label>
              <Input
                placeholder="e.g. Lagos Main Store, Instagram Shop"
                value={form.channel_name}
                onChange={(e) => setForm({ ...form, channel_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Channel Type</Label>
              <Select
                value={form.channel_type}
                onValueChange={(v) => setForm({ ...form, channel_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channelTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingChannel ? "Update" : "Add Channel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesChannels;
