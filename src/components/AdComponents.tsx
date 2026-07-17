import React, { useState, useEffect } from "react";
import { X, Volume2, VolumeX, Award, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";
import { adService } from "../services/adService";
import { toast } from "sonner";

// 1. Adaptive Banner Ad Component
export function AdaptiveBannerAd() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkAdStatus = () => {
      // Hide banner if offline or premium is unlocked or declined ads
      const offline = adService.isOffline();
      const premium = adService.isPremiumUnlocked();
      const consentType = adService.getConsentType();
      setShouldRender(!offline && !premium && consentType !== "declined");
    };

    checkAdStatus();
    // Subscribe to adService updates
    return adService.subscribe(checkAdStatus);
  }, []);

  if (!shouldRender) return null;

  return (
    <div className="mx-auto my-3 w-full max-w-md px-5 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-3 flex items-center justify-between shadow-soft ring-1 ring-border/20">
        <span className="absolute left-2.5 top-2 rounded bg-muted-foreground/15 px-1.5 py-0.5 text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
          Ad
        </span>
        <div className="flex-1 flex items-center gap-3 pl-8 pr-2">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-foreground">SparkFitness – Peak Workouts</div>
            <div className="text-[9px] text-muted-foreground truncate">Build discipline offline. Download now!</div>
          </div>
        </div>
        <button
          onClick={() =>
            toast.info("Sponsored AdMob placement demo. Keep the app free!", {
              className: "rounded-2xl",
            })
          }
          className="rounded-xl bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground shadow-soft transition-transform hover:scale-105 active:scale-95"
        >
          Install
        </button>
      </div>
    </div>
  );
}

// 2. Interstitial Ad Modal Component
interface InterstitialAdModalProps {
  onClose: () => void;
}

export function InterstitialAdModal({ onClose }: InterstitialAdModalProps) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanClose(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

      {/* Main Container */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-glow text-center scale-100 animate-scale-in flex flex-col justify-between min-h-[380px]">
        {/* Top bar */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="rounded bg-muted-foreground/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
            Sponsored Ad
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {canClose ? "Completed" : `Close in ${timeLeft}s`}
          </span>
        </div>

        {/* Ad Contents */}
        <div className="my-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-brand-gradient blur-2xl opacity-20 animate-pulse" />
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-gradient text-white shadow-glow">
              <Sparkles className="h-12 w-12 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground">DailySpark Premium</h3>
          <p className="mt-2 text-xs text-muted-foreground max-w-xs">
            Unlock all categories persistently, customize infinite color cards, and enjoy a completely ad-free experience.
          </p>
        </div>

        {/* Bottom bar / Button */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onClose}
            disabled={!canClose}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
          >
            {canClose ? (
              <>
                Continue to App <X className="h-4.5 w-4.5" />
              </>
            ) : (
              `Please wait... ${timeLeft}s`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. Rewarded Ad Modal Component
interface RewardedAdModalProps {
  onClose: () => void;
  onRewardEarned: () => void;
}

export function RewardedAdModal({ onClose, onRewardEarned }: RewardedAdModalProps) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsCompleted(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleClaimReward = () => {
    adService.unlockPremium();
    onRewardEarned();
    toast.success("Premium Category Unlocked! 🎉", {
      description: "You now have full access to all quotes.",
      className: "rounded-2xl",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

      {/* Main Container */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-glow text-center scale-100 animate-scale-in flex flex-col justify-between min-h-[420px]">
        {/* Top bar */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1 text-[10px] font-bold text-secondary uppercase tracking-wider">
            <Award className="h-3.5 w-3.5" /> Rewarded Ad
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            {!isCompleted && (
              <span className="text-xs font-semibold text-muted-foreground">
                {timeLeft}s remaining
              </span>
            )}
          </div>
        </div>

        {/* Video Mock/Animation */}
        <div className="my-6 flex flex-col items-center justify-center flex-1">
          {isCompleted ? (
            <div className="flex flex-col items-center animate-scale-in">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-soft mb-4">
                <Award className="h-10 w-10 animate-bounce" strokeWidth={2.4} />
              </div>
              <h3 className="text-lg font-bold text-foreground">Reward Unlocked!</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Claim your reward to unlock premium categories.
              </p>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              {/* Circular progress loader */}
              <svg className="h-28 w-28 -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-muted fill-transparent"
                  strokeWidth="6"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-primary fill-transparent transition-all duration-1000"
                  strokeWidth="6"
                  strokeDasharray={301.6}
                  strokeDashoffset={301.6 - (301.6 * (10 - timeLeft)) / 10}
                />
              </svg>
              <div className="absolute flex h-20 w-20 flex-col items-center justify-center rounded-full bg-muted/60 text-center font-bold">
                <span className="text-xl text-primary">{timeLeft}s</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Watching</span>
              </div>
            </div>
          )}

          <div className="mt-6 text-xs font-semibold text-foreground">
            {isCompleted
              ? "Watch completed! You earned your reward."
              : "Watching ad to unlock Discipline & Self Growth packs..."}
          </div>
        </div>

        {/* Button Bar */}
        <div className="flex gap-2">
          {isCompleted ? (
            <button
              onClick={handleClaimReward}
              className="flex-1 rounded-2xl bg-brand-gradient py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Claim Premium Reward
            </button>
          ) : (
            <button
              onClick={() => {
                toast.warning("Watching ad is required to unlock premium categories.");
                onClose();
              }}
              className="flex-1 rounded-2xl bg-muted border border-border py-3.5 text-sm font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel Ad
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
