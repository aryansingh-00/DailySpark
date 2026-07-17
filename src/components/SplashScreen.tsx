import { useEffect, useState } from "react";
import { AppLogo } from "./AppLogo";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), 2100);
    const doneTimer = setTimeout(() => onDone(), 2500);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-gradient transition-opacity duration-500 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-5 text-white">
        <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/15 shadow-glow backdrop-blur-md animate-scale-in">
          <AppLogo size={72} />
        </div>

        <div className="text-center animate-fade-in [animation-delay:200ms] [animation-fill-mode:both]">
          <div className="text-4xl font-bold tracking-tight">DailySpark</div>
          <div className="mt-2 text-sm font-medium text-white/85">
            Daily Motivation &amp; Quotes
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 flex gap-1.5 animate-fade-in [animation-delay:600ms] [animation-fill-mode:both]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-white/80"
            style={{
              animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
