import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Json } from "@/integrations/supabase/types";
import {
  Brain,
  RefreshCw,
  Download,
  Search,
  Calendar,
  Filter,
  Mail,
  Phone,
  Building2,
  MapPin,
  TrendingUp,
  Users,
  Flame,
  Sparkles,
  CheckCircle2,
  Clock,
  X,
  ExternalLink,
  Tags,
  Frown,
  Activity,
} from "lucide-react";


interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  source: string;
  source_detail: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  business_type: string | null;
  location: string | null;
  employee_count: string | null;
  interest: string | null;
  budget_range: string | null;
  message: string | null;
  score: number;
  ai_summary: string | null;
  tags: string[] | null;
  pain_points: string[] | null;
  recommended_plan: string | null;
  assigned_to: string | null;
  synced_crm_at: string | null;
  crm_record_id: string | null;
  crm_provider: string | null;
  raw_data: Json;
  ndpr_consent: boolean;
  metadata: Json;
}

interface LeadActivity {
  id: string;
  created_at: string;
  event_type: string;
  event_data: Json;
  url: string | null;
  referrer: string | null;
}

// CRM pipeline stages for Optimalstock Pro's own sales funnel
const pipelineStages = [
  { key: "new", label: "New", hint: "Just came in", accent: "border-l-blue-500" },
  { key: "contacted", label: "Contacted", hint: "Outreach sent", accent: "border-l-amber-500" },
  { key: "qualified", label: "Qualified", hint: "Good fit confirmed", accent: "border-l-purple-500" },
  { key: "converted", label: "Converted", hint: "Now a customer", accent: "border-l-emerald-500" },
] as const;

const statusOptions = [...pipelineStages.map((s) => s.key), "nurturing", "lost"];
const sourceOptions = ["website_contact", "demo", "survey", "whatsapp", "social_ad", "referral", "other"];

const nextStage = (status: string) => {
  const idx = pipelineStages.findIndex((s) => s.key === status);
  if (idx === -1 || idx === pipelineStages.length - 1) return null;
  return pipelineStages[idx + 1];
};



const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const scoreColor = (score: number) => {
  if (score >= 70) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (score >= 40) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
};

