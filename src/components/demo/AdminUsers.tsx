import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Users, Search, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserRecord {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  full_name: string | null;
  company_name: string | null;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("list-users", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      setUsers(response.data.users || []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("update-user-role", {
        body: { userId, newRole },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success("Role updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "manager": return "default";
      default: return "secondary";
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" onClick={fetchUsers}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground">View all registered users and manage their roles</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role === "admin").length}
                </p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role === "manager").length}
                </p>
                <p className="text-sm text-muted-foreground">Managers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{u.full_name || "—"}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {u.company_name || "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {format(new Date(u.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {u.last_sign_in_at
                          ? format(new Date(u.last_sign_in_at), "MMM d, yyyy")
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {u.id === user?.id ? (
                          <Badge variant={getRoleBadgeVariant(u.role)}>
                            {u.role.toUpperCase()} (You)
                          </Badge>
                        ) : (
                          <Select
                            value={u.role}
                            onValueChange={(val) => handleRoleChange(u.id, val)}
                            disabled={updating === u.id}
                          >
                            <SelectTrigger className="w-[120px]">
                              {updating === u.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
