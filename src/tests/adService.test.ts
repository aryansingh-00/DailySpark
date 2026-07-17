import { describe, it, expect, beforeEach, vi } from "vitest";
import { adService } from "../services/adService";

// Prefix with mock to bypass hoisting reference limits
const mockStoreData: Record<string, any> = {};

vi.mock("../repositories/storageRepository", () => {
  return {
    storageRepository: {
      getItem: vi.fn((key: string, defVal: any) => mockStoreData[key] ?? defVal),
      setItem: vi.fn((key: string, value: any) => {
        mockStoreData[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStoreData[key];
      }),
      hasItem: vi.fn((key: string) => mockStoreData[key] !== undefined),
    },
  };
});

describe("adService", () => {
  beforeEach(() => {
    // Clear mock store data
    for (const key in mockStoreData) {
      delete mockStoreData[key];
    }
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { onLine: true });
  });

  it("should detect consent choice status", () => {
    expect(adService.hasConsent()).toBe(false);
    adService.setConsent("all");
    expect(adService.hasConsent()).toBe(true);
    expect(adService.getConsentType()).toBe("personalized");
  });

  it("should unlock and lock premium correctly", () => {
    expect(adService.isPremiumUnlocked()).toBe(false);
    adService.unlockPremium();
    expect(adService.isPremiumUnlocked()).toBe(true);
    adService.lockPremium();
    expect(adService.isPremiumUnlocked()).toBe(false);
  });

  it("should register quote clicks and trigger interstitial on reaching limit", () => {
    for (let i = 0; i < 7; i++) {
      const showAd = adService.registerInteraction();
      expect(showAd).toBe(false);
    }
    const triggerAd = adService.registerInteraction();
    expect(triggerAd).toBe(true);
  });
});
