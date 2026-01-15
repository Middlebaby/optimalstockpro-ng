import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Users, 
  Building, 
  MapPin,
  Calendar,
  Filter,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface SurveyResponse {
  id: string;
  created_at: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  business_type: string;
  employee_count: string;
  location: string;
  current_method: string | null;
  challenges: string[] | null;
  challenges_other: string | null;
  biggest_pain: string | null;
  interested_features: string[] | null;
  features_other: string | null;
  budget_range: string | null;
  launch_interest: string | null;
  additional_comments: string | null;
}

const AdminSurvey = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [hasAccess, setHasAccess] = useState(false);

  // Check if user has admin/manager role
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking role:", error);
        setHasAccess(false);
        return;
      }

      if (data && (data.role === "admin" || data.role === "manager")) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    };

    if (!authLoading && user) {
      checkAccess();
    }
  }, [user, authLoading]);

  // Fetch survey responses
  useEffect(() => {
    const fetchResponses = async () => {
      if (!hasAccess) return;

      try {
        const { data, error } = await supabase
          .from("survey_responses")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setResponses(data || []);
        setFilteredResponses(data || []);
      } catch (error) {
        console.error("Error fetching responses:", error);
        toast.error("Failed to load survey responses");
      } finally {
        setLoading(false);
      }
    };

    if (hasAccess) {
      fetchResponses();
    }
  }, [hasAccess]);

  // Apply filters
  useEffect(() => {
    let filtered = [...responses];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(search) ||
          r.email.toLowerCase().includes(search) ||
          r.phone?.toLowerCase().includes(search) ||
          r.business_type.toLowerCase().includes(search)
      );
    }

    if (businessTypeFilter !== "all") {
      filtered = filtered.filter((r) => r.business_type === businessTypeFilter);
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter((r) => r.location === locationFilter);
    }

    setFilteredResponses(filtered);
  }, [searchTerm, businessTypeFilter, locationFilter, responses]);

  // Get unique values for filters
  const businessTypes = [...new Set(responses.map((r) => r.business_type))];
  const locations = [...new Set(responses.map((r) => r.location))];

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Date",
      "Name",
      "Email",
      "Phone",
      "Business Type",
      "Employees",
      "Location",
      "Current Method",
      "Challenges",
      "Biggest Pain",
      "Interested Features",
      "Budget Range",
      "Launch Interest",
      "Additional Comments",
    ];

    const rows = filteredResponses.map((r) => [
      format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
      r.full_name || "",
      r.email,
      r.phone || "",
      r.business_type,
      r.employee_count,
      r.location,
      r.current_method || "",
      r.challenges?.join("; ") || "",
      r.biggest_pain || "",
      r.interested_features?.join("; ") || "",
      r.budget_range || "",
      r.launch_interest || "",
      r.additional_comments || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `survey-responses-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Survey responses exported successfully");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view survey responses. Only admins and managers can access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-heading font-bold">Survey Responses</h1>
                <p className="text-sm text-muted-foreground">
                  Manage and analyze market survey data
                </p>
              </div>
            </div>
            <Button onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{responses.length}</p>
                  <p className="text-sm text-muted-foreground">Total Responses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Building className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{businessTypes.length}</p>
                  <p className="text-sm text-muted-foreground">Business Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{locations.length}</p>
                  <p className="text-sm text-muted-foreground">Locations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {responses.filter(
                      (r) => new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length}
                  </p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, or business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4">
                <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Business Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Business Types</SelectItem>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[180px]">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredResponses.length} of {responses.length} responses
          </p>
        </div>

        {/* Responses Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Business Type</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Launch Interest</TableHead>
                    <TableHead>Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {responses.length === 0 
                          ? "No survey responses yet" 
                          : "No responses match your filters"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResponses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(response.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {response.full_name || "-"}
                        </TableCell>
                        <TableCell>{response.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{response.business_type}</Badge>
                        </TableCell>
                        <TableCell>{response.employee_count}</TableCell>
                        <TableCell>{response.location}</TableCell>
                        <TableCell>
                          {response.launch_interest && (
                            <Badge 
                              variant={
                                response.launch_interest === "definitely_yes" 
                                  ? "default" 
                                  : response.launch_interest === "probably_yes"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {response.launch_interest.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{response.budget_range || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminSurvey;
