import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";
const FROM_EMAIL = "OptimalStock Pro <info@optimalstockpro.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const brand = {
  primary: "#16a34a",
  primaryDark: "#15803d",
  foreground: "#1a2e1a",
  muted: "#4b6b4b",
  bg: "#f0fdf4",
  white: "#ffffff",
  radius: "12px",
  fontStack: "'Sora', 'DM Sans', Arial, sans-serif",
};

const wrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${brand.white};font-family:${brand.fontStack};">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <span style="font-size:24px;font-weight:700;color:${brand.primary};">OptimalStock Pro</span>
  </div>
  ${content}
  <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e5e7eb;text-align:center;color:${brand.muted};font-size:13px;">
    <p style="margin:0 0 8px;">OptimalStock Pro — Smart Inventory for Nigerian Businesses</p>
    <p style="margin:0;">📧 info@optimalstockpro.com · 📞 +234 814 817 0730</p>
    <p style="margin:8px 0 0;">Best regards,<br><strong style="color:${brand.foreground};">Arinola Abolarin</strong></p>
  </div>
</div>
</body>
</html>`;

const btn = (text: string, url: string) =>
  `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:${brand.primary};color:#fff;text-decoration:none;border-radius:${brand.radius};font-weight:600;font-size:16px;">${text}</a>
  </div>`;

const DASHBOARD = "https://optimalstockpro-ng.lovable.app/dashboard";

function buildDay2Email(name: string) {
  return {
    subject: "Quick tips to get the most from OptimalStock Pro 💡",
    html: wrapper(`
      <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">Hey ${escapeHtml(name) || "there"}, settling in?</h1>
      <p style="color:${brand.muted};font-size:16px;line-height:1.6;">Here are some tips to help you save time right away:</p>
      <div style="background:${brand.bg};border-radius:${brand.radius};padding:24px;margin:24px 0;">
        <p style="margin:0 0 16px;color:${brand.foreground};">📸 <strong>Barcode Scanner</strong> — Scan items with your phone camera for instant stock entry</p>
        <p style="margin:0 0 16px;color:${brand.foreground};">📊 <strong>Dashboard Insights</strong> — See your inventory health at a glance</p>
        <p style="margin:0 0 16px;color:${brand.foreground};">🔔 <strong>WhatsApp Alerts</strong> — Get low-stock and expiry notifications on WhatsApp</p>
        <p style="margin:0;color:${brand.foreground};">📦 <strong>Purchase Orders</strong> — Create POs and track supplier deliveries</p>
      </div>
      ${btn("Explore Features", DASHBOARD)}
    `),
  };
}

function buildDay5Email(name: string) {
  return {
    subject: "Unlock the full power of OptimalStock Pro 🚀",
    html: wrapper(`
      <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">You're doing great, ${escapeHtml(name) || "there"}!</h1>
      <p style="color:${brand.muted};font-size:16px;line-height:1.6;">By now you've seen the basics. Here's what makes OptimalStock Pro a game-changer:</p>
      <div style="margin:24px 0;">
        <div style="background:${brand.bg};border-radius:${brand.radius};padding:20px;margin-bottom:16px;">
          <p style="margin:0;color:${brand.foreground};"><strong>🏗️ Project-Based Tracking</strong></p>
          <p style="margin:8px 0 0;color:${brand.muted};font-size:14px;">Assign inventory to specific projects and track material usage in real time.</p>
        </div>
        <div style="background:${brand.bg};border-radius:${brand.radius};padding:20px;margin-bottom:16px;">
          <p style="margin:0;color:${brand.foreground};"><strong>📋 Reports & Analytics</strong></p>
          <p style="margin:8px 0 0;color:${brand.muted};font-size:14px;">Generate detailed reports on stock movement, value, and trends.</p>
        </div>
        <div style="background:${brand.bg};border-radius:${brand.radius};padding:20px;">
          <p style="margin:0;color:${brand.foreground};"><strong>🔄 Store Transfers</strong></p>
          <p style="margin:8px 0 0;color:${brand.muted};font-size:14px;">Move stock between locations with full audit trails.</p>
        </div>
      </div>
      ${btn("Try These Features", DASHBOARD)}
    `),
  };
}

function buildMonthlySummaryEmail(name: string, stats: {
  totalItems: number;
  totalValue: number;
  movements: number;
  lowStockCount: number;
  expiringCount: number;
  itemsAdded: number;
  topItems: Array<{ name: string; quantity: number }>;
  month: string;
}) {
  let topItemsHtml = "";
  if (stats.topItems.length > 0) {
    topItemsHtml = `
      <div style="background:${brand.bg};border-radius:${brand.radius};padding:24px;margin:24px 0;">
        <p style="margin:0 0 12px;font-weight:600;color:${brand.foreground};">📦 Top Items by Quantity:</p>
        ${stats.topItems.map((item, i) =>
          `<p style="margin:0 0 8px;color:${brand.muted};">${i + 1}. ${escapeHtml(item.name)} — ${item.quantity} units</p>`
        ).join("")}
      </div>`;
  }

  return {
    subject: `📊 Your Monthly Inventory Summary — ${escapeHtml(stats.month)}`,
    html: wrapper(`
      <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">Monthly Summary for ${escapeHtml(stats.month)}</h1>
      <p style="color:${brand.muted};font-size:16px;line-height:1.6;">Hey ${escapeHtml(name) || "there"}, here's how your inventory performed this month:</p>
      
      <div style="margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:50%;padding:8px;">
              <div style="background:${brand.bg};border-radius:${brand.radius};padding:20px;text-align:center;">
                <p style="margin:0;font-size:28px;font-weight:700;color:${brand.primary};">${stats.totalItems}</p>
                <p style="margin:4px 0 0;font-size:13px;color:${brand.muted};">Total Items</p>
              </div>
            </td>
            <td style="width:50%;padding:8px;">
              <div style="background:${brand.bg};border-radius:${brand.radius};padding:20px;text-align:center;">
                <p style="margin:0;font-size:28px;font-weight:700;color:${brand.primaryDark};">₦${stats.totalValue.toLocaleString()}</p>
                <p style="margin:4px 0 0;font-size:13px;color:${brand.muted};">Inventory Value</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="width:50%;padding:8px;">
              <div style="background:${brand.bg};border-radius:${brand.radius};padding:20px;text-align:center;">
                <p style="margin:0;font-size:28px;font-weight:700;color:${brand.primary};">${stats.movements}</p>
                <p style="margin:4px 0 0;font-size:13px;color:${brand.muted};">Stock Movements</p>
              </div>
            </td>
            <td style="width:50%;padding:8px;">
              <div style="background:${brand.bg};border-radius:${brand.radius};padding:20px;text-align:center;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#ef4444;">${stats.lowStockCount}</p>
                <p style="margin:4px 0 0;font-size:13px;color:${brand.muted};">Low Stock Items</p>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:${brand.bg};border-radius:${brand.radius};padding:24px;margin:24px 0;">
        <p style="margin:0 0 12px;font-weight:600;color:${brand.foreground};">📋 Highlights:</p>
        <p style="margin:0 0 8px;color:${brand.muted};">📦 Items added this month: ${stats.itemsAdded}</p>
        <p style="margin:0 0 8px;color:${brand.muted};">🚨 Low stock alerts: ${stats.lowStockCount}</p>
        <p style="margin:0;color:${brand.muted};">⏰ Expiring soon: ${stats.expiringCount}</p>
      </div>

      ${topItemsHtml}

      ${btn("View Full Report", DASHBOARD)}
    `),
  };
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Resend error for ${to}:`, err);
    return false;
  }
  const result = await res.json();
  console.log(`Email sent to ${to}:`, result.id);
  return true;
}

