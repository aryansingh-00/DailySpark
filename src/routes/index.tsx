import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useRef, memo } from "react";
import {
  Bell,
  Sparkles,
  Shuffle,
  Bookmark,
  BookmarkCheck,
  Share2,
  Quote as QuoteIcon,
  Flame,
  Trophy,
  Leaf,
  Briefcase,
  BookOpen,
  Dumbbell,
  Heart,
  Smile,
  Copy,
  Plus,
  X,
  ChevronRight,
  User,
  History,
  ArrowRight,
  Search,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Edit3,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AppLogo } from "@/components/AppLogo";
import { SearchBar } from "@/components/SearchBar";
import { FeatureCard } from "@/components/FeatureCard";
import { CategoryCard } from "@/components/CategoryCard";
import { SectionTitle } from "@/components/SectionTitle";
import { quoteService, CATEGORY_META } from "@/services/quoteService";
import { useFavorites } from "@/hooks/useFavorites";
import { useUserStats } from "@/hooks/useUserStats";
import { useThemeColor } from "@/hooks/useThemeColor";
import { QuoteImageGenerator } from "@/components/QuoteImageGenerator";
import { QuoteSkeletonList } from "@/components/QuoteSkeleton";
import { adService } from "@/services/adService";
import { AdaptiveBannerAd, InterstitialAdModal } from "@/components/AdComponents";
import { ConsentBanner } from "@/components/ConsentBanner";
import { toast } from "sonner";
import type { Quote } from "@/models/quote";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DailySpark – Your Daily Motivation" },
      {
        name: "description",
        content:
          "Discover your daily spark with hand-picked motivational quotes across life, success, and happiness.",
      },
    ],
  }),
  component: HomePage,
});

const TRENDING_SEARCHES = ["Discipline", "Steve Jobs", "Success", "Happiness", "Aristotle"];
const SUGGESTED_CATEGORIES = ["Motivation", "Life", "Success", "Fitness", "Study"];

const MOODS = [
  {
    id: "overwhelmed",
    emoji: "😔",
    label: "Overwhelmed",
    keywords: ["peace", "calm", "now", "present", "breathe", "slow"],
  },
  {
    id: "unmotivated",
    emoji: "🥱",
    label: "Unmotivated",
    keywords: [
      "action",
      "do",
      "begin",
      "start",
      "warrior",
      "force",
      "effort",
      "consistently",
      "excellence",
    ],
  },
  {
    id: "anxious",
    emoji: "😠",
    label: "Anxious",
    keywords: ["courage", "brave", "trust", "mind", "fear", "confidence", "potentials"],
  },
  {
    id: "joyful",
    emoji: "😊",
    label: "Joyful",
    keywords: ["happy", "smile", "laugh", "joy", "glorious", "beautiful", "harmony"],
  },
  {
    id: "lonely",
    emoji: "🚶",
    label: "Lonely",
    keywords: ["love", "heart", "friend", "loved", "each other", "trust"],
  },
];

