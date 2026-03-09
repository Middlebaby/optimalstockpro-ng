import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

    // Get today's date boundaries
    const now = new Date();
    
    // Day 2 users: signed up exactly 2 days ago
    const day2Start = new Date(now);
    day2Start.setDate(day2Start.getDate() - 2);
    day2Start.setHours(0, 0, 0, 0);
    const day2End = new Date(day2Start);
    day2End.setHours(23, 59, 59, 999);

    // Day 5 users: signed up exactly 5 days ago
    const day5Start = new Date(now);
    day5Start.setDate(day5Start.getDate() - 5);
    day5Start.setHours(0, 0, 0, 0);
    const day5End = new Date(day5Start);
    day5End.setHours(23, 59, 59, 999);

    let sent = 0;
    let errors = 0;

    // Fetch day 2 users from auth.users via admin API
    const { data: { users: allUsers }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) {
      console.error("Failed to list users:", usersError);
      return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get profiles for names
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name");
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));

    for (const user of allUsers || []) {
      const createdAt = new Date(user.created_at);
      const email = user.email;
      if (!email) continue;

      const name = profileMap.get(user.id) || user.user_metadata?.full_name || "";

      // Day 2 email
      if (createdAt >= day2Start && createdAt <= day2End) {
        const { subject, html } = buildDay2Email(name);
        const ok = await sendEmail(email, subject, html);
        ok ? sent++ : errors++;
      }

      // Day 5 email
      if (createdAt >= day5Start && createdAt <= day5End) {
        const { subject, html } = buildDay5Email(name);
        const ok = await sendEmail(email, subject, html);
        ok ? sent++ : errors++;
      }
    }

    console.log(`Scheduled emails complete: ${sent} sent, ${errors} failed`);

    return new Response(
      JSON.stringify({ success: true, sent, errors }),
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
