import { Capacitor } from "@capacitor/core";
import { AdMob, BannerAdSize, BannerAdPosition } from "@capacitor-community/admob";
import { storageRepository } from "../repositories/storageRepository";
import { STORAGE_KEYS, MOCK_AD_INTERVALS } from "../config/constants";
import { logger } from "./loggerService";

export const ADMOB_CONFIG = {
  appId: "ca-app-pub-9313588778374971~3943436783",
  interstitialId: "ca-app-pub-9313588778374971/1978733948",
  bannerId: "ca-app-pub-9313588778374971/1978733948",
};

let isAdMobInitialized = false;
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

  async initAdMob() {
    if (!Capacitor.isNativePlatform() || isAdMobInitialized) return;
    try {
      await AdMob.initialize({});
      isAdMobInitialized = true;
      logger.info("AdMob initialized successfully with non-personalized ads mode");
    } catch (err) {
      logger.error("Failed to initialize AdMob:", err);
    }
  },

  async showNativeBanner() {
    if (!Capacitor.isNativePlatform() || this.isOffline() || this.isPremiumUnlocked()) return;
    try {
      await this.initAdMob();
      await AdMob.showBanner({
        adId: ADMOB_CONFIG.bannerId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        npa: true,
      });
    } catch (err) {
      logger.error("Error showing AdMob banner:", err);
    }
  },

  async hideNativeBanner() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.hideBanner();
    } catch (err) {
      logger.error("Error hiding AdMob banner:", err);
    }
  },

  async showNativeInterstitial() {
    if (!Capacitor.isNativePlatform() || this.isOffline() || this.isPremiumUnlocked()) return;
    try {
      await this.initAdMob();
      await AdMob.prepareInterstitial({
        adId: ADMOB_CONFIG.interstitialId,
        npa: true,
      });
      await AdMob.showInterstitial();
    } catch (err) {
      logger.error("Error showing AdMob interstitial:", err);
    }
  },

  isOffline(): boolean {
    if (typeof window === "undefined") return false;
    return !navigator.onLine;
  },

  hasConsent(): boolean {
    return true;
  },

  getConsentType(): "personalized" | "non-personalized" | "declined" {
    return "non-personalized";
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
    this.hideNativeBanner();
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

      if (Capacitor.isNativePlatform()) {
        this.showNativeInterstitial();
      }
      return true;
    }
    return false;
  },
};
