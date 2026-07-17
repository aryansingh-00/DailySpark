import { cn } from "@/lib/utils";

export function SectionTitle({
  title,
  action,
  className,
}: {
  title: string;
  action?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between", className)}>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {action && (
        <button className="text-sm font-medium text-primary hover:underline">
          {action}
        </button>
      )}
    </div>
  );
}