async function sendWhatsApp(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error("Twilio credentials not configured, skipping WhatsApp");
    return false;
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const formData = new URLSearchParams();
  formData.append("To", `whatsapp:${to}`);
  formData.append("From", TWILIO_WHATSAPP_FROM!);
  formData.append("Body", body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`Twilio error for ${to}:`, err);
    return false;
  }
  const result = await response.json();
  console.log(`WhatsApp sent to ${to}:`, result.sid);
  return true;
}

function buildWeeklySummaryWhatsApp(name: string, stats: {
  totalItems: number;
  totalValue: number;
  movements: number;
  lowStockItems: Array<{ name: string; quantity: number }>;
  expiringItems: Array<{ name: string; expiryDate: string }>;
}) {
  let msg = `📊 *WEEKLY SUMMARY* — OptimalStock Pro\n\n`;
  msg += `Hey ${name || "there"}, here's your weekly snapshot:\n\n`;
  msg += `📦 Total Items: ${stats.totalItems}\n`;
  msg += `💰 Inventory Value: ₦${stats.totalValue.toLocaleString()}\n`;
  msg += `🔄 Stock Movements (this week): ${stats.movements}\n\n`;

  if (stats.lowStockItems.length > 0) {
    msg += `🚨 *Low Stock Items:*\n`;
    stats.lowStockItems.slice(0, 10).forEach((item, i) => {
      msg += `  ${i + 1}. ${item.name} — ${item.quantity} left\n`;
    });
    msg += `\n`;
  }

  if (stats.expiringItems.length > 0) {
    msg += `⏰ *Expiring Soon:*\n`;
    stats.expiringItems.slice(0, 5).forEach((item, i) => {
      msg += `  ${i + 1}. ${item.name} — ${item.expiryDate}\n`;
    });
    msg += `\n`;
  }

  msg += `📈 View details: https://optimalstockpro-ng.lovable.app/dashboard`;
  return msg;
}

