import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Share2,
  Copy,
  Megaphone,
  MousePointerClick,
  Eye,
  Filter,
  ArrowRight,
} from "lucide-react";
import {
  buildCampaignUrl,
  campaignChannels,
  campaignDestinations,
  classifyChannel,
} from "@/lib/attribution";
import type { Json } from "@/integrations/supabase/types";

export interface AcquisitionLead {
  id: string;
  created_at: string;
  status: string;
  source: string;
  source_detail: string | null;
  score: number;
  metadata: Json;
  raw_data: Json;
}

interface Props {
  leads: AcquisitionLead[];
}

const stageOrder = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "converted", label: "Converted" },
];

const sourceLabels: Record<string, string> = {
  survey: "Market survey",
  website_contact: "Contact form",
  get_started: "Get started page",
  demo: "Live demo",
  landing_cta: "Landing CTA",
  social_ad: "Social ad",
  whatsapp: "WhatsApp",
  referral: "Referral",
  other: "Other",
};

const asRecord = (value: Json): Record<string, Json> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : null;

const leadChannel = (lead: AcquisitionLead): string => {
  const meta = asRecord(lead.metadata);
  const raw = asRecord(lead.raw_data);
  const attribution = asRecord(meta?.attribution ?? raw?.attribution ?? null);
  if (attribution) {
    const channel = attribution.channel;
    if (typeof channel === "string" && channel) return channel;
    return classifyChannel({
      utm_source: typeof attribution.utm_source === "string" ? attribution.utm_source : null,
      utm_medium: typeof attribution.utm_medium === "string" ? attribution.utm_medium : null,
      referrer: typeof attribution.referrer === "string" ? attribution.referrer : null,
    });
  }
  return "Direct";
};

const Bar = ({ value, total, tone = "bg-primary" }: { value: number; total: number; tone?: string }) => (
  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
    <div
      className={`h-full rounded-full ${tone} transition-all`}
      style={{ width: total > 0 ? `${Math.max((value / total) * 100, value > 0 ? 4 : 0)}%` : "0%" }}
    />
  </div>
);

