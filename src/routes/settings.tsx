import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Moon,
  Bell,
  Star,
  Shield,
  Info,
  Share2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings – DailySpark" },
      { name: "description", content: "Customize your DailySpark experience: dark mode, notifications, and more." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDark(localStorage.getItem("ds-dark") === "1");
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ds-dark", next ? "1" : "0");
  };

  return (
    <AppShell>
      <header className="px-5 pt-8">
        <p className="text-sm text-muted-foreground">Preferences</p>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </header>

      {/* Profile-style card */}
      <section className="mt-6 px-5">
        <div className="flex items-center gap-4 rounded-3xl bg-brand-gradient p-5 text-white shadow-glow">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <div className="text-base font-semibold">DailySpark</div>
            <div className="text-xs text-white/85">Version 1.0.0 · Stage 1</div>
          </div>
        </div>
      </section>

      {/* Preferences group */}
      <section className="mt-6 px-5">
        <Group title="General">
          <Row
            icon={<Moon className="h-5 w-5" />}
            label="Dark mode"
            tint="bg-indigo-500"
            trailing={<Toggle checked={dark} onChange={toggleDark} />}
          />
          <Row
            icon={<Bell className="h-5 w-5" />}
            label="Notifications"
            tint="bg-pink-500"
            trailing={
              <Toggle
                checked={notifications}
                onChange={() => setNotifications((v) => !v)}
              />
            }
          />
        </Group>

        <Group title="Support" className="mt-5">
          <Row
            icon={<Star className="h-5 w-5" />}
            label="Rate the app"
            tint="bg-amber-500"
            trailing={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
          />
          <Row
            icon={<Share2 className="h-5 w-5" />}
            label="Share app"
            tint="bg-cyan-500"
            trailing={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
          />
          <Row
            icon={<Shield className="h-5 w-5" />}
            label="Privacy policy"
            tint="bg-emerald-500"
            trailing={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
          />
          <Row
            icon={<Info className="h-5 w-5" />}
            label="About"
            tint="bg-fuchsia-500"
            trailing={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
          />
        </Group>
      </section>
    </AppShell>
  );
}

function Group({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-border">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  tint,
  trailing,
}: {
  icon: ReactNode;
  label: string;
  tint: string;
  trailing: ReactNode;
}) {
  return (
    <button className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/60">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${tint}`}
      >
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {trailing}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full transition-colors ${
        checked ? "bg-brand-gradient" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-soft transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
