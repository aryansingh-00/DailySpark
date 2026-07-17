import { useState, useEffect } from "react";
import type { Quote } from "../models/quote";
import { storageRepository } from "../repositories/storageRepository";
import { STORAGE_KEYS, DEFAULT_STATS } from "../config/constants";
import { logger } from "../services/loggerService";
import { toast } from "sonner";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredValue: number;
  metric: "favorites" | "read" | "streak" | "share" | "copy";
  badgeColor: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-favorite",
    name: "First Spark",
    description: "Save your first quote to favorites.",
    icon: "Heart",
    requiredValue: 1,
    metric: "favorites",
    badgeColor: "from-pink-500 to-rose-500",
  },
  {
    id: "ten-favorites",
    name: "Avid Collector",
    description: "Save 10 quotes to favorites.",
    icon: "Bookmark",
    requiredValue: 10,
    metric: "favorites",
    badgeColor: "from-violet-500 to-indigo-600",
  },
  {
    id: "read-5",
    name: "Curious Mind",
    description: "Read 5 quotes.",
    icon: "BookOpen",
    requiredValue: 5,
    metric: "read",
    badgeColor: "from-cyan-500 to-blue-500",
  },
  {
    id: "read-50",
    name: "Sage Scholar",
    description: "Read 50 quotes.",
    icon: "Trophy",
    requiredValue: 50,
    metric: "read",
    badgeColor: "from-amber-500 to-orange-600",
  },
  {
    id: "streak-3",
    name: "Consistent Spark",
    description: "Achieve a 3-day streak.",
    icon: "Flame",
    requiredValue: 3,
    metric: "streak",
    badgeColor: "from-orange-500 to-red-600",
  },
  {
    id: "streak-7",
    name: "Unstoppable",
    description: "Achieve a 7-day streak.",
    icon: "Zap",
    requiredValue: 7,
    metric: "streak",
    badgeColor: "from-yellow-400 to-amber-500",
  },
  {
    id: "share-5",
    name: "Joy Spreader",
    description: "Share 5 quotes.",
    icon: "Share2",
    requiredValue: 5,
    metric: "share",
    badgeColor: "from-emerald-500 to-teal-600",
  },
  {
    id: "copy-10",
    name: "Word Keeper",
    description: "Copy 10 quotes to clipboard.",
    icon: "Copy",
    requiredValue: 10,
    metric: "copy",
    badgeColor: "from-fuchsia-500 to-purple-600",
  },
];

export interface UserStats {
  streak: number;
  longestStreak: number;
  quotesRead: number;
  quotesShared: number;
  quotesCopied: number;
  categoriesExplored: string[];
  weeklyActivity: number[];
  unlockedAchievements: string[];
  daysUsingApp: number;
}

const LAST_OPEN_KEY = "ds-last-open-date";
const APP_START_DATE_KEY = "ds-app-start-date";

let globalStats: UserStats = { ...DEFAULT_STATS };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  try {
    globalStats = storageRepository.getItem<UserStats>(STORAGE_KEYS.USER_STATS, { ...DEFAULT_STATS });
  } catch (e) {
    logger.error("Failed to load user stats from repository:", e);
  }
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>(globalStats);

  useEffect(() => {
    const handleUpdate = () => {
      setStats({ ...globalStats });
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const saveStats = (newStats: UserStats) => {
    globalStats = { ...newStats };
    try {
      storageRepository.setItem(STORAGE_KEYS.USER_STATS, newStats);
    } catch (e) {
      logger.error("Failed to save user stats:", e);
    }
    notify();
  };

  const initializeStats = (favoritesCount: number) => {
    if (typeof window === "undefined") return;

    const todayStr = new Date().toDateString();
    const lastOpenStr = storageRepository.getItem<string | null>(LAST_OPEN_KEY, null);
    
    let startDateStr = storageRepository.getItem<string | null>(APP_START_DATE_KEY, null);
    if (!startDateStr) {
      startDateStr = new Date().toISOString();
      storageRepository.setItem(APP_START_DATE_KEY, startDateStr);
    }
    const daysUsing = Math.max(
      1,
      Math.ceil(
        (new Date().getTime() - new Date(startDateStr).getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    let currentStreak = globalStats.streak;
    let longestStreak = globalStats.longestStreak;

    if (lastOpenStr !== todayStr) {
      if (lastOpenStr) {
        const lastOpenDate = new Date(lastOpenStr);
        const todayDate = new Date(todayStr);
        const diffTime = todayDate.getTime() - lastOpenDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      
      storageRepository.setItem(LAST_OPEN_KEY, todayStr);
    }

    const updatedStats = {
      ...globalStats,
      streak: currentStreak || 1,
      longestStreak: longestStreak || 1,
      daysUsingApp: daysUsing,
    };

    checkAchievements(updatedStats, favoritesCount);
  };

  const incrementMetric = (
    metric: "read" | "share" | "copy",
    favoritesCount: number
  ) => {
    const updatedWeeklyActivity = [...globalStats.weeklyActivity];
    const todayIndex = new Date().getDay();
    updatedWeeklyActivity[todayIndex] = (updatedWeeklyActivity[todayIndex] || 0) + 1;

    const updatedStats = { ...globalStats, weeklyActivity: updatedWeeklyActivity };

    if (metric === "read") {
      updatedStats.quotesRead += 1;
    } else if (metric === "share") {
      updatedStats.quotesShared += 1;
    } else if (metric === "copy") {
      updatedStats.quotesCopied += 1;
    }

    checkAchievements(updatedStats, favoritesCount);
  };

  const addCategoryExplored = (category: string, favoritesCount: number) => {
    if (globalStats.categoriesExplored.includes(category)) return;
    const updatedStats = {
      ...globalStats,
      categoriesExplored: [...globalStats.categoriesExplored, category],
    };
    checkAchievements(updatedStats, favoritesCount);
  };

  const checkAchievements = (newStats: UserStats, favoritesCount: number) => {
    const newlyUnlocked: string[] = [...newStats.unlockedAchievements];

    ACHIEVEMENTS.forEach((ach) => {
      if (newlyUnlocked.includes(ach.id)) return;

      let value = 0;
      if (ach.metric === "favorites") value = favoritesCount;
      else if (ach.metric === "read") value = newStats.quotesRead;
      else if (ach.metric === "streak") value = newStats.streak;
      else if (ach.metric === "share") value = newStats.quotesShared;
      else if (ach.metric === "copy") value = newStats.quotesCopied;

      if (value >= ach.requiredValue) {
        newlyUnlocked.push(ach.id);
        setTimeout(() => {
          toast.success(`Achievement Unlocked! 🏆`, {
            description: `${ach.name}: ${ach.description}`,
            className: "rounded-2xl border-primary/20 bg-card/95 backdrop-blur-md shadow-glow",
          });
        }, 1500);
      }
    });

    saveStats({
      ...newStats,
      unlockedAchievements: newlyUnlocked,
    });
  };

  return {
    stats,
    initializeStats,
    incrementMetric,
    addCategoryExplored,
  };
}