// Optimized Quote Card Component
const QuoteItemCard = memo(
  ({
    q,
    favorited,
    onFavorite,
    onShare,
    onShareCard,
    onCopy,
    onOpenDetails,
  }: {
    q: Quote;
    favorited: boolean;
    onFavorite: (q: Quote) => void;
    onShare: (text: string, auth: string) => void;
    onShareCard: (q: Quote) => void;
    onCopy: (text: string) => void;
    onOpenDetails: (q: Quote) => void;
  }) => {
    return (
      <div
        role="article"
        aria-label={`Quote by ${q.author}`}
        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-card p-6 shadow-soft ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-glow animate-fade-in-up"
      >
        <div className="relative">
          <span className="text-5xl font-serif text-primary/10 absolute -left-2 -top-4 pointer-events-none select-none">
            “
          </span>
          <p
            onClick={() => onOpenDetails(q)}
            className="relative z-10 text-base font-semibold leading-relaxed text-foreground cursor-pointer hover:text-primary transition-colors focus:outline-none focus:text-primary"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpenDetails(q);
            }}
          >
            {q.quote}
          </p>
          <p className="mt-3 text-sm text-muted-foreground font-medium">— {q.author}</p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground select-none">
            {q.category}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onFavorite(q)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-90 ${
                favorited
                  ? "bg-secondary/15 text-secondary scale-105 shadow-inner"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
              aria-label={favorited ? "Remove from Favorites" : "Add to Favorites"}
              aria-pressed={favorited}
            >
              {favorited ? (
                <BookmarkCheck className="h-4.5 w-4.5 fill-current" />
              ) : (
                <Bookmark className="h-4.5 w-4.5" />
              )}
            </button>
            <button
              onClick={() => onShare(q.quote, q.author)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
              aria-label="Share quote"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => onShareCard(q)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
              aria-label="Export quote card image"
            >
              <ImageIcon className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => onCopy(q.quote)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
              aria-label="Copy quote text"
            >
              <Copy className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    );
  },
);
QuoteItemCard.displayName = "QuoteItemCard";

