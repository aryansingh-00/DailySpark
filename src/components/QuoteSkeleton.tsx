import React from "react";

export function QuoteSkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-card p-6 shadow-soft ring-1 ring-border/80 flex flex-col justify-between min-h-[140px]">
      {/* Quote symbol skeleton */}
      <div className="h-6 w-8 rounded-lg animate-shimmer bg-muted/60 mb-4" />

      {/* Quote text lines */}
      <div className="space-y-2 mb-4">
        <div className="h-4.5 w-full rounded-md animate-shimmer bg-muted" />
        <div className="h-4.5 w-11/12 rounded-md animate-shimmer bg-muted" />
        <div className="h-4.5 w-3/4 rounded-md animate-shimmer bg-muted" />
      </div>

      {/* Author line */}
      <div className="h-3.5 w-24 rounded-md animate-shimmer bg-muted mb-4" />

      {/* Footer tags */}
      <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-2">
        <div className="h-5 w-16 rounded-full animate-shimmer bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-xl animate-shimmer bg-muted" />
          <div className="h-8 w-8 rounded-xl animate-shimmer bg-muted" />
          <div className="h-8 w-8 rounded-xl animate-shimmer bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function QuoteSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <QuoteSkeletonCard key={idx} />
      ))}
    </div>
  );
}
