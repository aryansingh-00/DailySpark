import quotesData from "../data/quotes.json";
import type { Quote } from "../models/quote";
import {
  Flame,
  Trophy,
  Leaf,
  Briefcase,
  BookOpen,
  Dumbbell,
  Heart,
  Smile,
  Compass,
  TrendingUp,
} from "lucide-react";

const quotes = quotesData as Quote[];

export const CATEGORY_META = {
  Motivation: {
    iconName: "Flame",
    gradient: "bg-[linear-gradient(135deg,#6366F1,#8B5CF6)]",
  },
  Success: {
    iconName: "Trophy",
    gradient: "bg-[linear-gradient(135deg,#EC4899,#F43F5E)]",
  },
  Life: {
    iconName: "Leaf",
    gradient: "bg-[linear-gradient(135deg,#06B6D4,#0EA5E9)]",
  },
  Business: {
    iconName: "Briefcase",
    gradient: "bg-[linear-gradient(135deg,#F59E0B,#EF4444)]",
  },
  Study: {
    iconName: "BookOpen",
    gradient: "bg-[linear-gradient(135deg,#10B981,#06B6D4)]",
  },
  Fitness: {
    iconName: "Dumbbell",
    gradient: "bg-[linear-gradient(135deg,#F97316,#EC4899)]",
  },
  Love: {
    iconName: "Heart",
    gradient: "bg-[linear-gradient(135deg,#EC4899,#8B5CF6)]",
  },
  Happiness: {
    iconName: "Smile",
    gradient: "bg-[linear-gradient(135deg,#FACC15,#F97316)]",
  },
  Discipline: {
    iconName: "Compass",
    gradient: "bg-[linear-gradient(135deg,#8B5CF6,#EC4899)]",
  },
  "Self Growth": {
    iconName: "TrendingUp",
    gradient: "bg-[linear-gradient(135deg,#10B981,#3B82F6)]",
  },
} as const;

export const categoryIconMap = {
  Flame,
  Trophy,
  Leaf,
  Briefcase,
  BookOpen,
  Dumbbell,
  Heart,
  Smile,
  Compass,
  TrendingUp,
} as const;

export const quoteService = {
  getAllQuotes(): Quote[] {
    return quotes;
  },

  getRandomQuote(): Quote {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  },

  getQuoteOfDay(): Quote {
    // Stable daily quote selection based on date index
    const now = new Date();
    const day = Math.floor(now.getTime() / 86400000); // Days since Unix epoch
    const dayIndex = day % quotes.length;
    return quotes[dayIndex];
  },

  searchQuotes(query: string): Quote[] {
    if (!query) return quotes;
    const cleanQuery = query.toLowerCase().trim();
    return quotes.filter(
      (q) =>
        q.quote.toLowerCase().includes(cleanQuery) ||
        q.author.toLowerCase().includes(cleanQuery) ||
        q.category.toLowerCase().includes(cleanQuery)
    );
  },

  getQuotesByCategory(category: string): Quote[] {
    return quotes.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  },

  getCategories() {
    const counts = quotes.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(CATEGORY_META).map((catName) => {
      const meta = CATEGORY_META[catName as keyof typeof CATEGORY_META];
      return {
        name: catName,
        count: counts[catName] || 0,
        gradient: meta.gradient,
        iconName: meta.iconName,
        icon: categoryIconMap[meta.iconName as keyof typeof categoryIconMap],
      };
    });
  },
};
