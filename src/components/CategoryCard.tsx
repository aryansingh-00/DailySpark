import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryCard({
  icon: Icon,
  name,
  count,
  gradient,
  compact = false,
  onClick,
}: {
  icon: LucideIcon;
  name: string;
  count: number;
  gradient: string;
  compact?: boolean;
  onClick?: () => void;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col justify-between overflow-hidden rounded-3xl p-5 text-left text-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary/45 cursor-pointer",
        compact ? "min-h-[120px]" : "min-h-[160px]",
        gradient,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-base font-semibold leading-tight">{name}</div>
        <div className="text-xs text-white/80">{count} quotes</div>
      </div>
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
    </Component>
  );
}
