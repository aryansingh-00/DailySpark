import React, { useState } from "react";
import { X, Shield, BookOpen, Heart, Award, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";

interface LegalModalProps {
  type: "privacy" | "terms" | "licenses" | "about";
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  const renderContent = () => {
    switch (type) {
      case "privacy":
        return (
          <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <h3 className="text-sm font-bold text-foreground">Privacy Policy</h3>
            <p><strong>Effective Date: August 26, 2026</strong></p>
            <p>
              DailySpark operates as a local-first application. All of your personal app data—including saved favorite quotes, custom created quote designs, streak progress, and daily achievements—is stored strictly on your local device.
            </p>
            <h4 className="text-xs font-bold text-foreground">Google AdMob Advertisements</h4>
            <p>
              To support app development and keep DailySpark free, we integrate Google AdMob (Google LLC) to display advertisements. AdMob and its advertising partners may collect device identifiers (such as the Android Advertising ID), IP address, and app performance metrics to serve ads.
            </p>
            <p>
              You can manage your ad consent and personalization choices inside the app settings or via your Android device Google Settings (Settings &gt; Google &gt; Ads).
            </p>
            <h4 className="text-xs font-bold text-foreground">Third-Party Privacy Links</h4>
            <p>
              For more information on how Google collects and processes advertising data, please review the <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-primary underline">Google Privacy Policy</a>.
            </p>
          </div>
        );
      case "terms":
        return (
          <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <h3 className="text-sm font-bold text-foreground">Terms & Conditions</h3>
            <p><strong>Last Updated: August 26, 2026</strong></p>
            <p>
              By downloading or using DailySpark, these terms automatically apply to you. You are granted a personal, non-exclusive, non-transferable license to use DailySpark for personal motivation and quote creation.
            </p>
            <h4 className="text-xs font-bold text-foreground">Usage & Modifications</h4>
            <p>
              You are not permitted to reverse engineer, decompile, or extract the app source code, trademarks, or proprietary branding.
            </p>
            <h4 className="text-xs font-bold text-foreground">Admob & Third-Party Content</h4>
            <p>
              DailySpark displays sponsored content provided by Google AdMob. DailySpark does not endorse third-party products advertised within third-party banner or interstitial ad placements.
            </p>
          </div>
        );
      case "licenses":
        const packages = [
          { name: "React", version: "19.2.0", license: "MIT License" },
          { name: "Vite", version: "8.0.16", license: "MIT License" },
          { name: "TanStack Router", version: "1.170.16", license: "MIT License" },
          { name: "Tailwind CSS", version: "4.2.1", license: "MIT License" },
          { name: "Lucide React", version: "0.575.0", license: "ISC License" },
          { name: "Recharts", version: "2.15.4", license: "MIT License" },
          { name: "Sonner", version: "2.0.7", license: "MIT License" },
        ];
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Open Source Licenses</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              DailySpark is powered by open source software. We are grateful to developers worldwide for sharing these tools:
            </p>
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1">
              {packages.map((pkg) => (
                <div key={pkg.name} className="rounded-xl bg-muted/40 border border-border p-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-foreground">{pkg.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Version {pkg.version}</div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    {pkg.license}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case "about":
        return (
          <div className="space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-gradient text-white shadow-glow mx-auto mb-4">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground">DailySpark – Quotes & Motivation</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Version 1.2.0 (Stable Release)</p>
            
            <div className="border-t border-border mt-6 pt-4 text-left space-y-3 text-xs text-muted-foreground">
              <div>
                <strong>Developer:</strong> Aryan & team (Senior Architects)
              </div>
              <div>
                <strong>Inspiration:</strong> A completely local, offline-first dashboard dedicated to inspiring personal growth and daily streak discipline.
              </div>
              <div>
                <strong>Store Release:</strong> Google Play Store ready build format.
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (type) {
      case "privacy": return "Privacy Policy";
      case "terms": return "Terms & Conditions";
      case "licenses": return "Software Credits";
      case "about": return "About DailySpark";
      default: return "Information";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-background/80 backdrop-blur-md animate-fade-in" />
      
      {/* Content Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-glow animate-scale-in max-h-[90vh] flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            {type === "privacy" && <Shield className="h-4.5 w-4.5 text-primary" />}
            {type === "terms" && <BookOpen className="h-4.5 w-4.5 text-secondary" />}
            {type === "licenses" && <Award className="h-4.5 w-4.5 text-accent-foreground" />}
            {type === "about" && <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />}
            {getHeaderTitle()}
          </span>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {renderContent()}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          Accept & Close
        </button>
      </div>
    </div>
  );
}

// 2. Interactive Rating Modal
interface RatingModalProps {
  onClose: () => void;
}

export function RatingModal({ onClose }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a star rating first.");
      return;
    }
    setIsSubmitted(true);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("ds-app-rated", "1");
    }

    setTimeout(() => {
      toast.success("Thank you for your rating! ⭐", {
        description: `You rated us ${rating} stars. We appreciate your support!`,
        className: "rounded-2xl",
      });
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-background/80 backdrop-blur-md animate-fade-in" />

      {/* Content Container */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-glow text-center scale-100 animate-scale-in min-h-[300px] flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500 animate-pulse" /> Rate DailySpark
          </span>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="my-8 flex flex-col items-center justify-center flex-1 animate-scale-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-soft mb-4">
              <Heart className="h-9 w-9 animate-pulse fill-current" />
            </div>
            <h3 className="text-base font-bold text-foreground">Feedback Submitted!</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              Thank you for sharing your feedback. We are constantly improving your DailySpark experience!
            </p>
          </div>
        ) : (
          <div className="my-6 flex flex-col items-center flex-1">
            <h3 className="text-base font-bold text-foreground">Enjoying DailySpark?</h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-xs">
              Tap a star to rate us on the Store. Your feedback helps us write more daily motivation!
            </p>

            {/* Stars Selector Row */}
            <div className="flex items-center gap-2 mt-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform active:scale-95 duration-200"
                  aria-label={`Rate ${star} Stars`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      (hoverRating || rating) >= star
                        ? "text-amber-500 fill-amber-500 scale-110"
                        : "text-muted-foreground/30"
                    } transition-colors duration-150`}
                  />
                </button>
              ))}
            </div>

            {/* Mock Comments */}
            {rating > 0 && (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you like or what we can improve..."
                className="mt-6 w-full rounded-2xl border border-border bg-card p-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[60px]"
              />
            )}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {!isSubmitted && (
            <>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-muted border border-border py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-brand-gradient py-2.5 text-xs font-bold text-white shadow-soft transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Submit Review
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
