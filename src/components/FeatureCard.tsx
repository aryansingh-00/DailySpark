import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  gradient,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradient: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-3xl bg-card p-5 text-left shadow-soft ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary/45"
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-soft",
          gradient,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-gradient-soft opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}
