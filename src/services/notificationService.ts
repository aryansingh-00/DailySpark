import { quoteService } from "./quoteService";
import { storageRepository } from "../repositories/storageRepository";
import { STORAGE_KEYS } from "../config/constants";
import { NotificationPermissionDeniedException } from "../models/exceptions";
import { logger } from "./loggerService";

export const notificationService = {
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  },

  getPermissionState(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return "denied";
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      logger.error("Failed to request notification permission:", e);
      return "default";
    }
  },

  getPreference(key: "enabled" | "morning" | "evening" | "customTime"): string | boolean {
    if (typeof window === "undefined") return key === "enabled" ? false : "";

    const storeKey = STORAGE_KEYS.NOTIFICATIONS_PREFIX + key;
    const saved = storageRepository.getItem<string | null>(storeKey, null);

    if (key === "enabled") return saved !== "0"; // default to enabled (true)
    if (key === "morning") return saved !== "0"; // default to morning (true)
    if (key === "evening") return saved !== "0"; // default to evening (true)
    if (key === "customTime") return saved || "08:00";

    return "";
  },

  setPreference(key: "enabled" | "morning" | "evening" | "customTime", value: string | boolean) {
    if (typeof window === "undefined") return;
    const storeKey = STORAGE_KEYS.NOTIFICATIONS_PREFIX + key;
    const strVal = typeof value === "boolean" ? (value ? "1" : "0") : value;
    storageRepository.setItem(storeKey, strVal);
  },

  sendNotification(title: string, body: string): boolean {
    if (!this.isSupported()) return false;
    if (Notification.permission !== "granted") return false;

    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
      return true;
    } catch (e) {
      logger.warn("Standard notification failed, trying service worker fallback:", e);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: "/favicon.ico",
          });
        });
        return true;
      }
      return false;
    }
  },

  sendTestNotification(): boolean {
    const quote = quoteService.getRandomQuote();
    const title = `Daily Spark Motivation ✨`;
    const body = `“${quote.quote}” — ${quote.author}`;

    const sent = this.sendNotification(title, body);
    if (!sent) {
      throw new NotificationPermissionDeniedException();
    }
    return true;
  },

  // Real-time checks for scheduled times and automatic triggers
  checkAndTriggerNotifications() {
    if (!this.isSupported()) return;
    if (Notification.permission !== "granted") return;

    const enabled = this.getPreference("enabled");
    if (!enabled) return;

    const todayStr = new Date().toDateString();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    let sentLog: Record<string, Record<string, boolean>> = {};
    try {
      const saved = localStorage.getItem("ds-notifications-sent-log");
      if (saved) sentLog = JSON.parse(saved);
    } catch (e) {}

    // Clean old logs to keep localStorage clean
    const logDates = Object.keys(sentLog);
    if (logDates.length > 7) {
      const sorted = logDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const kept = sorted.slice(0, 3);
      const cleanedLog: Record<string, Record<string, boolean>> = {};
      kept.forEach((d) => {
        cleanedLog[d] = sentLog[d];
      });
      sentLog = cleanedLog;
    }

    if (!sentLog[todayStr]) {
      sentLog[todayStr] = {
        morning: false,
        evening: false,
        custom: false,
      };
    }

    const todayLog = sentLog[todayStr];

    const saveLog = () => {
      localStorage.setItem("ds-notifications-sent-log", JSON.stringify(sentLog));
    };

    // 1. Morning Motivation (8:00 AM)
    const morningEnabled = this.getPreference("morning");
    if (morningEnabled && !todayLog.morning) {
      if (currentHour > 8 || (currentHour === 8 && currentMin >= 0)) {
        const quote = quoteService.getRandomQuote();
        const sent = this.sendNotification(
          "Morning Spark ✨",
          `“${quote.quote}” — ${quote.author}`,
        );
        if (sent) {
          todayLog.morning = true;
          saveLog();
          logger.info("Morning notification triggered.");
        }
      }
    }

    // 2. Evening Motivation (8:00 PM / 20:00)
    const eveningEnabled = this.getPreference("evening");
    if (eveningEnabled && !todayLog.evening) {
      if (currentHour > 20 || (currentHour === 20 && currentMin >= 0)) {
        const quote = quoteService.getRandomQuote();
        const sent = this.sendNotification(
          "Evening Reflection 🌙",
          `“${quote.quote}” — ${quote.author}`,
        );
        if (sent) {
          todayLog.evening = true;
          saveLog();
          logger.info("Evening notification triggered.");
        }
      }
    }

    // 3. Custom Time
    const customTimeStr = this.getPreference("customTime") as string;
    if (customTimeStr && !todayLog.custom) {
      const [targetHour, targetMin] = customTimeStr.split(":").map(Number);
      if (!isNaN(targetHour) && !isNaN(targetMin)) {
        if (currentHour > targetHour || (currentHour === targetHour && currentMin >= targetMin)) {
          const quote = quoteService.getRandomQuote();
          const sent = this.sendNotification(
            "Your Scheduled Spark 💫",
            `“${quote.quote}” — ${quote.author}`,
          );
          if (sent) {
            todayLog.custom = true;
            saveLog();
            logger.info("Custom notification triggered.");
          }
        }
      }
    }
  },

  startScheduler() {
    if (typeof window === "undefined") return;

    // Check immediately on launch
    this.checkAndTriggerNotifications();

    // Check periodically every 30 seconds
    const intervalId = setInterval(() => {
      this.checkAndTriggerNotifications();
    }, 30000);

    return () => clearInterval(intervalId);
  },
};
