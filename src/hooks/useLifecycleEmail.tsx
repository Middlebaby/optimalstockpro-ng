import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export function useLifecycleEmail() {
  const sendEmail = useCallback(
    async (emailType: EmailType, to: string, data?: Record<string, any>) => {
      const { data: result, error } = await supabase.functions.invoke(
        "send-lifecycle-email",
        { body: { emailType, to, data } }
      );
      if (error) throw error;
      return result;
    },
    []
  );

  return { sendEmail };
}
