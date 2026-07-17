import { describe, it, expect, beforeEach, vi } from "vitest";
import { notificationService } from "../services/notificationService";
import { NotificationPermissionDeniedException } from "../models/exceptions";

// Prefix with mock to bypass hoisting reference limits
const mockNotificationStore: Record<string, any> = {};

vi.mock("../repositories/storageRepository", () => {
  return {
    storageRepository: {
      getItem: vi.fn((key: string, defVal: any) => mockNotificationStore[key] ?? defVal),
      setItem: vi.fn((key: string, value: any) => {
        mockNotificationStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockNotificationStore[key];
      }),
      hasItem: vi.fn((key: string) => mockNotificationStore[key] !== undefined),
    },
  };
});

describe("notificationService", () => {
  const mockNotification = {
    permission: "default" as NotificationPermission,
    requestPermission: vi.fn().mockResolvedValue("granted"),
  };

  beforeEach(() => {
    // Clear mock store
    for (const key in mockNotificationStore) {
      delete mockNotificationStore[key];
    }
    
    mockNotification.permission = "default";
    mockNotification.requestPermission = vi.fn().mockResolvedValue("granted");

    // Stub window with Notification directly
    vi.stubGlobal("window", {
      Notification: mockNotification,
    });
    vi.stubGlobal("Notification", mockNotification);
  });

  it("should get and set preference values", () => {
    notificationService.setPreference("morning", false);
    const pref = notificationService.getPreference("morning");
    expect(pref).toBe(false);
  });

  it("should request notification permission", async () => {
    const status = await notificationService.requestPermission();
    expect(status).toBe("granted");
  });

  it("should throw NotificationPermissionDeniedException when trying to test notifications without permission", () => {
    mockNotification.permission = "denied";

    expect(() => {
      notificationService.sendTestNotification();
    }).toThrow(NotificationPermissionDeniedException);
  });
});
