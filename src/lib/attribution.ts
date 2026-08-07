// First-touch marketing attribution for Optimalstock Pro lead intelligence.
// Captures UTM parameters and referrer once per visitor and reuses them for
// every tracked event and lead submission.

const ATTRIBUTION_KEY = "lead_attribution";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
  channel: string;
  captured_at: string;
}

const SOCIAL_HOSTS: Record<string, string> = {
  "facebook.com": "Facebook",
  "fb.com": "Facebook",
  "instagram.com": "Instagram",
  "l.instagram.com": "Instagram",
  "twitter.com": "X (Twitter)",
  "x.com": "X (Twitter)",
  "linkedin.com": "LinkedIn",
  "lnkd.in": "LinkedIn",
  "tiktok.com": "TikTok",
  "youtube.com": "YouTube",
  "whatsapp.com": "WhatsApp",
  "t.co": "X (Twitter)",
  "telegram.org": "Telegram",
  "reddit.com": "Reddit",
};

const SEARCH_HOSTS = ["google.", "bing.", "yahoo.", "duckduckgo.", "ecosia."];

/** Human-friendly channel name from utm_source / utm_medium / referrer. */
export function classifyChannel(input: {
  utm_source?: string | null;
  utm_medium?: string | null;
  referrer?: string | null;
}): string {
  const source = (input.utm_source || "").toLowerCase();
  const medium = (input.utm_medium || "").toLowerCase();

  if (source) {
    for (const [host, label] of Object.entries(SOCIAL_HOSTS)) {
      if (source.includes(host.split(".")[0])) return label;
    }
    if (medium.includes("cpc") || medium.includes("paid") || medium.includes("ad")) {
      return `Paid — ${source}`;
    }
    if (medium.includes("email") || source.includes("email")) return "Email";
    if (medium.includes("whatsapp") || source.includes("whatsapp")) return "WhatsApp";
    return source.charAt(0).toUpperCase() + source.slice(1);
  }

  const referrer = (input.referrer || "").toLowerCase();
  if (!referrer) return "Direct";

  let host = referrer;
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    // keep raw string
  }

  if (typeof window !== "undefined" && host === window.location.hostname) return "Direct";
  for (const [key, label] of Object.entries(SOCIAL_HOSTS)) {
    if (host.includes(key)) return label;
  }
  if (SEARCH_HOSTS.some((s) => host.includes(s))) return "Organic search";
  return host || "Referral";
}

/** Reads (and stores on first visit) the visitor's first-touch attribution. */
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get("utm_source") || undefined;
  const utm_medium = params.get("utm_medium") || undefined;
  const utm_campaign = params.get("utm_campaign") || undefined;
  const utm_content = params.get("utm_content") || undefined;
  const utm_term = params.get("utm_term") || undefined;

  let stored: Attribution | null = null;
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
    if (raw) stored = JSON.parse(raw) as Attribution;
  } catch {
    stored = null;
  }

  // Keep the first touch unless this visit carries fresh campaign parameters.
  if (stored && !utm_source) return stored;

  const attribution: Attribution = {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer: document.referrer || undefined,
    landing_page: window.location.pathname,
    channel: classifyChannel({ utm_source, utm_medium, referrer: document.referrer }),
    captured_at: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // storage unavailable — attribution still works for this page view
  }

  return attribution;
}

export const campaignChannels = [
  { source: "instagram", medium: "social", label: "Instagram" },
  { source: "facebook", medium: "social", label: "Facebook" },
  { source: "whatsapp", medium: "social", label: "WhatsApp" },
  { source: "linkedin", medium: "social", label: "LinkedIn" },
  { source: "x", medium: "social", label: "X (Twitter)" },
  { source: "tiktok", medium: "social", label: "TikTok" },
  { source: "email", medium: "email", label: "Email newsletter" },
  { source: "flyer", medium: "offline", label: "Flyer / QR code" },
  { source: "meta", medium: "cpc", label: "Paid ads (Meta)" },
];

export const campaignDestinations = [
  { path: "/survey", label: "Market survey" },
  { path: "/get-started", label: "Get started" },
  { path: "/demo", label: "Live demo" },
  { path: "/", label: "Landing page" },
];

export function buildCampaignUrl(opts: {
  origin: string;
  path: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
}): string {
  const url = new URL(opts.path, opts.origin);
  url.searchParams.set("utm_source", opts.source);
  url.searchParams.set("utm_medium", opts.medium);
  if (opts.campaign) url.searchParams.set("utm_campaign", opts.campaign);
  if (opts.content) url.searchParams.set("utm_content", opts.content);
  return url.toString();
}
