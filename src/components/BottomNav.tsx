import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 pt-2 pointer-events-none">
      <div className="pointer-events-auto flex w-full max-w-md items-center justify-between rounded-3xl bg-card/90 p-2 shadow-glow ring-1 ring-border backdrop-blur-lg">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-all",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute inset-0 -z-10 rounded-2xl bg-brand-gradient shadow-soft animate-scale-in" />
              )}
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
