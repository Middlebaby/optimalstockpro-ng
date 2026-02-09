import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AlertItem {
  name: string;
  quantity?: number;
  reorderLevel?: number;
  expiryDate?: string;
  daysUntilExpiry?: number;
}

interface WeeklySummary {
  totalItems: number;
  totalValue: number;
  stockMovements: number;
}

export function useWhatsAppAlert() {
  const sendLowStockAlert = useCallback(
    async (to: string, items: AlertItem[]) => {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-alert", {
        body: { to, alertType: "low_stock", items },
      });

      if (error) throw error;
      return data;
    },
    []
  );

  const sendExpiryAlert = useCallback(
    async (to: string, items: AlertItem[]) => {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-alert", {
        body: { to, alertType: "expiry_warning", items },
      });

      if (error) throw error;
      return data;
    },
    []
  );

  const sendWeeklySummary = useCallback(
    async (to: string, summary: WeeklySummary, attentionItems: AlertItem[]) => {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-alert", {
        body: {
          to,
          alertType: "weekly_summary",
          items: attentionItems,
          summary,
        },
      });

      if (error) throw error;
      return data;
    },
    []
  );

  return { sendLowStockAlert, sendExpiryAlert, sendWeeklySummary };
}
