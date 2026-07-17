import React, { useState, useEffect } from "react";
import { ShieldAlert, Info, X } from "lucide-react";
import { adService } from "../services/adService";
import { toast } from "sonner";

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent decision has already been saved
    const hasConsent = adService.hasConsent();
    setIsVisible(!hasConsent);
  }, []);

  const handleConsent = (type: "all" | "non-personalized" | "declined") => {
    adService.setConsent(type);
    setIsVisible(false);
    
    if (type === "all") {
      toast.success("Ad Preferences Saved!", {
        description: "Personalized recommendations enabled.",
        className: "rounded-2xl",
      });
    } else if (type === "non-personalized") {
      toast.success("Ad Preferences Saved!", {
        description: "Non-personalized recommendations only.",
        className: "rounded-2xl",
      });
    } else {
      toast.info("Ads restricted.", {
        description: "You won't see any ads in the app.",
        className: "rounded-2xl",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 animate-fade-in-up">
      <div className="mx-auto max-w-md rounded-3xl bg-card border border-border p-5 shadow-glow ring-1 ring-border/50">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">We value your privacy</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              DailySpark uses mock telemetry and cookies to personalize your quotes feed and manage free advertisements. Select your preference below.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            onClick={() => handleConsent("all")}
            className="rounded-2xl bg-brand-gradient py-3 text-xs font-bold text-white shadow-soft transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Accept Personalized Ads
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleConsent("non-personalized")}
              className="flex-1 rounded-2xl bg-muted border border-border py-2.5 text-xs font-semibold text-foreground/80 hover:bg-muted/80 transition-colors"
            >
              Non-Personalized
            </button>
            <button
              onClick={() => handleConsent("declined")}
              className="flex-1 rounded-2xl bg-muted border border-border py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Decline Ads
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-widest">
          <Info className="h-3 w-3" /> GDPR & UMP Compliant
        </div>
      </div>
    </div>
  );
}