const LeadIntelligence = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      console.error("Failed to load leads:", err);
      toast.error("Could not load leads", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (lead.name?.toLowerCase().includes(q) ?? false) ||
        (lead.email?.toLowerCase().includes(q) ?? false) ||
        (lead.company_name?.toLowerCase().includes(q) ?? false) ||
        (lead.ai_summary?.toLowerCase().includes(q) ?? false) ||
        (lead.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
      const matchesPlan = planFilter === "all" || lead.recommended_plan === planFilter;

      const created = new Date(lead.created_at);
      const matchesFrom = !dateFrom || created >= new Date(dateFrom + "T00:00:00");
      const matchesTo = !dateTo || created <= new Date(dateTo + "T23:59:59");

      return matchesSearch && matchesStatus && matchesSource && matchesPlan && matchesFrom && matchesTo;
    });
  }, [leads, search, statusFilter, sourceFilter, planFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter((l) => l.score >= 70).length;
    const warm = leads.filter((l) => l.score >= 40 && l.score < 70).length;
    const avg = total ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / total) : 0;
    const newThisWeek = leads.filter((l) => {
      const d = new Date(l.created_at);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    }).length;
    return { total, hot, warm, avg, newThisWeek };
  }, [leads]);

  const pipeline = useMemo(() => {
    return pipelineStages.map((stage) => ({
      ...stage,
      leads: filteredLeads
        .filter((l) => l.status === stage.key)
        .sort((a, b) => b.score - a.score),
    }));
  }, [filteredLeads]);

  const conversionRate = useMemo(() => {
    if (!leads.length) return 0;
    return Math.round((leads.filter((l) => l.status === "converted").length / leads.length) * 100);
  }, [leads]);



  const handleProcess = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("leads-process", {
        body: {},
      });
      if (error) throw error;
      toast.success(`Processed ${data.processed || 0} leads`, {
        description: data.failed ? `${data.failed} failed` : "Scoring and CRM sync completed.",
      });
      await fetchLeads();
    } catch (err: any) {
      console.error("Lead processing failed:", err);
      toast.error("Processing failed", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
      if (error) throw error;
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
      setSelectedLead((prev) => (prev && prev.id === leadId ? { ...prev, status } : prev));
      toast.success(`Moved to ${status}`);

    } catch (err: any) {
      toast.error("Update failed", { description: err.message });
    }
  };

  const handleExport = () => {
    const rows = filteredLeads.map((l) => ({
      Date: formatDate(l.created_at),
      Name: l.name || "",
      Email: l.email || "",
      Phone: l.phone || "",
      Company: l.company_name || "",
      Source: l.source,
      Status: l.status,
      Score: l.score,
      Plan: l.recommended_plan || "",
      Summary: l.ai_summary || "",
      Tags: (l.tags || []).join(", "),
    }));
    if (!rows.length) {
      toast.info("No leads to export");
      return;
    }
    const headers = Object.keys(rows[0]).join(",");
    const csv = [headers, ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const openDetails = async (lead: Lead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
    setActivitiesLoading(true);
    try {
      // Try to load activities by session_id if available, or by lead_id otherwise.
      const metaObj = typeof lead.metadata === "object" && lead.metadata !== null && !Array.isArray(lead.metadata)
        ? (lead.metadata as Record<string, Json>)
        : null;
      const rawObj = typeof lead.raw_data === "object" && lead.raw_data !== null && !Array.isArray(lead.raw_data)
        ? (lead.raw_data as Record<string, Json>)
        : null;
      const rawSessionId = metaObj?.session_id ?? rawObj?.session_id;
      const sessionId = typeof rawSessionId === "string" ? rawSessionId : null;
      let query = supabase.from("lead_activities").select("*").order("created_at", { ascending: false }).limit(50);
      if (sessionId) {
        query = query.eq("session_id", sessionId);
      } else {
        query = query.eq("lead_id", lead.id);
      }
      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (err: any) {
      console.error("Failed to load activities:", err);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const hasFilters = search || statusFilter !== "all" || sourceFilter !== "all" || planFilter !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSourceFilter("all");
    setPlanFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            Lead Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-scored leads, activity signals, and CRM-ready insights.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!filteredLeads.length}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            onClick={handleProcess}
            disabled={processing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${processing ? "animate-spin" : ""}`} />
            {processing ? "Scoring..." : "Run AI Scoring"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.newThisWeek}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hot Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold">{stats.hot}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warm Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats.warm}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-2xl font-bold">{stats.avg}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline board */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Sales Pipeline
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {conversionRate}% converted overall
          </span>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {pipelineStages.map((s) => (
                <Skeleton key={s.key} className="h-40 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {pipeline.map((stage) => (
                <div key={stage.key} className="rounded-lg bg-muted/40 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold capitalize">{stage.label}</div>
                      <div className="text-[11px] text-muted-foreground">{stage.hint}</div>
                    </div>
                    <Badge variant="secondary">{stage.leads.length}</Badge>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {stage.leads.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">No leads here</p>
                    ) : (
                      stage.leads.map((lead) => {
                        const advance = nextStage(lead.status);
                        return (
                          <div
                            key={lead.id}
                            className={`rounded-md border-l-4 ${stage.accent} bg-card p-2.5 shadow-sm cursor-pointer`}
                            onClick={() => openDetails(lead)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {lead.name || "Anonymous"}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {lead.company_name || lead.email || lead.phone || "—"}
                                </div>
                              </div>
                              <Badge className={`text-[10px] ${scoreColor(lead.score)}`}>
                                {lead.score}
                              </Badge>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5">
                              {advance ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(lead.id, advance.key);
                                  }}
                                >
                                  Move to {advance.label}
                                </Button>
                              ) : (
                                <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Won
                                </span>
                              )}
                              {lead.status !== "lost" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-[11px] text-muted-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(lead.id, "lost");
                                  }}
                                >
                                  Lost
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>



      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-2">
              <Label className="text-xs mb-1.5 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Name, email, company, tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Source</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {sourceOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Recommended Plan</Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Distribution">Distribution</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Date Range</Label>
              <div className="flex items-center gap-2">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <span className="text-muted-foreground">→</span>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          </div>
          {hasFilters && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {filteredLeads.length} result{filteredLeads.length !== 1 ? "s" : ""}
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="w-4 h-4" />
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>AI Summary</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        {hasFilters ? "No leads match your filters." : "No leads yet. Submit the contact form or ingest from an external source."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className="cursor-pointer" onClick={() => openDetails(lead)}>
                        <TableCell>
                          <div className="font-medium">{lead.name || "Anonymous"}</div>
                          <div className="text-xs text-muted-foreground">{lead.email || lead.phone || "—"}</div>
                          {lead.company_name && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3" />
                              {lead.company_name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {lead.source.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${scoreColor(lead.score)}`}>{lead.score}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(v) => handleUpdateStatus(lead.id, v)}
                          >
                            <SelectTrigger className="h-8 w-32 text-xs capitalize">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((s) => (
                                <SelectItem key={s} value={s} className="capitalize">
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{lead.recommended_plan || "—"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {lead.ai_summary || "Not scored yet"}
                          </div>
                          {(lead.tags || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(lead.tags || []).slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(lead.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetails(lead);
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedLead.name || "Anonymous Lead"}
                  <Badge className={`text-xs ${scoreColor(selectedLead.score)}`}>{selectedLead.score}</Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedLead.email || selectedLead.phone || "No contact info"}
                  {selectedLead.company_name && ` · ${selectedLead.company_name}`}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 rounded-lg border p-3">
                <Label className="text-xs mb-2 block">Pipeline stage</Label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selectedLead.status === s ? "default" : "outline"}
                      className="h-8 text-xs capitalize"
                      onClick={() => handleUpdateStatus(selectedLead.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedLead.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedLead.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedLead.company_name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedLead.location || "—"}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business type</span>
                    <span className="font-medium">{selectedLead.business_type || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employees</span>
                    <span className="font-medium">{selectedLead.employee_count || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest</span>
                    <span className="font-medium">{selectedLead.interest || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium">{selectedLead.budget_range || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium capitalize">{selectedLead.source.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CRM sync</span>
                    <span className="font-medium flex items-center gap-1">
                      {selectedLead.synced_crm_at ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {formatDate(selectedLead.synced_crm_at)}
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Pending
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {selectedLead.ai_summary && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">AI Summary</span>
                  </div>
                  <p className="text-sm text-foreground">{selectedLead.ai_summary}</p>
                </div>
              )}

              {(selectedLead.pain_points || []).length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Frown className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">Likely Pain Points</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedLead.pain_points || []).map((p) => (
                      <Badge key={p} variant="outline">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(selectedLead.tags || []).length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tags className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedLead.tags || []).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedLead.message && (
                <div className="mt-6">
                  <span className="font-semibold text-sm">Message</span>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{selectedLead.message}</p>
                </div>
              )}

              {/* Activity */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Recent Activity</span>
                </div>
                {activitiesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tracked activity for this lead.</p>
                ) : (
                  <ul className="space-y-2">
                    {activities.map((a) => (
                      <li key={a.id} className="text-sm border-l-2 border-primary pl-3 py-1">
                        <span className="font-medium capitalize">{a.event_type.replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground ml-2">{formatDate(a.created_at)}</span>
                        {a.url && <div className="text-xs text-muted-foreground truncate">{a.url}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadIntelligence;
