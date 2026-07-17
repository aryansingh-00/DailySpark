import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "solid" | "outline";
}

export function GradientButton({
  children,
  className,
  variant = "solid",
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98]",
        variant === "solid"
          ? "bg-brand-gradient text-primary-foreground shadow-glow hover:brightness-110"
          : "border-2 border-transparent bg-brand-gradient-soft text-foreground hover:brightness-95",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
