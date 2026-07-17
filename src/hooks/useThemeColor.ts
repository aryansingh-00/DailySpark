import { useState, useEffect } from "react";

export interface AccentTheme {
  id: string;
  name: string;
  brand: string;
  brand2: string;
  brand3: string;
  badgeClass: string;
}

export const ACCENT_THEMES: AccentTheme[] = [
  {
    id: "indigo",
    name: "Indigo Spark",
    brand: "oklch(0.585 0.213 277)",
    brand2: "oklch(0.68 0.22 355)",
    brand3: "oklch(0.74 0.14 210)",
    badgeClass: "bg-indigo-500",
  },
  {
    id: "emerald",
    name: "Emerald Calm",
    brand: "oklch(0.69 0.18 165)",
    brand2: "oklch(0.58 0.19 155)",
    brand3: "oklch(0.74 0.14 210)",
    badgeClass: "bg-emerald-500",
  },
  {
    id: "rose",
    name: "Rose Heart",
    brand: "oklch(0.65 0.23 15)",
    brand2: "oklch(0.62 0.22 330)",
    brand3: "oklch(0.58 0.21 277)",
    badgeClass: "bg-rose-500",
  },
  {
    id: "amber",
    name: "Amber Flame",
    brand: "oklch(0.76 0.19 75)",
    brand2: "oklch(0.69 0.18 55)",
    brand3: "oklch(0.65 0.23 15)",
    badgeClass: "bg-amber-500",
  },
  {
    id: "violet",
    name: "Violet Success",
    brand: "oklch(0.58 0.21 277)",
    brand2: "oklch(0.62 0.22 330)",
    brand3: "oklch(0.6 0.17 250)",
    badgeClass: "bg-violet-500",
  },
];

const THEME_KEY = "ds-theme-accent";

let activeThemeIndex = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  try {
    const savedIdx = localStorage.getItem(THEME_KEY);
    if (savedIdx) {
      activeThemeIndex = parseInt(savedIdx, 10);
      if (isNaN(activeThemeIndex) || activeThemeIndex < 0 || activeThemeIndex >= ACCENT_THEMES.length) {
        activeThemeIndex = 0;
      }
    }
  } catch (e) {
    console.error("Failed to load active theme index:", e);
  }
}

export function useThemeColor() {
  const [themeIndex, setThemeIndex] = useState(activeThemeIndex);

  useEffect(() => {
    const handleUpdate = () => {
      setThemeIndex(activeThemeIndex);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  // Injects styles directly into the root stylesheet
  const applyTheme = (index: number) => {
    if (typeof window === "undefined") return;
    const theme = ACCENT_THEMES[index];
    const root = document.documentElement;

    root.style.setProperty("--brand", theme.brand);
    root.style.setProperty("--brand-2", theme.brand2);
    root.style.setProperty("--brand-3", theme.brand3);
    root.style.setProperty("--ring", theme.brand);
  };

  const selectTheme = (index: number) => {
    if (index < 0 || index >= ACCENT_THEMES.length) return;
    activeThemeIndex = index;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(THEME_KEY, index.toString());
      } catch (e) {
        // Ignored
      }
    }
    applyTheme(index);
    notify();
  };

  return {
    activeTheme: ACCENT_THEMES[themeIndex],
    themeIndex,
    selectTheme,
    applyTheme,
  };
}
