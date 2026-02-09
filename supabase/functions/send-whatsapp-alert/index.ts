import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertPayload {
  to: string; // WhatsApp number with country code e.g. +2348012345678
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

function buildMessage(payload: AlertPayload): string {
  const { alertType, items, summary } = payload;

  if (alertType === "low_stock") {
    let msg = `🚨 *LOW STOCK ALERT* - OptimalStock Pro\n\nThe following items need restocking:\n\n`;
    items.forEach((item, i) => {
      msg += `${i + 1}. *${item.name}*\n   📦 Current: ${item.quantity} | Reorder at: ${item.reorderLevel}\n\n`;
    });
    msg += `⚡ Log in to reorder now: https://optimalstockpro-ng.lovable.app/dashboard`;
    return msg;
  }

  if (alertType === "expiry_warning") {
    let msg = `⏰ *EXPIRY ALERT* - OptimalStock Pro\n\nThese items are expiring soon:\n\n`;
    items.forEach((item, i) => {
      const urgency = (item.daysUntilExpiry ?? 0) <= 3 ? "🔴" : (item.daysUntilExpiry ?? 0) <= 7 ? "🟡" : "🟢";
      msg += `${i + 1}. ${urgency} *${item.name}*\n   📅 Expires: ${item.expiryDate} (${item.daysUntilExpiry} days)\n\n`;
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
      items.forEach((item, i) => {
        msg += `${i + 1}. ${item.name} - Qty: ${item.quantity}\n`;
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
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN secrets.");
    }

    const payload: AlertPayload = await req.json();
    
    if (!payload.to || !payload.alertType) {
      throw new Error("Missing required fields: 'to' and 'alertType'");
    }

    const message = buildMessage(payload);
    const twilioResponse = await sendWhatsApp(payload.to, message);
    
    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error("Twilio error:", error);
      throw new Error(`Failed to send WhatsApp message: ${error}`);
    }

    const result = await twilioResponse.json();
    console.log("WhatsApp sent successfully:", result.sid);

    return new Response(
      JSON.stringify({ success: true, messageSid: result.sid }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("WhatsApp alert error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
