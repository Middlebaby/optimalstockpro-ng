import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM");
const ADMIN_EMAIL = "info@optimalstockpro.com";
const ADMIN_WHATSAPP = "whatsapp:+2348148170730"; // Your WhatsApp number

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

async function sendWhatsApp(body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    console.warn("Twilio not configured, skipping WhatsApp");
    return null;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const params = new URLSearchParams({
    From: TWILIO_WHATSAPP_FROM,
    To: ADMIN_WHATSAPP,
    Body: body,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("WhatsApp send failed:", err);
    return null;
  }
  return response.json();
}

async function sendEmail(subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn("Resend not configured, skipping email");
    return null;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "OptimalStock Pro <info@optimalstockpro.com>",
      to: [ADMIN_EMAIL],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Email send failed:", err);
    return null;
  }
  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { type, record } = payload;

    if (type === "new_signup") {
      // Called when a new profile is created (triggered by signup)
      const name = escapeHtml(record?.full_name) || "Unknown";
      const userId = record?.user_id || "N/A";
      const createdAt = record?.created_at
        ? new Date(record.created_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })
        : new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" });

      // Fetch email from auth via service role
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);

      let email = "N/A";
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        email = userData?.user?.email || "N/A";
      } catch (e) {
        console.error("Failed to fetch user email:", e);
      }

      // WhatsApp notification
      const whatsappMsg = `🆕 *New Signup!*\n\n👤 Name: ${record?.full_name || "Not provided"}\n📧 Email: ${email}\n🕐 Time: ${createdAt}\n\nTotal signups growing! 🚀`;
      
      // Email notification
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h1 style="color:#16a34a;font-size:22px;">🆕 New User Signup!</h1>
          <div style="background:#f0fdf4;border-radius:12px;padding:24px;margin:16px 0;">
            <p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(record?.full_name) || "Not provided"}</p>
            <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p style="margin:0;"><strong>Time:</strong> ${createdAt}</p>
          </div>
          <p style="color:#666;font-size:14px;">Log in to view more details in your admin dashboard.</p>
        </div>`;

      const [whatsappResult, emailResult] = await Promise.all([
        sendWhatsApp(whatsappMsg),
        sendEmail(`🆕 New Signup: ${record?.full_name || email}`, emailHtml),
      ]);

      console.log("Signup notification sent:", { whatsapp: !!whatsappResult, email: !!emailResult });

      return new Response(JSON.stringify({ success: true, type: "signup" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "new_survey") {
      const r = record || {};
      const name = escapeHtml(r.full_name) || "Anonymous";
      const email = escapeHtml(r.email) || "Not provided";
      const phone = escapeHtml(r.phone) || "Not provided";
      const business = escapeHtml(r.business_type) || "N/A";
      const location = escapeHtml(r.location) || "N/A";
      const employees = escapeHtml(r.employee_count) || "N/A";
      const budget = escapeHtml(r.budget_range) || "N/A";
      const interest = escapeHtml(r.launch_interest) || "N/A";
      const challenges = Array.isArray(r.challenges) ? r.challenges.join(", ") : "None";
      const features = Array.isArray(r.interested_features) ? r.interested_features.join(", ") : "None";
      const createdAt = r.created_at
        ? new Date(r.created_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })
        : new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" });

      // WhatsApp - concise summary
      const whatsappMsg = `📋 *New Survey Response!*\n\n👤 ${r.full_name || "Anonymous"}\n📧 ${r.email || "N/A"}\n📞 ${r.phone || "N/A"}\n🏢 ${r.business_type || "N/A"} (${r.employee_count || "N/A"} staff)\n📍 ${r.location || "N/A"}\n💰 Budget: ${r.budget_range || "N/A"}\n🚀 Interest: ${r.launch_interest || "N/A"}\n🕐 ${createdAt}`;

      // Email - detailed
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h1 style="color:#16a34a;font-size:22px;">📋 New Survey Response!</h1>
          
          <div style="background:#f0fdf4;border-radius:12px;padding:24px;margin:16px 0;">
            <h3 style="margin:0 0 12px;color:#15803d;">Contact Info</h3>
            <p style="margin:0 0 6px;"><strong>Name:</strong> ${name}</p>
            <p style="margin:0 0 6px;"><strong>Email:</strong> <a href="mailto:${r.email}">${email}</a></p>
            <p style="margin:0;"><strong>Phone:</strong> ${phone}</p>
          </div>
          
          <div style="background:#f9fafb;border-radius:12px;padding:24px;margin:16px 0;">
            <h3 style="margin:0 0 12px;color:#333;">Business Details</h3>
            <p style="margin:0 0 6px;"><strong>Type:</strong> ${business}</p>
            <p style="margin:0 0 6px;"><strong>Employees:</strong> ${employees}</p>
            <p style="margin:0 0 6px;"><strong>Location:</strong> ${location}</p>
            <p style="margin:0;"><strong>Current Method:</strong> ${escapeHtml(r.current_method) || "N/A"}</p>
          </div>
          
          <div style="background:#f9fafb;border-radius:12px;padding:24px;margin:16px 0;">
            <h3 style="margin:0 0 12px;color:#333;">Survey Insights</h3>
            <p style="margin:0 0 6px;"><strong>Challenges:</strong> ${escapeHtml(challenges)}</p>
            <p style="margin:0 0 6px;"><strong>Biggest Pain:</strong> ${escapeHtml(r.biggest_pain) || "N/A"}</p>
            <p style="margin:0 0 6px;"><strong>Features Wanted:</strong> ${escapeHtml(features)}</p>
            <p style="margin:0 0 6px;"><strong>Budget:</strong> ${budget}</p>
            <p style="margin:0;"><strong>Launch Interest:</strong> ${interest}</p>
          </div>
          
          ${r.additional_comments ? `<div style="background:#fffbeb;border-radius:12px;padding:24px;margin:16px 0;">
            <h3 style="margin:0 0 8px;color:#333;">Additional Comments</h3>
            <p style="margin:0;color:#666;">${escapeHtml(r.additional_comments)}</p>
          </div>` : ""}
          
          <p style="color:#666;font-size:13px;">Submitted at ${createdAt}</p>
        </div>`;

      const [whatsappResult, emailResult] = await Promise.all([
        sendWhatsApp(whatsappMsg),
        sendEmail(`📋 New Survey: ${r.full_name || r.email || "Anonymous"}`, emailHtml),
      ]);

      console.log("Survey notification sent:", { whatsapp: !!whatsappResult, email: !!emailResult });

      return new Response(JSON.stringify({ success: true, type: "survey", email: r.email }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown notification type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in notify-admin:", error);
    return new Response(
      JSON.stringify({ error: "Notification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
