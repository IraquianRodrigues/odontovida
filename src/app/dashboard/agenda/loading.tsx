"use client";

export default function AgendaLoading() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto p-6 lg:p-12 space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="h-9 w-32 rounded-sm bg-muted animate-pulse" />
            <div className="h-4 w-56 rounded-sm bg-muted/60 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 rounded-sm bg-muted animate-pulse" />
            <div className="h-10 w-10 rounded-sm bg-muted animate-pulse" />
          </div>
        </div>

        {/* Calendar skeleton */}
        <div className="bg-card rounded-sm border border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 rounded bg-muted/50 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded bg-muted/50 animate-pulse" />
                <div className="h-8 w-8 rounded bg-muted/50 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-card p-2 animate-pulse"
              >
                <div className="h-4 w-6 rounded bg-muted/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
