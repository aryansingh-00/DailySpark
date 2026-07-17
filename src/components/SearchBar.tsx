import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search quotes, authors…",
}: {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="group relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-4 text-sm shadow-soft outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
