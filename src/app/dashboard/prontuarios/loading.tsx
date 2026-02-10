"use client";

export default function ProntuariosLoading() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto p-6 lg:p-12 space-y-10 lg:space-y-12">
        {/* Header skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-1 w-16 bg-primary/30 rounded-full" />
              <div className="h-9 w-56 rounded-sm bg-muted animate-pulse" />
            </div>
            <div className="h-4 w-72 rounded-sm bg-muted/60 animate-pulse pl-[76px]" />
          </div>

          {/* Search bar skeleton */}
          <div className="h-14 rounded-sm bg-card border border-border/50 animate-pulse" />
        </div>

        {/* Patient cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[100px] rounded-sm border border-border/50 bg-card animate-pulse"
            >
              <div className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted/50" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 rounded bg-muted/40" />
                  <div className="h-3 w-24 rounded bg-muted/30" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
