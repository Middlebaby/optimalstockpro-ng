import { useState, useEffect, useCallback } from "react";

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = "Notification" in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch {
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(
    ({ title, body, icon = "/icon-192.png", tag, data }: NotificationOptions) => {
      if (!isSupported || permission !== "granted") return null;

      try {
        const notification = new Notification(title, {
          body,
          icon,
          tag,
          badge: "/icon-192.png",
          data,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return notification;
      } catch {
        // Fallback for mobile where Notification constructor may not work
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SHOW_NOTIFICATION",
            title,
            options: { body, icon, tag, data },
          });
        }
        return null;
      }
    },
    [isSupported, permission]
  );

  const notifyLowStock = useCallback(
    (itemName: string, quantity: number, reorderLevel: number) => {
      sendNotification({
        title: "🚨 Low Stock Alert",
        body: `${itemName} is running low! Current: ${quantity}, Reorder level: ${reorderLevel}`,
        tag: `low-stock-${itemName}`,
      });
    },
    [sendNotification]
  );

  const notifyExpiry = useCallback(
    (itemName: string, daysUntilExpiry: number) => {
      const urgency = daysUntilExpiry <= 0 ? "🔴 EXPIRED" : daysUntilExpiry <= 3 ? "🟡 Expiring Soon" : "⏰ Expiry Warning";
      sendNotification({
        title: `${urgency}`,
        body: daysUntilExpiry <= 0
          ? `${itemName} has expired! Take immediate action.`
          : `${itemName} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}`,
        tag: `expiry-${itemName}`,
      });
    },
    [sendNotification]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    notifyLowStock,
    notifyExpiry,
  };
}
