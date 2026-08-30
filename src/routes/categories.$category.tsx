import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect, memo } from "react";
import {
  ArrowLeft,
  Search,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  SlidersHorizontal,
  Lock,
  Play,
  Volume2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SearchBar } from "@/components/SearchBar";
import { quoteService, CATEGORY_META, categoryIconMap } from "@/services/quoteService";
import { useFavorites } from "@/hooks/useFavorites";
import { useUserStats } from "@/hooks/useUserStats";
import { useThemeColor } from "@/hooks/useThemeColor";
import { QuoteImageGenerator } from "@/components/QuoteImageGenerator";
import { QuoteSkeletonList } from "@/components/QuoteSkeleton";
import { adService } from "@/services/adService";
import { AdaptiveBannerAd, InterstitialAdModal, RewardedAdModal } from "@/components/AdComponents";
import { toast } from "sonner";
import type { Quote } from "@/models/quote";
import { nativeShare, nativeCopy } from "@/utils/nativeActions";

const getCleanCategoryName = (raw: string) => {
  if (!raw) return "";
  try {
    let decoded = raw;
    while (decoded.includes("%")) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
    return decoded;
  } catch {
    return raw;
  }
};

export const Route = createFileRoute("/categories/$category")({
  head: ({ params }) => {
    const category = getCleanCategoryName(params.category);
    return {
      meta: [
        { title: `${category} Quotes – DailySpark` },
        { name: "description", content: `Inspirational and motivational quotes about ${category}.` },
      ],
    };
  },
  component: CategoryDetailPage,
});

type SortType = "newest" | "oldest" | "alphabetical";