function HomePage() {
  const navigate = useNavigate();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { stats, initializeStats, incrementMetric } = useUserStats();
  const { applyTheme, themeIndex } = useThemeColor();

  // Controlled states
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("Hello ✨");
  const [sessionQuoteOfDay, setSessionQuoteOfDay] = useState<Quote | null>(null);
  const [isShufflingQotd, setIsShufflingQotd] = useState(false);

  // Recent Searches state
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  // Recently Opened quotes state
  const [recentlyOpened, setRecentlyOpened] = useState<Quote[]>([]);

  // Random Modal / Details Modal state
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randomQuote, setRandomQuote] = useState<Quote | null>(null);
  const [isModalShuffling, setIsModalShuffling] = useState(false);

  // Quote Image Generator state
  const [showImageGenModal, setShowImageGenModal] = useState(false);
  const [imageGenQuote, setImageGenQuote] = useState<Quote | null>(null);

  // Interstitial Ad trigger state
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Shimmer Searching state
  const [isSearching, setIsSearching] = useState(false);

  // Pagination bounds
  const [displayLimit, setDisplayLimit] = useState(12);

  // Scroll ref
  const qotdRef = useRef<HTMLDivElement>(null);

  // --- NEW STATES FOR PREMIUM FEATURES ---
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [reflectionInput, setReflectionInput] = useState("");
  const [activeMood, setActiveMood] = useState<string | null>(null);

  // Trigger Haptic Vibration (Web Vibrate API)
  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Load greeting, stats, recent searches on mount
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good Morning ☀️");
    else if (hours < 18) setGreeting("Good Afternoon 🌤️");
    else setGreeting("Good Evening 🌙");

    applyTheme(themeIndex);
    setSessionQuoteOfDay(quoteService.getQuoteOfDay());
    initializeStats(favorites.length);

    if (typeof window !== "undefined") {
      const savedSearches = localStorage.getItem("ds-recent-searches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }

      const savedRecentQuotes = localStorage.getItem("ds-recently-opened");
      if (savedRecentQuotes) {
        setRecentlyOpened(JSON.parse(savedRecentQuotes));
      }
    }
  }, []);

  // Popular categories list
  const categories = useMemo(() => {
    return quoteService.getCategories();
  }, []);

  // Stable trending quotes slice
  const trendingQuotes = useMemo(() => {
    return quoteService.getAllQuotes().slice(10, 15);
  }, []);

  // Real-time search query results
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return quoteService.searchQuotes(searchQuery);
  }, [searchQuery]);

  // Paginated search results
  const paginatedSearchResults = useMemo(() => {
    return searchResults.slice(0, displayLimit);
  }, [searchResults, displayLimit]);

  // --- SEMANTIC MOOD FILTER LOGIC ---
  const moodFilteredQuotes = useMemo(() => {
    if (!activeMood) return [];
    const moodInfo = MOODS.find((m) => m.id === activeMood);
    if (!moodInfo) return [];

    const allQ = quoteService.getAllQuotes();
    return allQ.filter((q) => {
      const text = `${q.quote} ${q.category} ${q.author}`.toLowerCase();
      return moodInfo.keywords.some((kw) => text.includes(kw));
    });
  }, [activeMood]);

  // Load reflection when randomQuote changes (in details modal)
  useEffect(() => {
    if (randomQuote) {
      const saved = localStorage.getItem("ds-reflections");
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = parsed.find((r: any) => r.quoteId === randomQuote.id);
        setReflectionInput(found ? found.reflectionText : "");
      } else {
        setReflectionInput("");
      }
    }
  }, [randomQuote]);

  // Interstitial checker helper
  const handleActionWithAd = (action: () => void) => {
    const triggerAd = adService.registerInteraction();
    if (triggerAd) {
      setPendingAction(() => action);
      setShowInterstitial(true);
    } else {
      action();
    }
  };

  const handleFavoriteToggle = (q: Quote) => {
    triggerHaptic();
    toggleFavorite(q);
  };

  // Copy handler
  const handleCopy = (text: string) => {
    triggerHaptic();
    navigator.clipboard.writeText(text);
    incrementMetric("copy", favorites.length);
    toast.success("Quote copied to clipboard!", {
      className: "rounded-2xl",
    });
  };

  // Share handler
  const handleShare = async (quoteText: string, author: string) => {
    triggerHaptic();
    const textToShare = `“${quoteText}” — ${author} (via DailySpark)`;
    incrementMetric("share", favorites.length);
    if (navigator.share) {
      try {
        await navigator.share({
          text: textToShare,
          title: "DailySpark Quote",
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(textToShare);
      toast.success("Quote copied for sharing!", {
        className: "rounded-2xl",
      });
    }
  };

  // Share as Image modal trigger
  const handleShareAsImage = (quote: Quote) => {
    handleActionWithAd(() => {
      setImageGenQuote(quote);
      setShowImageGenModal(true);
    });
  };

  // Handle QOTD Shuffle button
  const handleShuffleQotd = () => {
    triggerHaptic();
    setIsShufflingQotd(true);
    setTimeout(() => {
      const randomQ = quoteService.getRandomQuote();
      setSessionQuoteOfDay(randomQ);
      setIsShufflingQotd(false);
      logRecentlyOpened(randomQ);
      toast.success("New quote loaded!", {
        className: "rounded-2xl",
      });
    }, 400);
  };

  // Open Random Quote dialog
  const handleOpenRandomModal = () => {
    handleActionWithAd(() => {
      // Cancel speech if speaking
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingTts(false);

      const randomQ = quoteService.getRandomQuote();
      setRandomQuote(randomQ);
      setShowRandomModal(true);
      logRecentlyOpened(randomQ);
    });
  };

  // Shuffle quote inside the Random Modal
  const handleShuffleModalQuote = () => {
    triggerHaptic();
    setIsModalShuffling(true);

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingTts(false);

    setTimeout(() => {
      const randomQ = quoteService.getRandomQuote();
      setRandomQuote(randomQ);
      setIsModalShuffling(false);
      logRecentlyOpened(randomQ);
    }, 300);
  };

  // Log clicked/viewed quotes to Recently Opened list
  const logRecentlyOpened = (quote: Quote) => {
    incrementMetric("read", favorites.length);
    setRecentlyOpened((prev) => {
      const filtered = prev.filter((q) => q.id !== quote.id);
      const updated = [quote, ...filtered].slice(0, 3);
      if (typeof window !== "undefined") {
        localStorage.setItem("ds-recently-opened", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleOpenDetails = (quote: Quote) => {
    handleActionWithAd(() => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingTts(false);

      setRandomQuote(quote);
      setShowRandomModal(true);
      logRecentlyOpened(quote);
    });
  };

  // Trigger Daily Motivation scroll & glow
  const handleDailyMotivationHighlight = () => {
    if (qotdRef.current) {
      qotdRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      qotdRef.current.classList.add("ring-4", "ring-primary/55");
      if (sessionQuoteOfDay) {
        logRecentlyOpened(sessionQuoteOfDay);
      }
      toast.info("Here is your spark for today! ✨", {
        className: "rounded-2xl",
      });
      setTimeout(() => {
        qotdRef.current?.classList.remove("ring-4", "ring-primary/55");
      }, 2000);
    }
  };

  // Custom Card Designer Direct Open
  const handleOpenCardDesigner = () => {
    handleActionWithAd(() => {
      setImageGenQuote(undefined);
      setShowImageGenModal(true);
    });
  };

  // Speech Synthesis player
  const handlePlayTts = (quote: Quote) => {
    triggerHaptic();
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Text-to-Speech is not supported on this browser.");
      return;
    }

    if (isPlayingTts) {
      window.speechSynthesis.cancel();
      setIsPlayingTts(false);
      return;
    }

    setIsPlayingTts(true);
    const utterance = new SpeechSynthesisUtterance(quote.quote);
    utterance.rate = 0.82; // serene, peaceful slow pace
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setIsPlayingTts(false);
    };
    utterance.onerror = () => {
      setIsPlayingTts(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  // Save Reflection Entry
  const handleSaveReflection = () => {
    triggerHaptic();
    if (!randomQuote) return;
    if (!reflectionInput.trim()) {
      toast.error("Please write something in your reflection first!");
      return;
    }

    const saved = localStorage.getItem("ds-reflections");
    let parsed = saved ? JSON.parse(saved) : [];

    // Remove old reflection for this quote if exists
    parsed = parsed.filter((r: any) => r.quoteId !== randomQuote.id);

    parsed.unshift({
      id: Math.random().toString(36).substring(2, 9),
      quoteId: randomQuote.id,
      date: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      quoteText: randomQuote.quote,
      author: randomQuote.author,
      reflectionText: reflectionInput.trim(),
    });

    localStorage.setItem("ds-reflections", JSON.stringify(parsed));
    toast.success("Reflection saved to your Journal! 📝", {
      className: "rounded-2xl",
    });
  };

  // Trigger search submits
  const triggerSearch = (query: string) => {
    setDisplayLimit(12);
    setSearchQuery(query);
    if (!query) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(() => {
      setIsSearching(false);
    }, 350);

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, 5);
      if (typeof window !== "undefined") {
        localStorage.setItem("ds-recent-searches", JSON.stringify(updated));
      }
      return updated;
    });

    return () => clearTimeout(timeout);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ds-recent-searches");
    }
    toast.success("Search history cleared.");
  };

  const handleLoadMore = () => {
    triggerHaptic();
    setDisplayLimit((prev) => prev + 12);
  };

  const handleMoodClick = (moodId: string) => {
    triggerHaptic();
    if (activeMood === moodId) {
      setActiveMood(null);
    } else {
      setActiveMood(moodId);
      // Auto scroll to mood section
      setTimeout(() => {
        const section = document.getElementById("mood-sparks-section");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="px-5 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleActionWithAd(() => navigate({ to: "/profile" }))}
              className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="View Profile Dashboard"
            >
              <span className="absolute inset-0 rounded-2xl bg-brand-gradient opacity-40 blur-sm animate-pulse group-hover:opacity-60" />
              <AppLogo size={28} glow={false} className="relative z-10 text-white" />
            </button>
            <div>
              <p className="text-sm font-medium text-muted-foreground animate-pulse">{greeting}</p>
              <h1 className="text-xl font-bold tracking-tight">
                Welcome to <span className="text-brand-gradient font-extrabold">DailySpark</span>
              </h1>
            </div>
          </div>

          {/* Notification Button */}
          <button
            onClick={() => handleActionWithAd(() => navigate({ to: "/profile" }))}
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-card shadow-soft ring-1 ring-border transition-all duration-300 hover:bg-muted active:scale-95 animate-scale-in"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-secondary border-2 border-card animate-ping" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-secondary border-2 border-card" />
          </button>
        </div>

        {/* Real-time search box */}
        <div className="mt-6">
          <SearchBar
            value={searchQuery}
            onChange={triggerSearch}
            placeholder="Search motivation, quotes, authors..."
          />
        </div>

        {/* Mood-Based Spark Finder */}
        {!searchQuery && (
          <div className="mt-5 animate-fade-in">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 select-none">
              How are you feeling today?
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none select-none">
              {MOODS.map((m) => {
                const isActive = activeMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleMoodClick(m.id)}
                    className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap active:scale-95 border ${
                      isActive
                        ? "bg-primary border-primary text-primary-foreground shadow-glow scale-[1.02]"
                        : "bg-card border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Home Sections */}
      {!searchQuery ? (
        <>
          {/* Daily Streak Card */}
          <section className="mt-6 px-5 animate-fade-in">
            <div
              onClick={() => handleActionWithAd(() => navigate({ to: "/profile" }))}
              className="relative overflow-hidden rounded-3xl bg-card p-5 shadow-soft ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-glow cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 animate-pulse">
                  <Flame className="h-7 w-7 fill-current" />
                </div>
                <div>
                  <div className="text-sm font-bold">Your Daily Streak</div>
                  <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {stats.streak === 1
                      ? "1 Day active. Keep going!"
                      : `${stats.streak} Days active. You're on fire! 🔥`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-muted rounded-2xl py-1 px-3 text-xs font-bold text-foreground shadow-inner select-none">
                Best: {stats.longestStreak}d
              </div>
            </div>
          </section>

          {/* Quote of the Day Section */}
          <section ref={qotdRef} className="mt-6 px-5 transition-all duration-500 rounded-3xl">
            {sessionQuoteOfDay && (
              <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-glow transition-all duration-300 hover:shadow-xl">
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl animate-pulse" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm select-none">
                      <Sparkles className="h-3 w-3" /> Quote of the Day
                    </span>
                    <QuoteIcon className="h-8 w-8 text-white/50" />
                  </div>

                  <div
                    className={`transition-opacity duration-350 ${isShufflingQotd ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                  >
                    <p
                      onClick={() => handleOpenDetails(sessionQuoteOfDay)}
                      className="mt-5 text-xl font-bold leading-snug cursor-pointer hover:opacity-95"
                    >
                      “{sessionQuoteOfDay.quote}”
                    </p>
                    <p className="mt-3 text-sm font-semibold text-white/90">
                      — {sessionQuoteOfDay.author}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleFavoriteToggle(sessionQuoteOfDay)}
                      className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                        isFavorite(sessionQuoteOfDay.id)
                          ? "bg-white text-secondary scale-105 shadow-soft"
                          : "bg-white/20 text-white hover:bg-white/35"
                      }`}
                    >
                      {isFavorite(sessionQuoteOfDay.id) ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 fill-current" /> Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4" /> Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleShare(sessionQuoteOfDay.quote, sessionQuoteOfDay.author)}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-white/20 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:bg-white/35"
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </button>
                    <button
                      onClick={() => handleShareAsImage(sessionQuoteOfDay)}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-white/20 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:bg-white/35"
                    >
                      <ImageIcon className="h-4 w-4" /> Card
                    </button>
                    <button
                      onClick={() => handleCopy(sessionQuoteOfDay.quote)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 transition-all duration-300 hover:bg-white/35"
                      aria-label="Copy to Clipboard"
                    >
                      <Copy className="h-4.5 w-4.5" />
                    </button>

                    <button
                      onClick={handleShuffleQotd}
                      aria-label="Shuffle QOTD"
                      className={`ml-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-soft transition-transform duration-300 active:scale-95 ${
                        isShufflingQotd ? "animate-spin" : "hover:scale-105"
                      }`}
                    >
                      <Shuffle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Feature Grid (2x2) */}
          <section className="mt-8 px-5">
            <SectionTitle title="Explore" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <FeatureCard
                icon={Shuffle}
                title="Random Quote"
                subtitle="Surprise me"
                gradient="bg-[linear-gradient(135deg,#EC4899,#F43F5E)]"
                onClick={handleOpenRandomModal}
              />
              <FeatureCard
                icon={Heart}
                title="Favorites"
                subtitle="My collection"
                gradient="bg-[linear-gradient(135deg,#6366F1,#8B5CF6)]"
                onClick={() => handleActionWithAd(() => navigate({ to: "/favorites" }))}
              />
              <FeatureCard
                icon={BookOpen}
                title="Categories"
                subtitle="10 sections"
                gradient="bg-[linear-gradient(135deg,#06B6D4,#0EA5E9)]"
                onClick={() => handleActionWithAd(() => navigate({ to: "/categories" }))}
              />
              <FeatureCard
                icon={Edit3}
                title="Card Creator"
                subtitle="Write affirmation"
                gradient="bg-[linear-gradient(135deg,#F59E0B,#EF4444)]"
                onClick={handleOpenCardDesigner}
              />
            </div>
          </section>

          {/* Mood-Filtered Sparks Result Section */}
          {activeMood && (
            <section id="mood-sparks-section" className="mt-8 px-5 scroll-mt-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <SectionTitle
                  title={`Sparks for feeling ${MOODS.find((m) => m.id === activeMood)?.label}`}
                />
                <button
                  onClick={() => setActiveMood(null)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Clear Filter
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {moodFilteredQuotes.length > 0 ? (
                  moodFilteredQuotes
                    .slice(0, 6)
                    .map((q) => (
                      <QuoteItemCard
                        key={q.id}
                        q={q}
                        favorited={isFavorite(q.id)}
                        onFavorite={handleFavoriteToggle}
                        onShare={handleShare}
                        onShareCard={handleShareAsImage}
                        onCopy={handleCopy}
                        onOpenDetails={handleOpenDetails}
                      />
                    ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No quotes match this mood yet.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Recently Opened Section */}
          {recentlyOpened.length > 0 && (
            <section className="mt-8 px-5 animate-fade-in">
              <SectionTitle title="Recently Opened" />
              <div role="list" className="mt-4 space-y-3">
                {recentlyOpened.map((q) => (
                  <div
                    key={q.id}
                    role="listitem"
                    onClick={() => handleOpenDetails(q)}
                    className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border hover:shadow-glow cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground select-none">
                        <History className="h-4.5 w-4.5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-foreground truncate max-w-[220px] sm:max-w-md">
                          “{q.quote}”
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          — {q.author}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Popular Categories Horizontal Shelf */}
          <section className="mt-8">
            <div className="px-5">
              <SectionTitle
                title="Popular Categories"
                action="See all"
                onActionClick={() => handleActionWithAd(() => navigate({ to: "/categories" }))}
              />
            </div>
            <div className="mt-4 flex gap-4 overflow-x-auto px-5 pb-3 scrollbar-none snap-x snap-mandatory">
              {categories.slice(0, 5).map((c) => (
                <div key={c.name} className="flex-shrink-0 w-44 snap-start">
                  <CategoryCard
                    icon={c.icon}
                    name={c.name}
                    count={c.count}
                    gradient={c.gradient}
                    compact
                    onClick={() =>
                      handleActionWithAd(() =>
                        navigate({
                          to: "/categories/$category",
                          params: { category: encodeURIComponent(c.name) },
                        }),
                      )
                    }
                  />
                </div>
              ))}
              <div className="flex-shrink-0 w-36 flex items-center justify-center snap-start">
                <button
                  onClick={() => handleActionWithAd(() => navigate({ to: "/categories" }))}
                  className="flex flex-col items-center gap-2 text-primary font-semibold transition-all hover:scale-105"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                  <span className="text-xs">Browse All</span>
                </button>
              </div>
            </div>
          </section>

          {/* Trending Quotes Section */}
          <section className="mt-8 px-5 pb-24">
            <SectionTitle title="Trending Sparks" />
            <div className="mt-4 space-y-4">
              {trendingQuotes.map((q, idx) => (
                <QuoteItemCard
                  key={q.id}
                  q={q}
                  favorited={isFavorite(q.id)}
                  onFavorite={handleFavoriteToggle}
                  onShare={handleShare}
                  onShareCard={handleShareAsImage}
                  onCopy={handleCopy}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Real-time Search Results View with Skeletons Loader and Pagination bounds */
        <section className="px-5 mt-6 pb-24 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              {isSearching ? "Searching..." : `Search Results (${searchResults.length})`}
            </h2>
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Clear
            </button>
          </div>

          {isSearching ? (
            <QuoteSkeletonList count={3} />
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {/* Suggested quick filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
                {SUGGESTED_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      handleActionWithAd(() =>
                        navigate({
                          to: "/categories/$category",
                          params: { category: encodeURIComponent(cat) },
                        }),
                      )
                    }
                    className="flex-shrink-0 text-xs font-semibold rounded-xl bg-muted border border-border px-3.5 py-1.5 transition-colors hover:bg-primary/10 hover:border-primary/20 hover:text-primary"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Render paginated list cards */}
              <div className="space-y-4">
                {paginatedSearchResults.map((q, idx) => (
                  <QuoteItemCard
                    key={q.id}
                    q={q}
                    favorited={isFavorite(q.id)}
                    onFavorite={handleFavoriteToggle}
                    onShare={handleShare}
                    onShareCard={handleShareAsImage}
                    onCopy={handleCopy}
                    onOpenDetails={handleOpenDetails}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {searchResults.length > displayLimit && (
                <button
                  onClick={handleLoadMore}
                  className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-muted border border-border/80 py-3 text-xs font-bold text-foreground hover:bg-muted/80 transition-colors"
                >
                  Load More Results <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* No search matches */}
              <div className="flex flex-col items-center justify-center py-10 text-center animate-scale-in">
                <div className="relative mb-6">
                  <div className="absolute inset-0 -z-10 rounded-full bg-brand-gradient blur-3xl opacity-20" />
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted shadow-soft">
                    <Smile className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-bold">No results found</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  We couldn't find any quotes matching "{searchQuery}".
                </p>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="rounded-3xl bg-card p-5 border border-border shadow-soft">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                      Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="divide-y divide-border/60">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => triggerSearch(s)}
                        className="flex w-full items-center gap-3 py-2.5 text-left text-sm font-semibold text-foreground/80 hover:text-primary transition-colors"
                      >
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches Grid */}
              <div className="rounded-3xl bg-card p-5 border border-border shadow-soft">
                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 select-none">
                  Trending Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => triggerSearch(tag)}
                      className="flex items-center gap-1 rounded-xl bg-muted border border-border px-3.5 py-2 text-xs font-semibold text-foreground/85 transition-colors hover:bg-primary/10 hover:border-primary/20 hover:text-primary"
                    >
                      <Search className="h-3 w-3" /> {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Adaptive Banner Slot */}
      {!searchQuery && <AdaptiveBannerAd />}

      {/* Floating Action Button */}
      <button
        onClick={handleOpenRandomModal}
        aria-label="Random quote"
        className="fixed bottom-28 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow transition-all duration-300 hover:scale-110 active:scale-90"
      >
        <Shuffle className="h-6 w-6" />
      </button>

      {/* Random Quote / Quote details Modal */}
      {showRandomModal && randomQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              setIsPlayingTts(false);
              setShowRandomModal(false);
            }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
          />

          <div className="relative w-full max-w-md overflow-y-auto max-h-[90vh] rounded-3xl bg-card border border-border p-6 shadow-glow transition-all duration-300 scale-100 animate-scale-in scrollbar-none">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3.5 py-1 text-xs font-bold select-none">
                <Sparkles className="h-3 w-3" /> Spark Quote
              </span>
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  setIsPlayingTts(false);
                  setShowRandomModal(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground active:scale-90"
                aria-label="Close modal"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="relative mt-6 min-h-[110px] flex flex-col justify-center">
              <span className="text-6xl font-serif text-primary/15 absolute -left-2 -top-6 pointer-events-none select-none">
                “
              </span>
              <div
                className={`transition-all duration-300 ${isModalShuffling ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
              >
                <p className="relative z-10 text-xl font-bold leading-relaxed text-foreground">
                  {randomQuote.quote}
                </p>
                <p className="mt-3 text-sm font-semibold text-muted-foreground">
                  — {randomQuote.author}
                </p>
                <p className="mt-1 text-xs font-semibold text-primary/80 uppercase tracking-widest select-none">
                  {randomQuote.category}
                </p>
              </div>
            </div>

            {/* Reflection Journal Section */}
            <div className="mt-5 border-t border-border/60 pt-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5 select-none">
                Personal Reflection Journal 📝
              </label>
              <textarea
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                placeholder="How does this quote apply to your life today? Write your reflection..."
                className="w-full min-h-[60px] rounded-xl border border-border bg-muted/40 p-2.5 text-xs outline-none focus:border-primary/50 resize-none font-medium leading-relaxed"
              />
              <button
                onClick={handleSaveReflection}
                className="mt-1.5 w-full rounded-xl bg-primary/10 border border-primary/20 py-2 text-xs font-bold text-primary hover:bg-primary/20 active:scale-95 transition-all"
              >
                Save Reflection
              </button>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <button
                onClick={() => handleFavoriteToggle(randomQuote)}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-90 ${
                  isFavorite(randomQuote.id)
                    ? "bg-secondary/15 text-secondary scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {isFavorite(randomQuote.id) ? (
                  <>
                    <BookmarkCheck className="h-4.5 w-4.5 fill-current" /> Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4.5 w-4.5" /> Favorite
                  </>
                )}
              </button>

              {/* Text-to-Speech Speaker Button */}
              <button
                onClick={() => handlePlayTts(randomQuote)}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-all active:scale-90 ${
                  isPlayingTts
                    ? "bg-primary text-primary-foreground animate-pulse shadow-glow"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
                aria-label={isPlayingTts ? "Stop speaking" : "Speak quote"}
              >
                {isPlayingTts ? (
                  <VolumeX className="h-4.5 w-4.5" />
                ) : (
                  <Volume2 className="h-4.5 w-4.5" />
                )}
              </button>

              <button
                onClick={() => handleShare(randomQuote.quote, randomQuote.author)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
                aria-label="Share"
              >
                <Share2 className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => handleShareAsImage(randomQuote)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
                aria-label="Share as Image Card"
              >
                <ImageIcon className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => handleCopy(randomQuote.quote)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
                aria-label="Copy"
              >
                <Copy className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={handleShuffleModalQuote}
                disabled={isModalShuffling}
                className="ml-auto inline-flex items-center gap-1.5 rounded-2xl bg-brand-gradient text-white px-4 py-2.5 text-sm font-semibold shadow-glow transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Shuffle className={`h-4 w-4 ${isModalShuffling ? "animate-spin" : ""}`} /> Shuffle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Image Generator Modal */}
      {showImageGenModal && (
        <QuoteImageGenerator
          quote={imageGenQuote}
          onClose={() => {
            setShowImageGenModal(false);
            setImageGenQuote(null);
          }}
        />
      )}

      {/* Interstitial Ad Display */}
      {showInterstitial && (
        <InterstitialAdModal
          onClose={() => {
            setShowInterstitial(false);
            if (pendingAction) {
              pendingAction();
              setPendingAction(null);
            }
          }}
        />
      )}

      {/* GDPR Consent Dialog */}
      <ConsentBanner />
    </AppShell>
  );
}
