import { useState, useEffect } from "react";
import { Plus, FolderKanban, Search, MoreVertical, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
}

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", status: "active", start_date: "", end_date: "", budget: "",
  });

  const fetchProjects = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load projects");
    else setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [user]);

  const handleAdd = async () => {
    if (!user || !form.name) { toast.error("Project name is required"); return; }
    const { error } = await supabase.from("projects").insert({
      name: form.name,
      description: form.description || null,
      status: form.status || "active",
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: form.budget ? Number(form.budget) : null,
      user_id: user.id,
    });
    if (error) { toast.error("Failed to create project"); return; }
    toast.success("Project created");
    setForm({ name: "", description: "", status: "active", start_date: "", end_date: "", budget: "" });
    setIsDialogOpen(false);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { toast.error("Failed to delete project"); return; }
    toast.success("Project deleted");
    fetchProjects();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("projects").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    fetchProjects();
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active": return "bg-primary/10 text-primary";
      case "completed": return "bg-green-500/10 text-green-600";
      case "on-hold": return "bg-accent/10 text-accent";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-heading font-bold text-foreground">Projects</h1>
            <Badge variant="outline" className="text-xs">Professional</Badge>
          </div>
          <p className="text-muted-foreground">Manage projects and track progress</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" /> New Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Project Name *</Label>
                <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" className="mt-1" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" className="mt-1" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
                <div>
                  <Label>Budget (₦)</Label>
                  <Input type="number" className="mt-1" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Create Project</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No projects yet</p>
          <p className="text-sm text-muted-foreground">Click "New Project" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <div key={project.id} className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-primary" />
                  <Badge className={getStatusColor(project.status)}>{project.status || "active"}</Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(project.id, "active")}>Set Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(project.id, "completed")}>Set Completed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(project.id, "on-hold")}>Set On Hold</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(project.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="font-heading font-semibold text-card-foreground mb-1">{project.name}</h3>
              {project.description && <p className="text-sm text-muted-foreground mb-3">{project.description}</p>}
              <div className="flex justify-between text-sm mt-4 pt-4 border-t border-border">
                {project.budget && (
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium text-foreground">₦{project.budget.toLocaleString()}</p>
                  </div>
                )}
                {project.start_date && (
                  <div className="text-right">
                    <p className="text-muted-foreground">Start</p>
                    <p className="font-medium text-foreground">{project.start_date}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
