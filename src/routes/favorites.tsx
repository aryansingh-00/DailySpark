import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, BookmarkCheck, Share2, Copy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GradientButton } from "@/components/GradientButton";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites – DailySpark" },
      { name: "description", content: "Your saved quotes and personal collection of daily motivation." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Quote copied to clipboard!", {
      className: "rounded-2xl",
    });
  };

  const handleShare = async (quoteText: string, author: string) => {
    const textToShare = `“${quoteText}” — ${author} (via DailySpark)`;
    if (navigator.share) {
      try {
        await navigator.share({
          text: textToShare,
          title: "DailySpark Quote",
        });
      } catch (err) {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(textToShare);
      toast.success("Quote copied for sharing!", {
        className: "rounded-2xl",
      });
    }
  };

  return (
    <AppShell>
      <header className="px-5 pt-8">
        <p className="text-sm text-muted-foreground">Your collection</p>
        <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
      </header>

      {favorites.length > 0 ? (
        <section className="mt-6 px-5 space-y-4 pb-8">
          {favorites.map((q, idx) => (
            <div
              key={q.id}
              style={{ animationDelay: `${idx * 50}ms` }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-card p-6 shadow-soft ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-glow animate-fade-in-up"
            >
              <div className="relative">
                <span className="text-5xl font-serif text-primary/10 absolute -left-2 -top-4 pointer-events-none">
                  “
                </span>
                <p className="relative z-10 text-base font-medium leading-relaxed text-foreground">
                  {q.quote}
                </p>
                <p className="mt-3 text-sm text-muted-foreground font-medium">— {q.author}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {q.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleFavorite(q)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary scale-105 transition-all hover:bg-secondary/25"
                    aria-label="Remove from Favorites"
                  >
                    <BookmarkCheck className="h-4.5 w-4.5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleShare(q.quote, q.author)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground"
                    aria-label="Share"
                  >
                    <Share2 className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(q.quote)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground"
                    aria-label="Copy"
                  >
                    <Copy className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="mt-16 flex flex-col items-center justify-center px-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full bg-brand-gradient blur-3xl opacity-30" />
            <div className="flex h-36 w-36 items-center justify-center rounded-[2.5rem] bg-brand-gradient shadow-glow">
              <Heart className="h-16 w-16 text-white animate-pulse" strokeWidth={2.2} />
            </div>
          </div>
          <h2 className="mt-8 text-xl font-bold">No favorites yet</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Tap the bookmark on any quote to save it here. Your personal spark, always within reach.
          </p>
          <Link to="/" className="mt-6">
            <GradientButton>Discover quotes</GradientButton>
          </Link>
        </section>
      )}
    </AppShell>
  );
}
