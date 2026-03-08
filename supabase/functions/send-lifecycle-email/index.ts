import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "OptimalStock Pro <info@optimalstockpro.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Brand tokens
const brand = {
  primary: "#6366f1",       // hsl(239,84%,67%)
  primaryDark: "#7c3aed",   // hsl(263,70%,58%)
  foreground: "#3b4963",    // hsl(215,25%,27%)
  muted: "#6b7994",         // hsl(215,16%,47%)
  bg: "#f7f8fa",            // light bg
  white: "#ffffff",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
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

type EmailType =
  | "welcome"
  | "day2_onboarding"
  | "day5_features"
  | "trial_ending"
  | "trial_expired"
  | "payment_success"
  | "payment_failed"
  | "low_stock_alert"
  | "monthly_summary"
  | "support_response";

interface EmailPayload {
  emailType: EmailType;
  to: string;
  data?: Record<string, any>;
}

function buildEmail(payload: EmailPayload): { subject: string; html: string } {
  const name = escapeHtml(payload.data?.name) || "there";
  const d = payload.data || {};

  switch (payload.emailType) {
    case "welcome":
      return {
        subject: "Welcome to OptimalStock Pro! 🎉",
        html: wrapper(`
          <h1 style="color:${brand.foreground};font-size:26px;margin:0 0 16px;">Welcome aboard, ${name}!</h1>
          <p style="color:${brand.muted};font-size:16px;line-height:1.6;">
            You've just taken the first step to managing your inventory like a pro. OptimalStock Pro helps Nigerian businesses track stock, reduce waste, and boost profits.
          </p>
          <div style="background:${brand.bg};border-radius:${brand.radius};padding:24px;margin:24px 0;">
            <p style="margin:0 0 12px;font-weight:600;color:${brand.foreground};">Quick Start in 3 Steps:</p>
            <p style="margin:0 0 8px;color:${brand.muted};">1️⃣ Add your first inventory items</p>
            <p style="margin:0 0 8px;color:${brand.muted};">2️⃣ Set reorder levels for low-stock alerts</p>
            <p style="margin:0;color:${brand.muted};">3️⃣ Invite your team members</p>
          </div>
          ${btn("Go to Your Dashboard", DASHBOARD)}
        `),
      };

    case "day2_onboarding":
      return {
        subject: "Quick tips to get the most from OptimalStock Pro 💡",
        html: wrapper(`
          <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">Hey ${name}, settling in?</h1>
          <p style="color:${brand.muted};font-size:16px;line-height:1.6;">
            Here are some tips to help you save time right away:
          </p>
          <div style="background:${brand.bg};border-radius:${brand.radius};padding:24px;margin:24px 0;">
            <p style="margin:0 0 16px;color:${brand.foreground};">
              📸 <strong>Barcode Scanner</strong> — Scan items with your phone camera for instant stock entry
            </p>
            <p style="margin:0 0 16px;color:${brand.foreground};">
              📊 <strong>Dashboard Insights</strong> — See your inventory health at a glance
            </p>
            <p style="margin:0 0 16px;color:${brand.foreground};">
              🔔 <strong>WhatsApp Alerts</strong> — Get low-stock and expiry notifications on WhatsApp
            </p>
            <p style="margin:0;color:${brand.foreground};">
              📦 <strong>Purchase Orders</strong> — Create POs and track supplier deliveries
            </p>
          </div>
          ${btn("Explore Features", DASHBOARD)}
        `),
      };

    case "day5_features":
      return {
        subject: "Unlock the full power of OptimalStock Pro 🚀",
        html: wrapper(`
          <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">You're doing great, ${name}!</h1>
          <p style="color:${brand.muted};font-size:16px;line-height:1.6;">
            By now you've seen the basics. Here's what makes OptimalStock Pro a game-changer for Nigerian businesses:
          </p>
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

    case "trial_ending":
      return {
        subject: "Your trial ends in 3 days — don't lose your data! ⏳",
        html: wrapper(`
          <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">${name}, your trial is almost over</h1>
          <p style="color:${brand.muted};font-size:16px;line-height:1.6;">
            Your free trial expires in <strong>3 days</strong>. Upgrade now to keep all your inventory data, alerts, and reports.
          </p>
          <div style="background:linear-gradient(135deg,${brand.primary},${brand.primaryDark});border-radius:${brand.radius};padding:28px;margin:24px 0;text-align:center;color:#fff;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;">Starter Plan — ₦5,000/mo</p>
            <p style="margin:0;font-size:14px;opacity:0.9;">Unlimited items · WhatsApp alerts · Reports · Team access</p>
          </div>
          ${btn("Upgrade Now", DASHBOARD + "?tab=settings")}
          <p style="color:${brand.muted};font-size:14px;text-align:center;">Need more time? Reply to this email and we'll sort it out.</p>
        `),
      };

    case "trial_expired":
      return {
        subject: "Your trial has ended — here's what happens next",
        html: wrapper(`
          <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">Hey ${name}, your trial has ended</h1>
          <p style="color:${brand.muted};font-size:16px;line-height:1.6;">
            Your data is safe, but access to premium features is now limited. Upgrade to restore full access instantly.
          </p>
          <div style="background:${brand.bg};border-radius:${brand.radius};padding:24px;margin:24px 0;">
            <p style="margin:0 0 12px;font-weight:600;color:${brand.foreground};">What you're missing:</p>
            <p style="margin:0 0 8px;color:${brand.muted};">❌ WhatsApp & email alerts</p>
            <p style="margin:0 0 8px;color:${brand.muted};">❌ Reports & analytics</p>
            <p style="margin:0 0 8px;color:${brand.muted};">❌ Multi-user team access</p>
            <p style="margin:0;color:${brand.muted};">❌ Purchase order management</p>
          </div>
          ${btn("Reactivate My Account", DASHBOARD + "?tab=settings")}
        `),
      };

    case "payment_success":
      return {
        subject: "Payment confirmed — you're all set! ✅",
        html: wrapper(`
          <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">Payment received, ${name}!</h1>
          <p style="color:${brand.muted};font-size:16px;line-height:1.6;">Thank you for your payment. Your account is fully active.</p>
          <div style="background:${brand.bg};border-radius:${brand.radius};padding:24px;margin:24px 0;">
            <table style="width:100%;border-collapse:collapse;color:${brand.foreground};font-size:15px;">
              <tr><td style="padding:8px 0;">Plan</td><td style="padding:8px 0;text-align:right;font-weight:600;">${escapeHtml(d.plan) || "Starter"}</td></tr>
              <tr><td style="padding:8px 0;">Amount</td><td style="padding:8px 0;text-align:right;font-weight:600;">₦${escapeHtml(d.amount) || "5,000"}</td></tr>
              <tr><td style="padding:8px 0;">Date</td><td style="padding:8px 0;text-align:right;">${escapeHtml(d.date) || new Date().toLocaleDateString("en-NG")}</td></tr>
              <tr><td style="padding:8px 0;">Reference</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:13px;">${escapeHtml(d.reference) || "—"}</td></tr>
            </table>
          </div>
          ${btn("Go to Dashboard", DASHBOARD)}
        `),
      };

    case "payment_failed":
      return {
        subject: "Payment failed — action required ⚠️",
        html: wrapper(`
          <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">${name}, your payment didn't go through</h1>
          <p style="color:${brand.muted};font-size:16px;line-height:1.6;">
            We couldn't process your payment. This could be due to insufficient funds, an expired card, or a network issue.
          </p>
          <div style="background:#fef2f2;border-radius:${brand.radius};padding:24px;margin:24px 0;border-left:4px solid ${brand.error};">
            <p style="margin:0;color:${brand.foreground};font-weight:600;">What to do:</p>
            <p style="margin:8px 0 0;color:${brand.muted};">1. Check your card or bank account balance</p>
            <p style="margin:4px 0 0;color:${brand.muted};">2. Try again with the same or a different payment method</p>
            <p style="margin:4px 0 0;color:${brand.muted};">3. Contact your bank if the problem persists</p>
          </div>
          ${btn("Retry Payment", DASHBOARD + "?tab=settings")}
          <p style="color:${brand.muted};font-size:14px;text-align:center;">Your access will remain active for 3 more days while you resolve this.</p>
        `),
      };

    case "low_stock_alert": {
      const items = (d.items || []).slice(0, 10);
      let rows = "";
      items.forEach((item: any) => {
        rows += `<tr>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;color:${brand.foreground};">${escapeHtml(item.name)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;color:${brand.error};font-weight:600;">${item.quantity ?? 0}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;color:${brand.muted};">${item.reorderLevel ?? 10}</td>
        </tr>`;
      });
      return {
        subject: `🚨 Low Stock Alert — ${items.length} item${items.length !== 1 ? "s" : ""} need restocking`,
        html: wrapper(`
          <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">Low Stock Alert</h1>
          <p style="color:${brand.muted};font-size:16px;line-height:1.6;">
            Hey ${name}, the following items are running low and need to be reordered:
          </p>
          <div style="overflow:auto;margin:24px 0;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <thead><tr style="background:${brand.bg};">
                <th style="padding:10px 8px;text-align:left;color:${brand.foreground};">Item</th>
                <th style="padding:10px 8px;text-align:center;color:${brand.foreground};">Current</th>
                <th style="padding:10px 8px;text-align:center;color:${brand.foreground};">Reorder Level</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          ${btn("Reorder Now", DASHBOARD)}
        `),
      };
    }

    case "monthly_summary": {
      const s = d.summary || {};
      return {
        subject: `📊 Your Monthly Inventory Summary — ${escapeHtml(d.month) || "This Month"}`,
        html: wrapper(`
          <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">Monthly Summary</h1>
          <p style="color:${brand.muted};font-size:16px;line-height:1.6;">Hey ${name}, here's how your inventory performed this month:</p>
          <div style="display:flex;flex-wrap:wrap;gap:16px;margin:24px 0;">
            <div style="flex:1;min-width:140px;background:${brand.bg};border-radius:${brand.radius};padding:20px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:700;color:${brand.primary};">${s.totalItems ?? 0}</p>
              <p style="margin:4px 0 0;font-size:13px;color:${brand.muted};">Total Items</p>
            </div>
            <div style="flex:1;min-width:140px;background:${brand.bg};border-radius:${brand.radius};padding:20px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:700;color:${brand.success};">₦${(s.totalValue ?? 0).toLocaleString()}</p>
              <p style="margin:4px 0 0;font-size:13px;color:${brand.muted};">Inventory Value</p>
            </div>
            <div style="flex:1;min-width:140px;background:${brand.bg};border-radius:${brand.radius};padding:20px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:700;color:${brand.primaryDark};">${s.movements ?? 0}</p>
              <p style="margin:4px 0 0;font-size:13px;color:${brand.muted};">Stock Movements</p>
            </div>
          </div>
          <div style="background:${brand.bg};border-radius:${brand.radius};padding:24px;margin:24px 0;">
            <p style="margin:0 0 12px;font-weight:600;color:${brand.foreground};">Highlights:</p>
            <p style="margin:0 0 8px;color:${brand.muted};">📦 Items added: ${s.itemsAdded ?? 0}</p>
            <p style="margin:0 0 8px;color:${brand.muted};">🚨 Low stock alerts: ${s.lowStockCount ?? 0}</p>
            <p style="margin:0;color:${brand.muted};">⏰ Expiring soon: ${s.expiringCount ?? 0}</p>
          </div>
          ${btn("View Full Report", DASHBOARD)}
        `),
      };
    }

    case "support_response":
      return {
        subject: `Re: ${escapeHtml(d.ticketSubject) || "Your Support Request"} — We've responded`,
        html: wrapper(`
          <h1 style="color:${brand.foreground};font-size:24px;margin:0 0 16px;">We've replied to your request</h1>
          <p style="color:${brand.muted};font-size:16px;line-height:1.6;">Hey ${name}, we've responded to your support request:</p>
          <div style="background:${brand.bg};border-radius:${brand.radius};padding:24px;margin:24px 0;">
            <p style="margin:0 0 8px;font-weight:600;color:${brand.foreground};">Ticket: ${escapeHtml(d.ticketSubject) || "Support Request"}</p>
            <p style="margin:0;color:${brand.muted};font-size:14px;">Reference: #${escapeHtml(d.ticketId) || "000"}</p>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:${brand.radius};padding:24px;margin:24px 0;">
            <p style="margin:0;color:${brand.foreground};line-height:1.6;">${escapeHtml(d.response) || "Our team has reviewed your request. Please check the dashboard for details."}</p>
          </div>
          ${btn("View Conversation", DASHBOARD)}
          <p style="color:${brand.muted};font-size:14px;text-align:center;">You can reply directly to this email if you need further help.</p>
        `),
      };

    default:
      return { subject: "OptimalStock Pro Notification", html: wrapper(`<p style="color:${brand.muted};">You have a new notification from OptimalStock Pro.</p>`) };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse body early to check email type for auth bypass
    const payload: EmailPayload = await req.json();

    // Allow "welcome" emails without auth (user has no session at signup)
    const unauthenticatedTypes: EmailType[] = ["welcome"];
    const skipAuth = unauthenticatedTypes.includes(payload.emailType);

    if (!skipAuth) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // payload already parsed above

    if (!payload.emailType || !payload.to) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'emailType' and 'to'" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const validTypes: EmailType[] = [
      "welcome", "day2_onboarding", "day5_features", "trial_ending",
      "trial_expired", "payment_success", "payment_failed",
      "low_stock_alert", "monthly_summary", "support_response",
    ];

    if (!validTypes.includes(payload.emailType)) {
      return new Response(
        JSON.stringify({ error: "Invalid email type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { subject, html } = buildEmail(payload);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [payload.to], subject, html }),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.text();
      console.error("Resend error:", err);
      return new Response(
        JSON.stringify({ error: "Failed to send email. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = await resendResponse.json();
    console.log(`Email [${payload.emailType}] sent to ${payload.to}:`, result.id);

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Lifecycle email error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