// Optimized Quote Card Component (React.memo)
const QuoteListCard = memo(({ 
  q, 
  favorited, 
  onFavorite, 
  onShare, 
  onShareCard, 
  onCopy, 
  onOpenDetails 
}: {
  q: Quote;
  favorited: boolean;
  onFavorite: (q: Quote) => void;
  onShare: (text: string, auth: string) => void;
  onShareCard: (q: Quote) => void;
  onCopy: (text: string) => void;
  onOpenDetails: () => void;
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
          onClick={onOpenDetails}
          className="relative z-10 text-base font-semibold leading-relaxed text-foreground cursor-pointer hover:text-primary transition-colors focus:outline-none focus:text-primary"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpenDetails();
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
            onClick={() => onShareCard(q)}
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
});
QuoteListCard.displayName = "QuoteListCard";

function CategoryDetailPage() {
  const { category: encodedCategory } = Route.useParams();
  const category = getCleanCategoryName(encodedCategory);
  const navigate = useNavigate();

  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { incrementMetric, addCategoryExplored } = useUserStats();
  const { applyTheme, themeIndex } = useThemeColor();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  // Quote detail modal states
  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number | null>(null);
  const [showImageGenModal, setShowImageGenModal] = useState(false);

  // Monetization states
  const [isLocked, setIsLocked] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  // Interstitial states
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Shimmer Search state (Stage 6 UX)
  const [isSearching, setIsSearching] = useState(false);

  // Pagination bounds (60 FPS Performance)
  const [displayLimit, setDisplayLimit] = useState(10);

  const meta = CATEGORY_META[category as keyof typeof CATEGORY_META] || {
    iconName: "Flame",
    gradient: "bg-brand-gradient",
  };
  const Icon = categoryIconMap[meta.iconName as keyof typeof categoryIconMap] || categoryIconMap.Flame;

  // Check premium category status
  useEffect(() => {
    applyTheme(themeIndex);

    const checkPremiumStatus = () => {
      const isPremiumCategory = category === "Discipline" || category === "Self Growth";
      const unlocked = adService.isPremiumUnlocked();
      setPremiumUnlocked(unlocked);
      setIsLocked(isPremiumCategory && !unlocked && !adService.isOffline());
    };

    checkPremiumStatus();
    addCategoryExplored(category, favorites.length);

    // Subscribe to ad status changes
    return adService.subscribe(checkPremiumStatus);
  }, [category]);

  const quotes = useMemo(() => {
    return quoteService.getQuotesByCategory(category);
  }, [category]);

  // Real-time filtering and sorting
  const processedQuotes = useMemo(() => {
    if (isLocked) return [];
    let list = [...quotes];
    
    // 1. Filter
    if (searchQuery) {
      const cleanQuery = searchQuery.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.quote.toLowerCase().includes(cleanQuery) ||
          q.author.toLowerCase().includes(cleanQuery)
      );
    }

    // 2. Sort
    if (sortBy === "newest") {
      list.sort((a, b) => b.id - a.id);
    } else if (sortBy === "oldest") {
      list.sort((a, b) => a.id - b.id);
    } else if (sortBy === "alphabetical") {
      list.sort((a, b) => a.quote.localeCompare(b.quote));
    }

    return list;
  }, [quotes, searchQuery, sortBy, isLocked]);

  // Paginated list
  const paginatedQuotes = useMemo(() => {
    return processedQuotes.slice(0, displayLimit);
  }, [processedQuotes, displayLimit]);

  // Vibrate Haptic Buzz
  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Action checker for interstitials
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

  const handleCopy = async (text: string) => {
    triggerHaptic();
    await nativeCopy(text);
    incrementMetric("copy", favorites.length);
    toast.success("Quote copied to clipboard!", {
      className: "rounded-2xl",
    });
  };

  const handleShare = async (quoteText: string, author: string) => {
    triggerHaptic();
    const textToShare = `“${quoteText}” — ${author} (via DailySpark)`;
    incrementMetric("share", favorites.length);
    await nativeShare(textToShare);
  };


  const logReadQuote = (quote: Quote) => {
    incrementMetric("read", favorites.length);

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ds-recently-opened");
      let list: Quote[] = [];
      if (saved) {
        list = JSON.parse(saved);
      }
      const filtered = list.filter((q) => q.id !== quote.id);
      const updated = [quote, ...filtered].slice(0, 3);
      localStorage.setItem("ds-recently-opened", JSON.stringify(updated));
    }
  };

  const openQuoteDetail = (index: number) => {
    handleActionWithAd(() => {
      setActiveQuoteIndex(index);
      logReadQuote(processedQuotes[index]);
    });
  };

  const nextQuote = () => {
    if (activeQuoteIndex === null || activeQuoteIndex >= processedQuotes.length - 1) return;
    triggerHaptic();
    const nextIdx = activeQuoteIndex + 1;
    setActiveQuoteIndex(nextIdx);
    logReadQuote(processedQuotes[nextIdx]);
  };

  const prevQuote = () => {
    if (activeQuoteIndex === null || activeQuoteIndex <= 0) return;
    triggerHaptic();
    const prevIdx = activeQuoteIndex - 1;
    setActiveQuoteIndex(prevIdx);
    logReadQuote(processedQuotes[prevIdx]);
  };

  const handleSearchChange = (val: string) => {
    setDisplayLimit(10); // reset limit
    setSearchQuery(val);
    if (!val) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(() => {
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timeout);
  };

  const handleLoadMore = () => {
    triggerHaptic();
    setDisplayLimit((prev) => prev + 10);
  };

  const activeQuote = activeQuoteIndex !== null ? processedQuotes[activeQuoteIndex] : null;

  return (
    <AppShell>
      {/* Banner Header */}
      <div className={`relative overflow-hidden pb-12 pt-8 text-white ${meta.gradient}`}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative px-5">
          <button
            onClick={() => navigate({ to: "/categories" })}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md transition-colors hover:bg-white/30"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Category</p>
              <h1 className="text-3xl font-bold tracking-tight mt-1">{category}</h1>
              <p className="text-xs text-white/70 mt-1">{quotes.length} premium quotes</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md shadow-inner">
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {isLocked ? (
        <section className="px-5 mt-16 flex flex-col items-center justify-center text-center animate-scale-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-orange-500 blur-3xl opacity-30 animate-pulse" />
            <div className="flex h-36 w-36 items-center justify-center rounded-[2.5rem] bg-brand-gradient shadow-glow">
              <Lock className="h-16 w-16 text-white animate-bounce" strokeWidth={2.4} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">Premium Category Locked</h2>
          <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-muted-foreground font-medium">
            "{category}" quotes are reserved for premium members. Watch a quick 10-second video ad to unlock all premium categories for this session!
          </p>

          <button
            onClick={() => setShowRewardedAd(true)}
            className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-6 py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="h-4 w-4 fill-current" /> Watch Video to Unlock
          </button>
        </section>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="px-5 mt-6 flex gap-2">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={`Search in ${category}…`}
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFiltersDropdown((v) => !v)}
                className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl bg-card border border-border text-foreground shadow-soft transition-colors hover:bg-muted active:scale-95"
                aria-label="Filter & Sort"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>

              {/* Sort Dropdown */}
              {showFiltersDropdown && (
                <div className="absolute right-0 top-[58px] z-30 w-44 rounded-2xl bg-card border border-border p-2.5 shadow-glow animate-scale-in">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2.5 py-1">Sort Quotes</span>
                  <div className="mt-1.5 space-y-1">
                    {(["newest", "oldest", "alphabetical"] as SortType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSortBy(type);
                          setShowFiltersDropdown(false);
                        }}
                        className={`flex w-full items-center rounded-xl px-2.5 py-2 text-xs font-semibold capitalize transition-colors ${
                          sortBy === type
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-muted"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Listing with Shimmer search loaders and pagination limits */}
          <section className="px-5 mt-6 space-y-4 pb-8">
            {isSearching ? (
              <QuoteSkeletonList count={3} />
            ) : processedQuotes.length > 0 ? (
              <div className="space-y-4">
                {paginatedQuotes.map((q, idx) => (
                  <QuoteListCard
                    key={q.id}
                    q={q}
                    favorited={isFavorite(q.id)}
                    onFavorite={handleFavoriteToggle}
                    onShare={handleShare}
                    onShareCard={(quote) => {
                      setActiveQuoteIndex(idx);
                      setShowImageGenModal(true);
                    }}
                    onCopy={handleCopy}
                    onOpenDetails={() => openQuoteDetail(idx)}
                  />
                ))}

                {processedQuotes.length > displayLimit && (
                  <button
                    onClick={handleLoadMore}
                    className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-muted border border-border/80 py-3 text-xs font-bold text-foreground hover:bg-muted/80 transition-colors"
                  >
                    Load More Quotes <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-scale-in">
                <div className="relative mb-6">
                  <div className="absolute inset-0 -z-10 rounded-full bg-brand-gradient blur-3xl opacity-20" />
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted shadow-soft">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-bold">No quotes found</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                  No quotes match your criteria. Try adjusting filters or typing something else.
                </p>
              </div>
            )}
          </section>

          <AdaptiveBannerAd />
        </>
      )}

      {/* Quote Detail Modal */}
      {activeQuoteIndex !== null && activeQuote && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            onClick={() => setActiveQuoteIndex(null)}
            className="absolute inset-0 bg-background/80 backdrop-blur-md animate-fade-in"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-glow animate-scale-in flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>10s reflection</span>
              </div>
              <button
                onClick={() => setActiveQuoteIndex(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground active:scale-90"
                aria-label="Close details"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 select-none">
                <span>Reading Progress</span>
                <span>{activeQuoteIndex + 1} of {processedQuotes.length}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  style={{ width: `${((activeQuoteIndex + 1) / processedQuotes.length) * 100}%` }}
                  className="h-full rounded-full bg-brand-gradient transition-all duration-300"
                />
              </div>
            </div>

            <div className="relative mt-8 min-h-[160px] flex flex-col justify-center">
              <span className="text-7xl font-serif text-primary/15 absolute -left-2 -top-8 pointer-events-none select-none">
                “
              </span>
              <div className="relative z-10">
                <p className="text-xl font-bold leading-relaxed text-foreground">
                  {activeQuote.quote}
                </p>
                <p className="mt-4 text-sm font-semibold text-muted-foreground font-medium">— {activeQuote.author}</p>
                <span className="mt-2.5 inline-block rounded-full bg-primary/10 text-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider select-none">
                  {activeQuote.category}
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
              <div className="flex gap-2">
                <button
                  onClick={prevQuote}
                  disabled={activeQuoteIndex === 0}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground disabled:opacity-40 active:scale-95"
                  aria-label="Previous quote"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextQuote}
                  disabled={activeQuoteIndex === processedQuotes.length - 1}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground disabled:opacity-40 active:scale-95"
                  aria-label="Next quote"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleFavoriteToggle(activeQuote)}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all active:scale-90 ${
                    isFavorite(activeQuote.id)
                      ? "bg-secondary/15 text-secondary scale-105"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                  aria-label="Favorite quote"
                >
                  {isFavorite(activeQuote.id) ? (
                    <BookmarkCheck className="h-5 w-5 fill-current" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => handleShare(activeQuote.quote, activeQuote.author)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
                  aria-label="Share quote"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowImageGenModal(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground animate-pulse active:scale-90"
                  aria-label="Share as Image Card"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleCopy(activeQuote.quote)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
                  aria-label="Copy quote text"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Card generator modal */}
      {showImageGenModal && activeQuote && (
        <QuoteImageGenerator
          quote={activeQuote}
          onClose={() => setShowImageGenModal(false)}
        />
      )}

      {/* Rewarded Ad Display */}
      {showRewardedAd && (
        <RewardedAdModal
          onClose={() => setShowRewardedAd(false)}
          onRewardEarned={() => {
            adService.unlockPremium();
            setIsLocked(false);
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
    </AppShell>
  );
}