const LeadAcquisition = ({ leads }: Props) => {
  const [trafficLoading, setTrafficLoading] = useState(true);
  const [traffic, setTraffic] = useState<{ pageViews: number; ctaClicks: number; sessions: number; topPages: [string, number][] }>({
    pageViews: 0,
    ctaClicks: 0,
    sessions: 0,
    topPages: [],
  });

  // Campaign link builder state
  const [destination, setDestination] = useState(campaignDestinations[0].path);
  const [channel, setChannel] = useState(campaignChannels[0].label);
  const [campaignName, setCampaignName] = useState("august-launch");

  useEffect(() => {
    let cancelled = false;
    const loadTraffic = async () => {
      setTrafficLoading(true);
      try {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from("lead_activities")
          .select("session_id, event_type, url")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(1000);
        if (error) throw error;
        if (cancelled) return;

        const rows = data || [];
        const sessions = new Set(rows.map((r) => r.session_id)).size;
        const pageViews = rows.filter((r) => r.event_type === "page_view").length;
        const ctaClicks = rows.filter((r) => r.event_type !== "page_view").length;
        const pageCounts = new Map<string, number>();
        rows
          .filter((r) => r.event_type === "page_view" && r.url)
          .forEach((r) => {
            let path = r.url as string;
            try {
              path = new URL(r.url as string).pathname;
            } catch {
              // keep raw
            }
            pageCounts.set(path, (pageCounts.get(path) || 0) + 1);
          });
        setTraffic({
          pageViews,
          ctaClicks,
          sessions,
          topPages: [...pageCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
        });
      } catch (err) {
        console.error("Failed to load traffic signals:", err);
        if (!cancelled) setTraffic({ pageViews: 0, ctaClicks: 0, sessions: 0, topPages: [] });
      } finally {
        if (!cancelled) setTrafficLoading(false);
      }
    };
    loadTraffic();
    return () => {
      cancelled = true;
    };
  }, []);

  const bySource = useMemo(() => {
    const map = new Map<string, { total: number; converted: number; qualified: number; scoreSum: number }>();
    leads.forEach((lead) => {
      const key = lead.source || "other";
      const entry = map.get(key) || { total: 0, converted: 0, qualified: 0, scoreSum: 0 };
      entry.total += 1;
      entry.scoreSum += lead.score || 0;
      if (lead.status === "converted") entry.converted += 1;
      if (lead.status === "qualified" || lead.status === "converted") entry.qualified += 1;
      map.set(key, entry);
    });
    return [...map.entries()]
      .map(([source, v]) => ({
        source,
        label: sourceLabels[source] || source.replace(/_/g, " "),
        ...v,
        avgScore: v.total ? Math.round(v.scoreSum / v.total) : 0,
        conversionRate: v.total ? Math.round((v.converted / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [leads]);

  const byChannel = useMemo(() => {
    const map = new Map<string, { total: number; converted: number }>();
    leads.forEach((lead) => {
      const key = leadChannel(lead);
      const entry = map.get(key) || { total: 0, converted: 0 };
      entry.total += 1;
      if (lead.status === "converted") entry.converted += 1;
      map.set(key, entry);
    });
    return [...map.entries()]
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [leads]);

  const funnel = useMemo(() => {
    const reached = (index: number) =>
      leads.filter((lead) => {
        const idx = stageOrder.findIndex((s) => s.key === lead.status);
        if (lead.status === "lost") return index === 0;
        if (lead.status === "nurturing") return index <= 1;
        return idx >= index;
      }).length;

    const total = leads.length;
    return stageOrder.map((stage, index) => {
      const count = reached(index);
      const previous = index === 0 ? total : reached(index - 1);
      return {
        ...stage,
        count,
        ofTotal: total ? Math.round((count / total) * 100) : 0,
        stepRate: previous ? Math.round((count / previous) * 100) : 0,
      };
    });
  }, [leads]);

  const lostCount = leads.filter((l) => l.status === "lost").length;
  const maxSource = bySource[0]?.total || 0;
  const maxChannel = byChannel[0]?.total || 0;

  const campaignUrl = useMemo(() => {
    const selected = campaignChannels.find((c) => c.label === channel) || campaignChannels[0];
    const origin = typeof window !== "undefined" ? window.location.origin : "https://optimalstockpro-ng.lovable.app";
    return buildCampaignUrl({
      origin,
      path: destination,
      source: selected.source,
      medium: selected.medium,
      campaign: campaignName.trim().replace(/\s+/g, "-").toLowerCase(),
    });
  }, [channel, destination, campaignName]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      toast.success("Campaign link copied");
    } catch {
      toast.error("Could not copy — select and copy manually");
    }
  };

  return (
    <div className="space-y-6">
      {/* Traffic signals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visitors tracked (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {trafficLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{traffic.sessions}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Page views (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {trafficLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold">{traffic.pageViews}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CTA / form clicks</CardTitle>
          </CardHeader>
          <CardContent>
            {trafficLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-amber-500" />
                <span className="text-2xl font-bold">{traffic.ctaClicks}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Where leads come from */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              Where leads come from
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bySource.length === 0 && (
              <p className="text-sm text-muted-foreground">No leads captured yet.</p>
            )}
            {bySource.map((row) => (
              <div key={row.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">{row.label}</span>
                  <span className="text-muted-foreground">
                    {row.total} · {row.conversionRate}% converted · avg {row.avgScore}
                  </span>
                </div>
                <Bar value={row.total} total={maxSource} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Marketing channels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              Marketing channel (UTM & referrer)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {byChannel.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No channel data yet — share a campaign link below to start attributing leads.
              </p>
            )}
            {byChannel.map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className="text-muted-foreground">
                    {row.total} lead{row.total === 1 ? "" : "s"} · {row.converted} won
                  </span>
                </div>
                <Bar value={row.total} total={maxChannel} tone="bg-blue-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Stage conversion funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            Conversion by pipeline stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {funnel.map((stage, index) => (
              <div key={stage.key} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.label}</span>
                  <Badge variant="secondary">{stage.ofTotal}%</Badge>
                </div>
                <div className="text-2xl font-bold">{stage.count}</div>
                <Bar value={stage.ofTotal} total={100} tone="bg-emerald-500" />
                <p className="text-xs text-muted-foreground">
                  {index === 0
                    ? "of all captured leads"
                    : `${stage.stepRate}% moved on from ${funnel[index - 1].label}`}
                </p>
              </div>
            ))}
          </div>
          {lostCount > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              {lostCount} lead{lostCount === 1 ? "" : "s"} marked lost and excluded from later stages.
            </p>
          )}
          {traffic.topPages.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <p className="text-sm font-medium mb-2">Top entry pages (30d)</p>
              <div className="flex flex-wrap gap-2">
                {traffic.topPages.map(([path, count]) => (
                  <Badge key={path} variant="outline">
                    {path} · {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign link builder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            Social & campaign link builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Build a tracked link for Instagram, WhatsApp, LinkedIn or a flyer QR code. Every visitor who
            arrives through it is tagged, so the survey or sign-up they complete is credited to that channel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {campaignChannels.map((c) => (
                    <SelectItem key={c.label} value={c.label}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Send them to</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {campaignDestinations.map((d) => (
                    <SelectItem key={d.path} value={d.path}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Campaign name</Label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. lagos-traders"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input readOnly value={campaignUrl} className="font-mono text-xs" />
            <Button onClick={copyUrl} className="gap-2 shrink-0">
              <Copy className="w-4 h-4" />
              Copy link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadAcquisition;
