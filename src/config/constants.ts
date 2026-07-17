import { Flame, Leaf, Briefcase, BookOpen, Dumbbell, Heart, Smile } from "lucide-react";

export const STORAGE_KEYS = {
  FAVORITES: "ds-favorites",
  USER_STATS: "ds-user-stats",
  DARK_MODE: "ds-dark",
  APP_RATED: "ds-app-rated",
  RECENT_SEARCHES: "ds-recent-searches",
  RECENTLY_OPENED: "ds-recently-opened",
  NOTIFICATIONS_PREFIX: "ds-notif-",
  AD_CONSENT: "ds-ad-consent",
  AD_COUNTER: "ds-ad-counter",
  PREMIUM_UNLOCKED: "ds-premium-unlocked",
  THEME_ACCENT: "ds-theme-accent",
};

export const NOTIFICATION_PREF_KEYS = {
  ENABLED: "enabled",
  MORNING: "morning",
  EVENING: "evening",
  CUSTOM_TIME: "customTime",
};

export const DEFAULT_STATS = {
  streak: 0,
  longestStreak: 0,
  lastActiveDate: "",
  quotesRead: 0,
  quotesShared: 0,
  quotesCopied: 0,
  daysUsingApp: 1,
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  exploredCategories: [] as string[],
  unlockedAchievements: [] as string[],
};

export const MOCK_AD_INTERVALS = {
  INTERSTITIAL_TRIGGER_COUNT: 8,
};
