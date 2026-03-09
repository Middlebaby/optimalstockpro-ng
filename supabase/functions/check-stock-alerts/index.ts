import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function sanitizeText(str: string | undefined | null): string {
  if (!str) return "";
  return str.replace(/[<>]/g, "").substring(0, 500);
}

async function sendWhatsApp(to: string, body: string): Promise<boolean> {
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

  if (!response.ok) {
    const error = await response.text();
    console.error("Twilio error:", error);
    return false;
  }

  const result = await response.json();
  console.log("WhatsApp sent:", result.sid);
  return true;
}

function buildLowStockMessage(items: Array<{ name: string; quantity: number; reorder_level: number }>): string {
  let msg = `🚨 *DAILY LOW STOCK ALERT* - OptimalStock Pro\n\n${items.length} item(s) are below reorder level:\n\n`;
  items.slice(0, 20).forEach((item, i) => {
    msg += `${i + 1}. *${sanitizeText(item.name)}*\n   📦 Current: ${item.quantity} | Reorder at: ${item.reorder_level}\n\n`;
  });
  if (items.length > 20) {
    msg += `...and ${items.length - 20} more items\n\n`;
  }
  msg += `⚡ Restock now: https://optimalstockpro-ng.lovable.app/dashboard`;
  return msg;
}

function buildExpiryMessage(items: Array<{ name: string; expiry_date: string; days_until: number }>): string {
  let msg = `⏰ *DAILY EXPIRY ALERT* - OptimalStock Pro\n\nThese items are expiring within 30 days:\n\n`;
  items.slice(0, 20).forEach((item, i) => {
    const urgency = item.days_until <= 0 ? "🔴 EXPIRED" : item.days_until <= 3 ? "🔴" : item.days_until <= 7 ? "🟡" : "🟢";
    msg += `${i + 1}. ${urgency} *${sanitizeText(item.name)}*\n   📅 ${item.days_until <= 0 ? "Expired" : `Expires: ${item.expiry_date} (${item.days_until} days)`}\n\n`;
  });
  if (items.length > 20) {
    msg += `...and ${items.length - 20} more items\n\n`;
  }
  msg += `📋 Review now: https://optimalstockpro-ng.lovable.app/dashboard`;
  return msg;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.error("Twilio credentials not configured");
      return new Response(
        JSON.stringify({ error: "WhatsApp not configured" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role to read all users' data
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all users with WhatsApp notifications enabled
    const { data: settings, error: settingsErr } = await supabase
      .from("notification_settings")
      .select("user_id, whatsapp_number, low_stock_alerts")
      .eq("whatsapp_notifications", true)
      .not("whatsapp_number", "is", null);

    if (settingsErr) {
      console.error("Error fetching notification settings:", settingsErr);
      return new Response(
        JSON.stringify({ error: "Failed to fetch settings" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!settings || settings.length === 0) {
      console.log("No users with WhatsApp notifications enabled");
      return new Response(
        JSON.stringify({ message: "No users to notify", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let totalSent = 0;
    const today = new Date().toISOString().split("T")[0];

    for (const setting of settings) {
      const { user_id, whatsapp_number, low_stock_alerts } = setting;

      // Check low stock items for this user
      if (low_stock_alerts !== false) {
        const { data: lowStockItems } = await supabase
          .from("inventory_items")
          .select("name, quantity, reorder_level")
          .eq("user_id", user_id)
          .not("reorder_level", "is", null)
          .filter("quantity", "lte", "reorder_level");

        // Filter client-side since we can't do column comparison in PostgREST easily
        const actualLowStock = (lowStockItems || []).filter(
          (item) => item.reorder_level !== null && item.quantity <= item.reorder_level
        );

        if (actualLowStock.length > 0) {
          const msg = buildLowStockMessage(actualLowStock);
          const sent = await sendWhatsApp(whatsapp_number, msg);
          if (sent) totalSent++;
        }
      }

      // Check expiring items (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const cutoffDate = thirtyDaysFromNow.toISOString().split("T")[0];

      const { data: expiringItems } = await supabase
        .from("inventory_items")
        .select("name, expiry_date, quantity")
        .eq("user_id", user_id)
        .not("expiry_date", "is", null)
        .lte("expiry_date", cutoffDate)
        .gt("quantity", 0);

      if (expiringItems && expiringItems.length > 0) {
        const withDays = expiringItems.map((item) => {
          const expDate = new Date(item.expiry_date!);
          const now = new Date(today);
          const diffMs = expDate.getTime() - now.getTime();
          const days_until = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          return {
            name: item.name,
            expiry_date: item.expiry_date!,
            days_until,
          };
        }).sort((a, b) => a.days_until - b.days_until);

        const msg = buildExpiryMessage(withDays);
        const sent = await sendWhatsApp(whatsapp_number, msg);
        if (sent) totalSent++;
      }
    }

    console.log(`Daily stock alert complete. Sent ${totalSent} messages to ${settings.length} users.`);

    return new Response(
      JSON.stringify({ success: true, sent: totalSent, users: settings.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Check stock alerts error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
