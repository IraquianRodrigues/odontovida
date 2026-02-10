"use client";

export default function ClientesLoading() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto p-4 lg:p-10 space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-32 rounded-sm bg-muted animate-pulse" />
            <div className="h-4 w-64 rounded-sm bg-muted/60 animate-pulse" />
          </div>
          <div className="h-10 w-40 rounded-sm bg-muted animate-pulse" />
        </div>

        {/* Stats Cards skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[140px] rounded-sm border border-border/50 bg-card animate-pulse"
            >
              <div className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-sm bg-muted/50" />
                <div className="space-y-2">
                  <div className="h-2 w-20 rounded bg-muted/50" />
                  <div className="h-8 w-16 rounded bg-muted/50" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-card rounded-sm border border-border/50 shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 rounded-full bg-muted/40 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-muted/40 animate-pulse" />
                  <div className="h-3 w-28 rounded bg-muted/30 animate-pulse" />
                </div>
                <div className="h-4 w-24 rounded bg-muted/30 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