function buildWeeklyDigestEmail(name: string, stats: {
  totalItems: number;
  totalValue: number;
  movements: number;
  lowStockCount: number;
  expiringCount: number;
  itemsAdded: number;
  incoming: number;
  outgoing: number;
  topItems: Array<{ name: string; quantity: number }>;
  lowStockItems: Array<{ name: string; quantity: number }>;
  expiringItems: Array<{ name: string; expiryDate: string }>;
  weekLabel: string;
}) {
  const lowStockHtml = stats.lowStockItems.length > 0
    ? `<div style="background:#fef2f2;border-radius:${brand.radius};padding:20px;margin:16px 0;">
        <p style="margin:0 0 12px;font-weight:600;color:#dc2626;">🚨 Low Stock Alert (${stats.lowStockCount} items)</p>
        ${stats.lowStockItems.slice(0, 5).map(i =>
          `<p style="margin:0 0 6px;color:#7f1d1d;font-size:14px;">• ${escapeHtml(i.name)} — ${i.quantity} left</p>`
        ).join("")}
        ${stats.lowStockItems.length > 5 ? `<p style="margin:8px 0 0;color:#991b1b;font-size:13px;">+ ${stats.lowStockItems.length - 5} more</p>` : ""}
      </div>` : "";

  const expiringHtml = stats.expiringItems.length > 0
    ? `<div style="background:#fffbeb;border-radius:${brand.radius};padding:20px;margin:16px 0;">
        <p style="margin:0 0 12px;font-weight:600;color:#d97706;">⏰ Expiring Soon (${stats.expiringCount} items)</p>
        ${stats.expiringItems.slice(0, 5).map(i =>
          `<p style="margin:0 0 6px;color:#78350f;font-size:14px;">• ${escapeHtml(i.name)} — expires ${i.expiryDate}</p>`
        ).join("")}
      </div>` : "";

  const topItemsHtml = stats.topItems.length > 0
    ? `<div style="background:${brand.bg};border-radius:${brand.radius};padding:20px;margin:16px 0;">
        <p style="margin:0 0 12px;font-weight:600;color:${brand.foreground};">📦 Top Items by Quantity</p>
        ${stats.topItems.map((item, i) =>
          `<p style="margin:0 0 6px;color:${brand.muted};font-size:14px;">${i + 1}. ${escapeHtml(item.name)} — ${item.quantity} units</p>`
        ).join("")}
      </div>` : "";

  return {
    subject: `📋 Weekly Digest — ${escapeHtml(stats.weekLabel)}`,
    html: wrapper(`
      <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 8px;">Weekly Inventory Digest</h1>
      <p style="color:${brand.muted};font-size:14px;margin:0 0 20px;">${escapeHtml(stats.weekLabel)}</p>
      <p style="color:${brand.muted};font-size:16px;line-height:1.6;margin:0 0 24px;">Hey ${escapeHtml(name) || "there"}, here's what happened with your inventory this week:</p>
      
      <div style="margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:33%;padding:6px;">
              <div style="background:${brand.bg};border-radius:${brand.radius};padding:16px;text-align:center;">
                <p style="margin:0;font-size:24px;font-weight:700;color:${brand.primary};">${stats.incoming}</p>
                <p style="margin:4px 0 0;font-size:12px;color:${brand.muted};">Incoming</p>
              </div>
            </td>
            <td style="width:33%;padding:6px;">
              <div style="background:${brand.bg};border-radius:${brand.radius};padding:16px;text-align:center;">
                <p style="margin:0;font-size:24px;font-weight:700;color:#ef4444;">${stats.outgoing}</p>
                <p style="margin:4px 0 0;font-size:12px;color:${brand.muted};">Outgoing</p>
              </div>
            </td>
            <td style="width:33%;padding:6px;">
              <div style="background:${brand.bg};border-radius:${brand.radius};padding:16px;text-align:center;">
                <p style="margin:0;font-size:24px;font-weight:700;color:${brand.primaryDark};">${stats.itemsAdded}</p>
                <p style="margin:4px 0 0;font-size:12px;color:${brand.muted};">New Items</p>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:${brand.bg};border-radius:${brand.radius};padding:20px;margin:16px 0;">
        <p style="margin:0 0 12px;font-weight:600;color:${brand.foreground};">📊 Snapshot</p>
        <p style="margin:0 0 8px;color:${brand.muted};font-size:14px;">📦 Total items in stock: ${stats.totalItems}</p>
        <p style="margin:0 0 8px;color:${brand.muted};font-size:14px;">💰 Total inventory value: ₦${stats.totalValue.toLocaleString()}</p>
        <p style="margin:0;color:${brand.muted};font-size:14px;">🔄 Total movements: ${stats.movements}</p>
      </div>

      ${lowStockHtml}
      ${expiringHtml}
      ${topItemsHtml}

      ${btn("View Dashboard", DASHBOARD)}
    `),
  };
}

