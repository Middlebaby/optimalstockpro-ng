import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";

const SESSION_KEY = "lead_session_id";

export function getLeadSessionId(): string | null {
  if (typeof window === "undefined") return null;
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useLeadTracking() {
  useEffect(() => {
    const sessionId = getLeadSessionId();
    if (!sessionId) return;

    trackLeadEvent("page_view", {
      path: window.location.pathname,
      title: document.title,
    }).catch(() => {
      // Fail silently so tracking never blocks the UI.
    });
  }, []);

  return { trackLeadEvent };
}

export async function trackLeadEvent(
  eventType: string,
  eventData?: Record<string, unknown>
): Promise<void> {
  const sessionId = getLeadSessionId();
  if (!sessionId) return;

  const attribution = getAttribution();

  try {
    await supabase.functions.invoke("leads-track", {
      body: {
        session_id: sessionId,
        event_type: eventType,
        event_data: { ...(eventData ?? {}), attribution },
        url: window.location.href,
        referrer: document.referrer,
      },
    });
  } catch (error) {
    console.error("Lead tracking failed:", error);
  }
}
