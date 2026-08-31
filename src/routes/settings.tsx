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
  Sun,
  Clock,
  Send,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { nativeShare } from "@/utils/nativeActions";
import { LegalModal, RatingModal } from "@/components/LegalViews";
import { notificationService } from "@/services/notificationService";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings – DailySpark" },
      { name: "description", content: "Customize your DailySpark experience: dark mode, notifications, and more." },
    ],
  }),
  component: SettingsPage,
});

type ModalType = "privacy" | "about" | "rating" | null;

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [morning, setMorning] = useState(true);
  const [evening, setEvening] = useState(true);
  const [customTime, setCustomTime] = useState("08:00");
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDark(localStorage.getItem("ds-dark") === "1");
      setNotifications(notificationService.getPreference("enabled") as boolean);
      setMorning(notificationService.getPreference("morning") as boolean);
      setEvening(notificationService.getPreference("evening") as boolean);
      setCustomTime((notificationService.getPreference("customTime") as string) || "08:00");
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ds-dark", next ? "1" : "0");
  };

  const toggleNotifications = async () => {
    const next = !notifications;
    if (next) {
      const perm = await notificationService.requestPermission();
      if (perm === "denied") {
        toast.error("Permission Denied", {
          description: "Please allow notifications in system settings.",
        });
        return;
      }
    }
    setNotifications(next);
    notificationService.setPreference("enabled", next);
    toast.success(next ? "Notifications Enabled" : "Notifications Disabled");
  };

  const toggleMorning = (val: boolean) => {
    setMorning(val);
    notificationService.setPreference("morning", val);
  };

  const toggleEvening = (val: boolean) => {
    setEvening(val);
    notificationService.setPreference("evening", val);
  };

  const handleCustomTimeChange = (time: string) => {
    setCustomTime(time);
    notificationService.setPreference("customTime", time);
  };

  const handleTestNotification = async () => {
    const perm = await notificationService.requestPermission();
    if (perm !== "granted") {
      toast.error("Notification permission required", {
        description: "Please enable notifications for DailySpark in your device settings.",
      });
      return;
    }
    try {
      notificationService.sendTestNotification();
      toast.success("Test Spark Sent!", {
        description: "Check your device notification center.",
      });
    } catch {
      toast.error("Failed to send notification");
    }
  };

  const handleShareApp = async () => {
    await nativeShare(
      "Check out DailySpark to get your daily motivation! https://dailyspark.app",
      "DailySpark App"
    );
  };

  return (
    <AppShell>
      <header className="px-5 pt-8">
        <p className="text-sm text-muted-foreground">Preferences</p>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </header>

      <section className="mt-6 px-5">
        <div className="flex items-center gap-4 rounded-3xl bg-brand-gradient p-5 text-white shadow-glow">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <div className="text-base font-semibold">DailySpark</div>
            <div className="text-xs text-white/85">Version 1.0.8 · Optimization Active</div>
          </div>
        </div>
      </section>

      <section className="mt-6 px-5 pb-24">
        <Group title="General">
          <Row
            icon={<Moon className="h-5 w-5" />}
            label="Dark mode"
            tint="bg-indigo-500"
            trailing={<Toggle checked={dark} onChange={toggleDark} />}
            onClick={toggleDark}
          />
        </Group>

        <Group title="Daily Spark Reminders" className="mt-5">
          <Row
            icon={<Bell className="h-5 w-5" />}
            label="Daily Notifications"
            tint="bg-pink-500"
            trailing={<Toggle checked={notifications} onChange={toggleNotifications} />}
            onClick={toggleNotifications}
          />
          {notifications && (
            <>
              <Row
                icon={<Sun className="h-5 w-5" />}
                label="Morning Spark (8:00 AM)"
                tint="bg-amber-500"
                trailing={<Toggle checked={morning} onChange={() => toggleMorning(!morning)} />}
                onClick={() => toggleMorning(!morning)}
              />
              <Row
                icon={<Moon className="h-5 w-5" />}
                label="Evening Reflection (8:00 PM)"
                tint="bg-purple-500"
                trailing={<Toggle checked={evening} onChange={() => toggleEvening(!evening)} />}
                onClick={() => toggleEvening(!evening)}
              />
              <div className="flex items-center justify-between px-4 py-3.5 bg-card">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white bg-cyan-500">
                    <Clock className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium">Custom Daily Time</span>
                </div>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => handleCustomTimeChange(e.target.value)}
                  className="rounded-xl border border-border bg-muted px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Row
                icon={<Send className="h-5 w-5" />}
                label="Send Test Spark Now"
                tint="bg-emerald-500"
                trailing={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
                onClick={handleTestNotification}
              />
            </>
          )}
        </Group>

        <Group title="Support" className="mt-5">
          <Row
            icon={<Star className="h-5 w-5" />}
            label="Rate the app"
            tint="bg-amber-500"
            trailing={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
            onClick={() => setActiveModal("rating")}
          />
          <Row
            icon={<Share2 className="h-5 w-5" />}
            label="Share app"
            tint="bg-cyan-500"
            trailing={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
            onClick={handleShareApp}
          />
          <Row
            icon={<Shield className="h-5 w-5" />}
            label="Privacy policy"
            tint="bg-emerald-500"
            trailing={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
            onClick={() => setActiveModal("privacy")}
          />
          <Row
            icon={<Info className="h-5 w-5" />}
            label="About"
            tint="bg-fuchsia-500"
            trailing={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
            onClick={() => setActiveModal("about")}
          />
        </Group>
      </section>

      {/* Modals */}
      {activeModal === "rating" && (
        <RatingModal onClose={() => setActiveModal(null)} />
      )}
      {(activeModal === "privacy" || activeModal === "about") && (
        <LegalModal type={activeModal} onClose={() => setActiveModal(null)} />
      )}
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
  onClick,
}: {
  icon: ReactNode;
  label: string;
  tint: string;
  trailing: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/60"
    >
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
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
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
