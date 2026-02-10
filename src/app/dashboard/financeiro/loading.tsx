"use client";

export default function FinanceiroLoading() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto p-6 lg:p-12 space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="h-9 w-40 rounded-sm bg-muted animate-pulse" />
            <div className="h-4 w-56 rounded-sm bg-muted/60 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 rounded-sm bg-muted animate-pulse" />
            <div className="h-10 w-32 rounded-sm bg-muted animate-pulse" />
          </div>
        </div>

        {/* Stats Cards skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[120px] rounded-sm border border-border/50 bg-card animate-pulse"
            >
              <div className="p-5 space-y-3">
                <div className="h-3 w-20 rounded bg-muted/50" />
                <div className="h-8 w-24 rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="flex gap-3 flex-wrap">
          <div className="h-10 w-[200px] rounded-sm bg-muted/30 animate-pulse" />
          <div className="h-10 w-[180px] rounded-sm bg-muted/30 animate-pulse" />
          <div className="h-10 w-[160px] rounded-sm bg-muted/30 animate-pulse" />
        </div>

        {/* Table skeleton */}
        <div className="bg-card rounded-sm border border-border/50 shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-4 w-24 rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-32 rounded bg-muted/30 animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted/40 animate-pulse" />
                <div className="flex-1" />
                <div className="h-4 w-24 rounded bg-muted/30 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
