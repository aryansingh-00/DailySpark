import type { ReactNode } from "react";
import { useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { ZenSoundscapes } from "./ZenSoundscapes";
import { notificationService } from "@/services/notificationService";

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const stop = notificationService.startScheduler();
    return () => {
      if (stop) stop();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background pb-28">
      {children}
      <ZenSoundscapes />
      <BottomNav />
    </div>
  );
}
