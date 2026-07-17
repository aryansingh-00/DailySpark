import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, memo } from "react";
import {
  Heart,
  BookmarkCheck,
  BookOpen,
  Trophy,
  Flame,
  Zap,
  Share2,
  Copy,
  Bell,
  Moon,
  ChevronRight,
  Star,
  Shield,
  Info,
  Lock,
  User,
  Calendar,
  Sparkles,
  Award,
  LockOpen,
  Sliders,
  Palette,
  Check,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useUserStats, ACHIEVEMENTS } from "@/hooks/useUserStats";
import { useFavorites } from "@/hooks/useFavorites";
import { useThemeColor, ACCENT_THEMES } from "@/hooks/useThemeColor";
import { notificationService } from "@/services/notificationService";
import { adService } from "@/services/adService";
import { LegalModal, RatingModal } from "@/components/LegalViews";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Dashboard – DailySpark" },
      {
        name: "description",
        content:
          "Track your streaks, view unlocked achievements, weekly activity logs, and edit preferences.",
      },
    ],
  }),
  component: ProfilePage,
});

type ModalType = "privacy" | "terms" | "licenses" | "about" | "rating" | null;

interface JournalEntry {
  id: string;
  quoteId: number;
  date: string;
  quoteText: string;
  author: string;
  reflectionText: string;
}

