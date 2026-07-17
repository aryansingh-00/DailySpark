import { storageRepository } from "../repositories/storageRepository";
import { STORAGE_KEYS, MOCK_AD_INTERVALS } from "../config/constants";
import { logger } from "./loggerService";

let quoteClicksCount = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  try {
    quoteClicksCount = storageRepository.getItem<number>(STORAGE_KEYS.AD_COUNTER, 0);
  } catch (e) {
    logger.error("Failed to load ad service counter:", e);
  }
}

export const adService = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  isOffline(): boolean {
    if (typeof window === "undefined") return false;
    return !navigator.onLine;
  },

  hasConsent(): boolean {
    if (typeof window === "undefined") return false;
    return storageRepository.hasItem(STORAGE_KEYS.AD_CONSENT);
  },

  getConsentType(): "personalized" | "non-personalized" | "declined" {
    if (typeof window === "undefined") return "non-personalized";
    const consent = storageRepository.getItem<string | null>(STORAGE_KEYS.AD_CONSENT, null);
    if (consent === "all") return "personalized";
    if (consent === "non-personalized") return "non-personalized";
    return "declined";
  },

  setConsent(type: "all" | "non-personalized" | "declined") {
    if (typeof window === "undefined") return;
    storageRepository.setItem(STORAGE_KEYS.AD_CONSENT, type);
    notify();
  },

  isPremiumUnlocked(): boolean {
    if (typeof window === "undefined") return false;
    return storageRepository.getItem<string | null>(STORAGE_KEYS.PREMIUM_UNLOCKED, null) === "1";
  },

  unlockPremium() {
    if (typeof window === "undefined") return;
    storageRepository.setItem(STORAGE_KEYS.PREMIUM_UNLOCKED, "1");
    notify();
  },

  lockPremium() {
    if (typeof window === "undefined") return;
    storageRepository.removeItem(STORAGE_KEYS.PREMIUM_UNLOCKED);
    notify();
  },

  registerInteraction(): boolean {
    if (this.isOffline() || this.isPremiumUnlocked()) return false;

    quoteClicksCount += 1;
    try {
      storageRepository.setItem(STORAGE_KEYS.AD_COUNTER, quoteClicksCount);
    } catch (e) {
      logger.error("Failed to save ad counter:", e);
    }

    if (quoteClicksCount >= MOCK_AD_INTERVALS.INTERSTITIAL_TRIGGER_COUNT) {
      quoteClicksCount = 0;
      storageRepository.setItem(STORAGE_KEYS.AD_COUNTER, 0);
      return true;
    }
    return false;
  },
};
