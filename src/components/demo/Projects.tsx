import { useState } from "react";
import { Plus, FolderKanban, ImageIcon, FileText, Package, RotateCcw, Search, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Project {
  id: string;
  name: string;
  client: string;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  description: string;
  location: string;
  manager: string;
}

interface MaterialAllocation {
  id: string;
  projectId: string;
  itemName: string;
  allocated: number;
  used: number;
  returned: number;
  unit: string;
}

interface WorkOrder {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  assignedTo: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
}

const Projects = () => {
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Victoria Island Office Complex",
      client: "Sterling Properties Ltd",
      status: "in-progress",
      startDate: "2025-11-01",
      endDate: "2026-06-30",
      budget: 45000000,
      spent: 18500000,
      progress: 42,
      description: "12-floor commercial office building with underground parking",
      location: "Plot 15, Adeola Odeku, Victoria Island",
      manager: "Engr. Chidi Okonkwo"
    },
    {
      id: "2",
      name: "Lekki Housing Estate Phase 2",
      client: "Lekki Gardens",
      status: "planning",
      startDate: "2026-02-01",
      endDate: "2027-01-31",
      budget: 120000000,
      spent: 2500000,
      progress: 5,
      description: "50 units of 3-bedroom semi-detached duplexes",
      location: "Lekki Phase 2, Lagos",
      manager: "Engr. Amina Ibrahim"
    },
    {
      id: "3",
      name: "Ikeja Factory Renovation",
      client: "NigeriaMFG Ltd",
      status: "completed",
      startDate: "2025-06-01",
      endDate: "2025-12-15",
      budget: 28000000,
      spent: 26800000,
      progress: 100,
      description: "Complete renovation of manufacturing floor and office spaces",
      location: "Industrial Avenue, Ikeja",
      manager: "Engr. Tunde Adeyemi"
    },
  ]);

  const [allocations] = useState<MaterialAllocation[]>([
    { id: "1", projectId: "1", itemName: "Premium Cement", allocated: 500, used: 280, returned: 0, unit: "bags" },
    { id: "2", projectId: "1", itemName: "Steel Rods (12mm)", allocated: 1000, used: 650, returned: 20, unit: "pieces" },
    { id: "3", projectId: "1", itemName: "Granite (20mm)", allocated: 200, used: 120, returned: 0, unit: "tonnes" },
    { id: "4", projectId: "2", itemName: "Plywood Sheets", allocated: 50, used: 10, returned: 0, unit: "sheets" },
  ]);

  const [workOrders] = useState<WorkOrder[]>([
    { id: "1", projectId: "1", title: "Foundation Reinforcement", description: "Complete steel reinforcement for ground floor", status: "completed", assignedTo: "Team Alpha", dueDate: "2025-12-20", priority: "high" },
    { id: "2", projectId: "1", title: "First Floor Slab", description: "Pour concrete for first floor slab", status: "in-progress", assignedTo: "Team Beta", dueDate: "2026-01-10", priority: "high" },
    { id: "3", projectId: "1", title: "Electrical Conduit Installation", description: "Install electrical conduits for floors 1-3", status: "pending", assignedTo: "Electrical Team", dueDate: "2026-01-25", priority: "medium" },
  ]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "planning": return "bg-muted text-muted-foreground";
      case "in-progress": return "bg-primary/10 text-primary";
      case "completed": return "bg-green-500/10 text-green-600";
      case "on-hold": return "bg-accent/10 text-accent";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: WorkOrder["priority"]) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive";
      case "medium": return "bg-accent/10 text-accent";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const projectAllocations = allocations.filter(a => a.projectId === selectedProject?.id);
  const projectWorkOrders = workOrders.filter(w => w.projectId === selectedProject?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Projects
            </h1>
            <Badge variant="outline" className="text-xs">Professional</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage projects, materials, work orders, and track progress
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project Name *</Label>
                  <Input className="mt-1" placeholder="e.g., Office Building Phase 1" />
                </div>
                <div>
                  <Label>Client *</Label>
                  <Input className="mt-1" placeholder="Client company name" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1" placeholder="Project description and scope..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <Label>Budget (₦) *</Label>
                  <Input type="number" className="mt-1" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input className="mt-1" placeholder="Project site address" />
                </div>
                <div>
                  <Label>Project Manager</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chidi">Engr. Chidi Okonkwo</SelectItem>
                      <SelectItem value="amina">Engr. Amina Ibrahim</SelectItem>
                      <SelectItem value="tunde">Engr. Tunde Adeyemi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsDialogOpen(false)}>Create Project</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-primary" />
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace("-", " ")}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Project</DropdownMenuItem>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Add Work Order</DropdownMenuItem>
                  <DropdownMenuItem>Allocate Materials</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h3 className="font-heading font-semibold text-card-foreground mb-1">{project.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{project.client}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="flex justify-between text-sm">
              <div>
                <p className="text-muted-foreground">Budget</p>
                <p className="font-medium text-foreground">₦{(project.budget / 1000000).toFixed(1)}M</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Spent</p>
                <p className="font-medium text-foreground">₦{(project.spent / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Dialog */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <FolderKanban className="w-6 h-6 text-primary" />
                <div>
                  <DialogTitle className="text-xl">{selectedProject.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{selectedProject.client}</p>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="workorders">Work Orders</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`mt-1 ${getStatusColor(selectedProject.status)}`}>
                      {selectedProject.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-xl font-bold text-foreground">{selectedProject.progress}%</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="text-xl font-bold text-foreground">₦{(selectedProject.budget / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className="text-xl font-bold text-foreground">₦{(selectedProject.spent / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="font-medium text-card-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedProject.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="font-medium text-card-foreground mb-2">Location</h4>
                    <p className="text-muted-foreground">{selectedProject.location}</p>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="font-medium text-card-foreground mb-2">Project Manager</h4>
                    <p className="text-muted-foreground">{selectedProject.manager}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="materials" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Material Allocations
                  </h4>
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    Allocate Materials
                  </Button>
                </div>
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Allocated</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Used</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Returned</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Remaining</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectAllocations.map((alloc) => (
                        <tr key={alloc.id} className="border-b border-border/50">
                          <td className="py-3 px-4 font-medium text-card-foreground">{alloc.itemName}</td>
                          <td className="py-3 px-4 text-card-foreground">{alloc.allocated} {alloc.unit}</td>
                          <td className="py-3 px-4 text-card-foreground">{alloc.used} {alloc.unit}</td>
                          <td className="py-3 px-4 text-card-foreground">{alloc.returned} {alloc.unit}</td>
                          <td className="py-3 px-4 font-medium text-primary">{alloc.allocated - alloc.used + alloc.returned} {alloc.unit}</td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm">
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Return
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="workorders" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Work Orders
                  </h4>
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    Create Work Order
                  </Button>
                </div>
                <div className="space-y-3">
                  {projectWorkOrders.map((order) => (
                    <div key={order.id} className="bg-card rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-card-foreground">{order.title}</h5>
                            <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                            <Badge variant="outline">{order.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{order.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Assigned: {order.assignedTo}</span>
                            <span>Due: {order.dueDate}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Project Photos
                  </h4>
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    Upload Photos
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm">Before Photo</span>
                    <span className="text-xs">Click to upload</span>
                  </div>
                  <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm">Progress Photo</span>
                    <span className="text-xs">Click to upload</span>
                  </div>
                  <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm">After Photo</span>
                    <span className="text-xs">Click to upload</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Projects;