// Optimized Subcomponent for Achievement Card
const AchievementCard = memo(
  ({
    ach,
    unlocked,
    onIconRender,
  }: {
    ach: (typeof ACHIEVEMENTS)[0];
    unlocked: boolean;
    onIconRender: (iconName: string, unlocked: boolean) => React.ReactNode;
  }) => {
    return (
      <div
        role="listitem"
        aria-label={`${ach.name} achievement, ${unlocked ? "unlocked" : "locked"}`}
        className={`relative flex flex-col items-center text-center p-4 rounded-3xl transition-all duration-300 ring-1 ${
          unlocked
            ? "bg-card border-none ring-border shadow-soft hover:-translate-y-1 hover:shadow-glow"
            : "bg-muted/30 border-dashed ring-transparent opacity-65"
        }`}
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-soft ${
            unlocked ? `bg-gradient-to-br ${ach.badgeColor}` : "bg-muted text-muted-foreground"
          }`}
        >
          {unlocked ? (
            onIconRender(ach.icon, true)
          ) : (
            <Lock className="h-6 w-6 text-muted-foreground/60" />
          )}
        </div>
        <div className="text-xs font-bold mt-3 leading-tight">{ach.name}</div>
        <div className="text-[10px] text-muted-foreground mt-1 leading-normal">
          {ach.description}
        </div>
      </div>
    );
  },
);
AchievementCard.displayName = "AchievementCard";

function ProfilePage() {
  const navigate = useNavigate();
  const { stats, initializeStats } = useUserStats();
  const { favorites } = useFavorites();
  const { themeIndex, selectTheme } = useThemeColor();

  // Dark Mode preferences
  const [darkMode, setDarkMode] = useState(false);

  // Notification states
  const [notifSupported, setNotifSupported] = useState(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [customTime, setCustomTime] = useState("08:00");

  // Ad Preferences state
  const [adConsentType, setAdConsentType] = useState<string>("non-personalized");
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  // Modal overlays
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Reflections Journal state
  const [reflections, setReflections] = useState<JournalEntry[]>([]);

  useEffect(() => {
    initializeStats(favorites.length);

    if (typeof window !== "undefined") {
      setDarkMode(localStorage.getItem("ds-dark") === "1");

      // Notif preferences
      setNotifSupported(notificationService.isSupported());
      setNotifPermission(notificationService.getPermissionState());
      setNotifEnabled(notificationService.getPreference("enabled") as boolean);
      setMorningReminder(notificationService.getPreference("morning") as boolean);
      setEveningReminder(notificationService.getPreference("evening") as boolean);
      setCustomTime(notificationService.getPreference("customTime") as string);

      // Ad details
      setAdConsentType(adService.getConsentType());
      setPremiumUnlocked(adService.isPremiumUnlocked());

      // Load journal entries
      const savedJournal = localStorage.getItem("ds-reflections");
      if (savedJournal) {
        setReflections(JSON.parse(savedJournal));
      }
    }
  }, [favorites.length]);

  // Subscribe to ad state changes
  useEffect(() => {
    return adService.subscribe(() => {
      setAdConsentType(adService.getConsentType());
      setPremiumUnlocked(adService.isPremiumUnlocked());
    });
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ds-dark", next ? "1" : "0");

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }

    toast.success(next ? "Dark mode enabled 🌙" : "Light mode enabled ☀️", {
      className: "rounded-2xl",
    });
  };

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      toast.success("Notification permission granted! 🎉", {
        className: "rounded-2xl",
      });
    } else {
      toast.error("Notification permission denied.", {
        className: "rounded-2xl",
      });
    }
  };

  const handleToggleNotifications = () => {
    const next = !notifEnabled;
    setNotifEnabled(next);
    notificationService.setPreference("enabled", next);
    toast.success(next ? "Reminders enabled" : "Reminders disabled", {
      className: "rounded-2xl",
    });
  };

  const handleToggleMorning = () => {
    const next = !morningReminder;
    setMorningReminder(next);
    notificationService.setPreference("morning", next);
  };

  const handleToggleEvening = () => {
    const next = !eveningReminder;
    setEveningReminder(next);
    notificationService.setPreference("evening", next);
  };

  const handleCustomTimeChange = (val: string) => {
    setCustomTime(val);
    notificationService.setPreference("customTime", val);
  };

  const handleTestNotification = () => {
    try {
      notificationService.sendTestNotification();
    } catch (e: any) {
      toast.error(e.message || "Failed to trigger notification.", {
        className: "rounded-2xl",
      });
    }
  };

  // Toggle Ad preferences
  const cycleAdConsent = () => {
    let next: "all" | "non-personalized" | "declined" = "non-personalized";
    if (adConsentType === "personalized") next = "non-personalized";
    else if (adConsentType === "non-personalized") next = "declined";
    else next = "all";

    adService.setConsent(next);
    toast.success(`Consent updated: ${next}`, { className: "rounded-2xl" });
  };

  const togglePremiumUnlock = () => {
    if (premiumUnlocked) {
      adService.lockPremium();
      toast.info("Premium categories locked.", { className: "rounded-2xl" });
    } else {
      adService.unlockPremium();
      toast.success("Premium categories unlocked! 🔑", { className: "rounded-2xl" });
    }
  };

  const handleSelectTheme = (index: number) => {
    selectTheme(index);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    toast.success(`Theme updated: ${ACCENT_THEMES[index].name} ✨`, {
      className: "rounded-2xl",
    });
  };

  // Journal handlers
  const handleCopyJournal = (j: JournalEntry) => {
    if (typeof navigator !== "undefined") {
      navigator.vibrate?.(10);
      navigator.clipboard.writeText(
        `“${j.quoteText}” — ${j.author}\n\nMy Reflection (${j.date}): ${j.reflectionText}`,
      );
      toast.success("Journal reflection copied!", { className: "rounded-2xl" });
    }
  };

  const handleShareJournal = async (j: JournalEntry) => {
    const text = `“${j.quoteText}” — ${j.author}\n\nMy Reflection (${j.date}): ${j.reflectionText} (via DailySpark)`;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    if (navigator.share) {
      try {
        await navigator.share({ text: text, title: "My Reflection Entry" });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Journal reflection copied for sharing!", { className: "rounded-2xl" });
    }
  };

  const handleDeleteJournal = (id: string) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    const updated = reflections.filter((j) => j.id !== id);
    setReflections(updated);
    localStorage.setItem("ds-reflections", JSON.stringify(updated));
    toast.success("Journal entry deleted.", { className: "rounded-2xl" });
  };

  // Recharts weekly data mapping
  const chartData = [
    { name: "Sun", count: stats.weeklyActivity[0] || 0 },
    { name: "Mon", count: stats.weeklyActivity[1] || 0 },
    { name: "Tue", count: stats.weeklyActivity[2] || 0 },
    { name: "Wed", count: stats.weeklyActivity[3] || 0 },
    { name: "Thu", count: stats.weeklyActivity[4] || 0 },
    { name: "Fri", count: stats.weeklyActivity[5] || 0 },
    { name: "Sat", count: stats.weeklyActivity[6] || 0 },
  ];

  // Helper to map dynamic string name to Lucide Icon React Components
  const renderAchievementIcon = (iconName: string, unlocked: boolean) => {
    const classStr = `h-6 w-6 ${unlocked ? "text-white" : "text-muted-foreground/60"}`;
    switch (iconName) {
      case "Heart":
        return <Heart className={classStr} />;
      case "Bookmark":
        return <BookmarkCheck className={classStr} />;
      case "BookOpen":
        return <BookOpen className={classStr} />;
      case "Trophy":
        return <Trophy className={classStr} />;
      case "Flame":
        return <Flame className={classStr} />;
      case "Zap":
        return <Zap className={classStr} />;
      case "Share2":
        return <Share2 className={classStr} />;
      case "Copy":
        return <Copy className={classStr} />;
      default:
        return <Sparkles className={classStr} />;
    }
  };

  return (
    <AppShell>
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-brand-gradient pb-16 pt-8 text-white">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative px-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md shadow-glow animate-scale-in">
              <User className="h-8 w-8 text-white animate-pulse" strokeWidth={2.4} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Your Dashboard</h1>
              <p className="text-xs text-white/80 mt-1">
                Spark Member for {stats.daysUsingApp} {stats.daysUsingApp === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <section className="px-5 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-2.5 rounded-3xl bg-card p-4 shadow-soft ring-1 ring-border">
          <div className="flex flex-col items-center justify-center text-center p-2.5">
            <Flame className="h-6 w-6 text-orange-500 animate-pulse mb-1" strokeWidth={2.4} />
            <div className="text-lg font-bold">{stats.streak}d</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Streak
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-2.5 border-x border-border/70">
            <Trophy className="h-6 w-6 text-amber-500 mb-1" strokeWidth={2.4} />
            <div className="text-lg font-bold">{stats.longestStreak}d</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Best Streak
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-2.5">
            <Heart className="h-6 w-6 text-rose-500 mb-1" strokeWidth={2.4} />
            <div className="text-lg font-bold">{favorites.length}</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Favorites
            </div>
          </div>
        </div>
      </section>

      {/* Detail Counters Row */}
      <section className="px-5 mt-6 grid grid-cols-3 gap-2.5 text-center animate-fade-in">
        <div className="rounded-2xl bg-card p-3 shadow-soft border border-border">
          <div className="text-sm font-semibold text-muted-foreground">Read</div>
          <div className="text-base font-bold mt-1 text-primary">{stats.quotesRead}</div>
        </div>
        <div className="rounded-2xl bg-card p-3 shadow-soft border border-border">
          <div className="text-sm font-semibold text-muted-foreground">Shared</div>
          <div className="text-base font-bold mt-1 text-secondary">{stats.quotesShared}</div>
        </div>
        <div className="rounded-2xl bg-card p-3 shadow-soft border border-border">
          <div className="text-sm font-semibold text-muted-foreground">Copied</div>
          <div className="text-base font-bold mt-1 text-accent-foreground">
            {stats.quotesCopied}
          </div>
        </div>
      </section>

      {/* Weekly Activity Chart (Recharts) */}
      <section className="px-5 mt-6">
        <div className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-border">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-primary" /> Weekly Activity
          </h2>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "1rem",
                    fontSize: "12px",
                    boxShadow: "var(--shadow-soft)",
                  }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count > 0 ? "var(--color-primary)" : "var(--color-muted)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Reflections Journal Log Section */}
      <section className="px-5 mt-6 animate-fade-in">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" /> My Reflections Journal (
          {reflections.length})
        </h2>
        <div className="rounded-3xl bg-card p-5 border border-border shadow-soft">
          {reflections.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-muted-foreground font-semibold">
                No journal entries yet. 📝
              </p>
              <p className="text-[10px] text-muted-foreground/80 mt-1 max-w-[200px] mx-auto leading-relaxed">
                Open any quote details, write down your thoughts, and tap "Save Reflection" to start
                your growth journal.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {reflections.map((j) => (
                <div
                  key={j.id}
                  className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex flex-col gap-2 relative group hover:bg-muted/65 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
                      {j.date}
                    </span>
                    <button
                      onClick={() => handleDeleteJournal(j.id)}
                      className="text-muted-foreground hover:text-rose-500 opacity-60 hover:opacity-100 transition-all p-1"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/90 italic leading-relaxed border-l-2 border-primary/20 pl-2">
                    “{j.quoteText}” <span className="font-semibold">— {j.author}</span>
                  </p>
                  <p className="text-xs font-semibold text-foreground leading-relaxed whitespace-pre-wrap mt-0.5">
                    {j.reflectionText}
                  </p>
                  <div className="flex items-center gap-2 mt-1 justify-end border-t border-border/40 pt-2">
                    <button
                      onClick={() => handleCopyJournal(j)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/90 transition-all"
                      title="Copy"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleShareJournal(j)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/90 transition-all"
                      title="Share"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Theme Accent Settings */}
      <section className="px-5 mt-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Palette className="h-4.5 w-4.5 text-primary" /> Premium Appearance
        </div>
        <div className="rounded-3xl bg-card p-5 border border-border shadow-soft flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Accent Spark Color</span>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              {ACCENT_THEMES[themeIndex].name}
            </span>
          </div>
          {/* Accent picker row */}
          <div className="flex items-center gap-3">
            {ACCENT_THEMES.map((theme, idx) => (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(idx)}
                aria-label={`Select ${theme.name} theme`}
                className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl shadow-soft transition-transform active:scale-90 ${theme.badgeClass}`}
              >
                {themeIndex === idx && (
                  <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-white text-primary shadow-soft animate-scale-in">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Grid Shelf */}
      <section className="px-5 mt-6">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Trophy className="h-4.5 w-4.5 text-amber-500" /> Achievements (
          {stats.unlockedAchievements.length} / {ACHIEVEMENTS.length})
        </h2>
        <div role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = stats.unlockedAchievements.includes(ach.id);
            return (
              <AchievementCard
                key={ach.id}
                ach={ach}
                unlocked={unlocked}
                onIconRender={renderAchievementIcon}
              />
            );
          })}
        </div>
      </section>

      {/* Monetization & Premium Panel */}
      <section className="px-5 mt-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Award className="h-4 w-4 text-primary" /> Monetization & Ads Settings
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-border">
          {/* Ad Personalized Consent */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
                <Sliders className="h-5 w-5" />
              </span>
              <div>
                <span className="block text-sm font-semibold">Privacy Ad Consent</span>
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">
                  {adConsentType === "personalized"
                    ? "Personalized"
                    : adConsentType === "non-personalized"
                      ? "Non-Personalized"
                      : "Ads Blocked"}
                </span>
              </div>
            </div>
            <button
              onClick={cycleAdConsent}
              className="rounded-xl bg-muted border border-border px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-muted/85"
            >
              Cycle Options
            </button>
          </div>

          {/* Premium Unlocked status */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white animate-pulse">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <span className="block text-sm font-semibold">Premium Categories</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">
                  {premiumUnlocked ? "Unlocked (Ad-free Active) 🎉" : "Locked (Ads Enabled)"}
                </span>
              </div>
            </div>
            <button
              onClick={togglePremiumUnlock}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                premiumUnlocked
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-muted text-muted-foreground"
              }`}
              aria-label={premiumUnlocked ? "Lock Premium" : "Unlock Premium"}
            >
              {premiumUnlocked ? (
                <LockOpen className="h-4.5 w-4.5" />
              ) : (
                <Lock className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Notifications Panel */}
      <section className="px-5 mt-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Bell className="h-4 w-4" /> Notification Settings
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-border">
          {/* Permission */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-white">
                <Shield className="h-5 w-5" />
              </span>
              <div>
                <span className="block text-sm font-semibold">Permission Status</span>
                <span className="block text-[10px] text-muted-foreground tracking-widest uppercase font-semibold mt-0.5">
                  {notifPermission === "granted"
                    ? "Granted 🎉"
                    : notifPermission === "denied"
                      ? "Denied ❌"
                      : "Not Requested ⚠️"}
                </span>
              </div>
            </div>
            {notifPermission !== "granted" && (
              <button
                onClick={handleRequestPermission}
                className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-soft transition-transform hover:scale-105 active:scale-95"
              >
                Request
              </button>
            )}
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500 text-white">
                <Bell className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold">Enable Reminders</span>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${
                  notifEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Morning reminder */}
          {notifEnabled && (
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <Star className="h-5 w-5" />
                </span>
                <div>
                  <span className="block text-sm font-semibold">Morning Motivation</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">
                    Every day at 8:00 AM
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggleMorning}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  morningReminder ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${
                    morningReminder ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Evening reminder */}
          {notifEnabled && (
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
                  <Moon className="h-5 w-5" />
                </span>
                <div>
                  <span className="block text-sm font-semibold">Evening Motivation</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">
                    Every day at 8:00 PM
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggleEvening}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  eveningReminder ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${
                    eveningReminder ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Custom Time */}
          {notifEnabled && (
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <Calendar className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold">Custom Reminder Time</span>
              </div>
              <input
                type="time"
                value={customTime}
                onChange={(e) => handleCustomTimeChange(e.target.value)}
                className="rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-semibold outline-none focus:border-primary"
              />
            </div>
          )}

          {/* Test button */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-muted/20">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </span>
              <div>
                <span className="block text-sm font-semibold">Test Reminders</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">
                  Trigger an instant mock notification
                </span>
              </div>
            </div>
            <button
              onClick={handleTestNotification}
              className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:scale-105 active:scale-95"
            >
              Test Notif
            </button>
          </div>
        </div>
      </section>

      {/* Preferences & Legal group */}
      <section className="px-5 mt-6 pb-24">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Info className="h-4 w-4" /> Preferences & Info
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-border">
          {/* Dark Mode */}
          <div className="flex w-full items-center justify-between px-4 py-3.5 text-left">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Moon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Dark mode</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                darkMode ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${
                  darkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Rate App */}
          <div
            onClick={() => setActiveModal("rating")}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Star className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Rate the app</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Share App */}
          <div
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "DailySpark",
                  text: "Get your daily dose of motivation and custom quote cards offline with DailySpark! ✨",
                  url: window.location.origin,
                });
              } else {
                navigator.clipboard.writeText(
                  "DailySpark Quote App: Spark your day with positive wisdom!",
                );
                toast.success("App link copied to clipboard!", { className: "rounded-2xl" });
              }
            }}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-white">
                <Share2 className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Share DailySpark</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Contact Developer */}
          <div
            onClick={() =>
              window.open("mailto:developer@dailyspark.app?subject=DailySpark%20Feedback")
            }
            className="flex w-full items-center justify-between px-4 py-3.5 text-left cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
                <Info className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Contact Developer</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Privacy Policy */}
          <div
            onClick={() => setActiveModal("privacy")}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <Shield className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Privacy policy</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Terms & Conditions */}
          <div
            onClick={() => setActiveModal("terms")}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Terms & Conditions</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Open Source Licenses */}
          <div
            onClick={() => setActiveModal("licenses")}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                <Award className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Software Credits & Licenses</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* About App */}
          <div
            onClick={() => setActiveModal("about")}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">About DailySpark</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Render Modals sheets */}
      {activeModal && activeModal !== "rating" && (
        <LegalModal type={activeModal} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "rating" && <RatingModal onClose={() => setActiveModal(null)} />}
    </AppShell>
  );
}
