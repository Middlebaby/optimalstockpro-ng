import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertPayload {
  to: string;
  alertType: "low_stock" | "expiry_warning" | "weekly_summary";
  items: Array<{
    name: string;
    quantity?: number;
    reorderLevel?: number;
    expiryDate?: string;
    daysUntilExpiry?: number;
  }>;
  summary?: {
    totalItems: number;
    totalValue: number;
    stockMovements: number;
  };
}

// Sanitize text for WhatsApp messages
function sanitizeText(str: string | undefined | null): string {
  if (!str) return "";
  return str.replace(/[<>]/g, "").substring(0, 500);
}

function buildMessage(payload: AlertPayload): string {
  const { alertType, items, summary } = payload;

  if (alertType === "low_stock") {
    let msg = `🚨 *LOW STOCK ALERT* - OptimalStock Pro\n\nThe following items need restocking:\n\n`;
    items.slice(0, 20).forEach((item, i) => {
      msg += `${i + 1}. *${sanitizeText(item.name)}*\n   📦 Current: ${item.quantity} | Reorder at: ${item.reorderLevel}\n\n`;
    });
    msg += `⚡ Log in to reorder now: https://optimalstockpro-ng.lovable.app/dashboard`;
    return msg;
  }

  if (alertType === "expiry_warning") {
    let msg = `⏰ *EXPIRY ALERT* - OptimalStock Pro\n\nThese items are expiring soon:\n\n`;
    items.slice(0, 20).forEach((item, i) => {
      const urgency = (item.daysUntilExpiry ?? 0) <= 3 ? "🔴" : (item.daysUntilExpiry ?? 0) <= 7 ? "🟡" : "🟢";
      msg += `${i + 1}. ${urgency} *${sanitizeText(item.name)}*\n   📅 Expires: ${item.expiryDate} (${item.daysUntilExpiry} days)\n\n`;
    });
    msg += `📋 Review in app: https://optimalstockpro-ng.lovable.app/dashboard`;
    return msg;
  }

  if (alertType === "weekly_summary") {
    let msg = `📊 *WEEKLY SUMMARY* - OptimalStock Pro\n\n`;
    msg += `📦 Total Items: ${summary?.totalItems ?? 0}\n`;
    msg += `💰 Total Value: ₦${(summary?.totalValue ?? 0).toLocaleString()}\n`;
    msg += `🔄 Stock Movements: ${summary?.stockMovements ?? 0}\n\n`;
    
    if (items.length > 0) {
      msg += `⚠️ *Items Needing Attention:*\n`;
      items.slice(0, 20).forEach((item, i) => {
        msg += `${i + 1}. ${sanitizeText(item.name)} - Qty: ${item.quantity}\n`;
      });
    }
    
    msg += `\n📈 View full report: https://optimalstockpro-ng.lovable.app/dashboard`;
    return msg;
  }

  return "OptimalStock Pro Alert";
}

async function sendWhatsApp(to: string, body: string): Promise<Response> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append("To", `whatsapp:${to}`);
  formData.append("From", TWILIO_WHATSAPP_FROM!);
  formData.append("Body", body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  return response;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
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

    const token = authHeader.replace("Bearer ", "");
    const { data, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !data?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.error("Twilio credentials not configured");
      return new Response(
        JSON.stringify({ error: "WhatsApp service is not configured. Please contact support." }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload: AlertPayload = await req.json();
    
    if (!payload.to || !payload.alertType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'to' and 'alertType'" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(payload.to)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const message = buildMessage(payload);
    const twilioResponse = await sendWhatsApp(payload.to, message);
    
    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error("Twilio error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send WhatsApp message. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = await twilioResponse.json();
    console.log("WhatsApp sent successfully:", result.sid);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("WhatsApp alert error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send alert. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