async function getUserStats(supabase: any, userId: string, periodStart: Date) {
  // Total items & value
  const { data: items } = await supabase
    .from("inventory_items")
    .select("id, name, quantity, unit_price, reorder_level, expiry_date")
    .eq("user_id", userId);

  const allItems = items || [];
  const totalItems = allItems.length;
  const totalValue = allItems.reduce((sum: number, i: any) => sum + (i.quantity || 0) * (i.unit_price || 0), 0);

  // Low stock
  const lowStockItems = allItems.filter((i: any) => i.quantity <= (i.reorder_level || 10));

  // Expiring within 14 days
  const now = new Date();
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const expiringItems = allItems.filter((i: any) => {
    if (!i.expiry_date) return false;
    const exp = new Date(i.expiry_date);
    return exp >= now && exp <= twoWeeks;
  });

  // Stock movements in period
  const { count: movements } = await supabase
    .from("stock_movements")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", periodStart.toISOString());

  // Items added in period
  const { count: itemsAdded } = await supabase
    .from("inventory_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", periodStart.toISOString());

  // Top 5 items by quantity
  const topItems = [...allItems]
    .sort((a: any, b: any) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 5)
    .map((i: any) => ({ name: i.name, quantity: i.quantity }));

  return {
    totalItems,
    totalValue,
    movements: movements || 0,
    lowStockCount: lowStockItems.length,
    lowStockItems: lowStockItems.map((i: any) => ({ name: i.name, quantity: i.quantity })),
    expiringCount: expiringItems.length,
    expiringItems: expiringItems.map((i: any) => ({ name: i.name, expiryDate: i.expiry_date })),
    itemsAdded: itemsAdded || 0,
    topItems,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    const jobType = body.type || "drip"; // "drip" | "monthly" | "weekly_whatsapp" | "weekly_digest"

    const now = new Date();
    let sent = 0;
    let errors = 0;

    // Fetch all users
    const { data: { users: allUsers }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) {
      console.error("Failed to list users:", usersError);
      return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name");
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));

    // ──────────────────────────────────
    // MONTHLY SUMMARY EMAIL
    // ──────────────────────────────────
    if (jobType === "monthly") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthName = now.toLocaleString("en-NG", { month: "long", year: "numeric" });

      for (const user of allUsers || []) {
        if (!user.email) continue;
        const name = profileMap.get(user.id) || user.user_metadata?.full_name || "";

        try {
          const stats = await getUserStats(supabase, user.id, monthStart);
          // Only send if user has any inventory activity
          if (stats.totalItems === 0 && stats.movements === 0) continue;

          const { subject, html } = buildMonthlySummaryEmail(name, {
            ...stats,
            month: monthName,
          });
          const ok = await sendEmail(user.email, subject, html);
          ok ? sent++ : errors++;
        } catch (e) {
          console.error(`Error processing monthly summary for ${user.email}:`, e);
          errors++;
        }
      }

      console.log(`Monthly summary emails: ${sent} sent, ${errors} failed`);
      return new Response(
        JSON.stringify({ success: true, job: "monthly", sent, errors }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ──────────────────────────────────
    // WEEKLY WHATSAPP SUMMARY
    // ──────────────────────────────────
    if (jobType === "weekly_whatsapp") {
      // Get notification settings for users with WhatsApp enabled
      const { data: notifSettings } = await supabase
        .from("notification_settings")
        .select("user_id, whatsapp_number, whatsapp_notifications, weekly_summary")
        .eq("whatsapp_notifications", true)
        .eq("weekly_summary", true);

      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);

      for (const setting of notifSettings || []) {
        if (!setting.whatsapp_number) continue;

        const name = profileMap.get(setting.user_id) || "";

        try {
          const stats = await getUserStats(supabase, setting.user_id, weekStart);
          if (stats.totalItems === 0 && stats.movements === 0) continue;

          const message = buildWeeklySummaryWhatsApp(name, stats);
          const ok = await sendWhatsApp(setting.whatsapp_number, message);
          ok ? sent++ : errors++;
        } catch (e) {
          console.error(`Error processing WhatsApp summary for ${setting.user_id}:`, e);
          errors++;
        }
      }

      console.log(`Weekly WhatsApp summaries: ${sent} sent, ${errors} failed`);
      return new Response(
        JSON.stringify({ success: true, job: "weekly_whatsapp", sent, errors }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ──────────────────────────────────
    // WEEKLY DIGEST EMAIL
    // ──────────────────────────────────
    if (jobType === "weekly_digest") {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);

      for (const user of allUsers || []) {
        if (!user.email) continue;
        const name = profileMap.get(user.id) || user.user_metadata?.full_name || "";

        try {
          const stats = await getUserStats(supabase, user.id, weekStart);
          if (stats.totalItems === 0 && stats.movements === 0) continue;

          // Get incoming vs outgoing breakdown
          const { count: incomingCount } = await supabase
            .from("stock_movements")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("movement_type", "incoming")
            .gte("created_at", weekStart.toISOString());

          const { count: outgoingCount } = await supabase
            .from("stock_movements")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("movement_type", "outgoing")
            .gte("created_at", weekStart.toISOString());

          const weekLabel = `${weekStart.toLocaleDateString("en-NG", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}`;

          const { subject, html } = buildWeeklyDigestEmail(name, {
            ...stats,
            incoming: incomingCount || 0,
            outgoing: outgoingCount || 0,
            weekLabel,
          });
          const ok = await sendEmail(user.email!, subject, html);
          ok ? sent++ : errors++;
        } catch (e) {
          console.error(`Error processing weekly digest for ${user.email}:`, e);
          errors++;
        }
      }

      console.log(`Weekly digest emails: ${sent} sent, ${errors} failed`);
      return new Response(
        JSON.stringify({ success: true, job: "weekly_digest", sent, errors }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ──────────────────────────────────
    // ONBOARDING DRIP EMAILS (default)
    // ──────────────────────────────────
    const day2Start = new Date(now);
    day2Start.setDate(day2Start.getDate() - 2);
    day2Start.setHours(0, 0, 0, 0);
    const day2End = new Date(day2Start);
    day2End.setHours(23, 59, 59, 999);

    const day5Start = new Date(now);
    day5Start.setDate(day5Start.getDate() - 5);
    day5Start.setHours(0, 0, 0, 0);
    const day5End = new Date(day5Start);
    day5End.setHours(23, 59, 59, 999);

    for (const user of allUsers || []) {
      const createdAt = new Date(user.created_at);
      const email = user.email;
      if (!email) continue;

      const name = profileMap.get(user.id) || user.user_metadata?.full_name || "";

      if (createdAt >= day2Start && createdAt <= day2End) {
        const { subject, html } = buildDay2Email(name);
        const ok = await sendEmail(email, subject, html);
        ok ? sent++ : errors++;
      }

      if (createdAt >= day5Start && createdAt <= day5End) {
        const { subject, html } = buildDay5Email(name);
        const ok = await sendEmail(email, subject, html);
        ok ? sent++ : errors++;
      }
    }

    console.log(`Scheduled emails complete: ${sent} sent, ${errors} failed`);
    return new Response(
      JSON.stringify({ success: true, job: "drip", sent, errors }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Scheduled email error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
