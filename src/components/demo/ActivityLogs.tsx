import { useState } from "react";
import { 
  Activity, 
  User, 
  Package, 
  ArrowRightLeft, 
  Plus, 
  Edit, 
  Trash2,
  QrCode,
  Eye,
  Download,
  Filter,
  Calendar,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subHours, subDays, subMinutes } from "date-fns";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  actionType: "create" | "update" | "delete" | "view" | "scan" | "transfer";
  entityType: string;
  entityName: string;
  details: string;
  ipAddress: string;
  createdAt: Date;
}

const ActivityLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");

  // Demo data showing various staff activities
  const activityLogs: ActivityLog[] = [
    {
      id: "1",
      userId: "u1",
      userName: "Adewale Okonkwo",
      userRole: "Manager",
      actionType: "transfer",
      entityType: "inventory_item",
      entityName: "Premium Cement (50 bags)",
      details: "Transferred from Warehouse A to Site B",
      ipAddress: "192.168.1.45",
      createdAt: subMinutes(new Date(), 15),
    },
    {
      id: "2",
      userId: "u2",
      userName: "Chidinma Eze",
      userRole: "Staff",
      actionType: "scan",
      entityType: "inventory_item",
      entityName: "Steel Rods 12mm",
      details: "Scanned barcode for stock count",
      ipAddress: "192.168.1.102",
      createdAt: subMinutes(new Date(), 45),
    },
    {
      id: "3",
      userId: "u3",
      userName: "Oluwaseun Adeyemi",
      userRole: "Staff",
      actionType: "update",
      entityType: "inventory_item",
      entityName: "Chicken Laps",
      details: "Quantity changed: 100 → 85 (Sold 15 kilos)",
      ipAddress: "192.168.1.78",
      createdAt: subHours(new Date(), 2),
    },
    {
      id: "4",
      userId: "u1",
      userName: "Adewale Okonkwo",
      userRole: "Manager",
      actionType: "create",
      entityType: "purchase_order",
      entityName: "PO-2024-0156",
      details: "Created purchase order for Dangote Cement",
      ipAddress: "192.168.1.45",
      createdAt: subHours(new Date(), 3),
    },
    {
      id: "5",
      userId: "u4",
      userName: "Ibrahim Musa",
      userRole: "Staff",
      actionType: "delete",
      entityType: "inventory_item",
      entityName: "Expired Milk Sachets",
      details: "Removed 50 expired items from inventory",
      ipAddress: "192.168.1.33",
      createdAt: subHours(new Date(), 5),
    },
    {
      id: "6",
      userId: "u2",
      userName: "Chidinma Eze",
      userRole: "Staff",
      actionType: "view",
      entityType: "report",
      entityName: "Weekly Stock Report",
      details: "Downloaded PDF report",
      ipAddress: "192.168.1.102",
      createdAt: subDays(new Date(), 1),
    },
    {
      id: "7",
      userId: "u3",
      userName: "Oluwaseun Adeyemi",
      userRole: "Staff",
      actionType: "create",
      entityType: "inventory_item",
      entityName: "New Ankara Fabric",
      details: "Added 100 yards to inventory",
      ipAddress: "192.168.1.78",
      createdAt: subDays(new Date(), 1),
    },
    {
      id: "8",
      userId: "u1",
      userName: "Adewale Okonkwo",
      userRole: "Manager",
      actionType: "update",
      entityType: "supplier",
      entityName: "Dangote Cement",
      details: "Updated contact information",
      ipAddress: "192.168.1.45",
      createdAt: subDays(new Date(), 2),
    },
  ];

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "create": return <Plus className="w-4 h-4" />;
      case "update": return <Edit className="w-4 h-4" />;
      case "delete": return <Trash2 className="w-4 h-4" />;
      case "view": return <Eye className="w-4 h-4" />;
      case "scan": return <QrCode className="w-4 h-4" />;
      case "transfer": return <ArrowRightLeft className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "create": return "bg-primary/10 text-primary";
      case "update": return "bg-blue-500/10 text-blue-600";
      case "delete": return "bg-destructive/10 text-destructive";
      case "view": return "bg-muted text-muted-foreground";
      case "scan": return "bg-accent/10 text-accent-foreground";
      case "transfer": return "bg-yellow-500/10 text-yellow-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const uniqueUsers = [...new Set(activityLogs.map(log => log.userName))];

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = 
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = filterAction === "all" || log.actionType === filterAction;
    const matchesUser = filterUser === "all" || log.userName === filterUser;

    return matchesSearch && matchesAction && matchesUser;
  });

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = format(log.createdAt, "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, ActivityLog[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Activity Logs
          </h1>
          <p className="text-muted-foreground">
            Track all staff actions and inventory changes
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {activityLogs.filter(l => l.actionType === "create").length}
              </p>
              <p className="text-xs text-muted-foreground">Items Added</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {activityLogs.filter(l => l.actionType === "update").length}
              </p>
              <p className="text-xs text-muted-foreground">Updates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-foreground">
                {activityLogs.filter(l => l.actionType === "scan").length}
              </p>
              <p className="text-xs text-muted-foreground">Scans</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {activityLogs.filter(l => l.actionType === "transfer").length}
              </p>
              <p className="text-xs text-muted-foreground">Transfers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Created</SelectItem>
            <SelectItem value="update">Updated</SelectItem>
            <SelectItem value="delete">Deleted</SelectItem>
            <SelectItem value="scan">Scanned</SelectItem>
            <SelectItem value="transfer">Transferred</SelectItem>
            <SelectItem value="view">Viewed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="w-[180px]">
            <User className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {uniqueUsers.map(user => (
              <SelectItem key={user} value={user}>{user}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {Object.entries(groupedLogs).map(([date, logs]) => (
              <div key={date} className="mb-6">
                <div className="sticky top-0 bg-card z-10 py-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <div className="space-y-3 ml-4 border-l-2 border-border pl-4">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="relative bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-[22px] top-5 w-3 h-3 rounded-full ${
                        log.actionType === "delete" ? "bg-destructive" : "bg-primary"
                      }`} />
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getActionColor(log.actionType)}`}>
                            {getActionIcon(log.actionType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{log.userName}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.userRole}
                              </Badge>
                              <Badge className={`text-xs ${getActionColor(log.actionType)}`}>
                                {log.actionType}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1">
                              <span className="font-medium">{log.entityName}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {log.details}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{format(log.createdAt, "h:mm a")}</span>
                              <span>IP: {log.ipAddress}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;
