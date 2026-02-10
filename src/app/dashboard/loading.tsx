"use client";

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto p-6 lg:p-12 space-y-10 lg:space-y-12">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-1 w-12 bg-primary/30 rounded-full" />
              <div className="h-4 w-40 rounded-sm bg-muted animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-40 rounded-sm bg-muted animate-pulse" />
        </div>

        {/* Stats Cards skeleton */}
        <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2 h-[280px] lg:h-full rounded-sm border border-border/50 bg-card animate-pulse">
            <div className="p-8 space-y-4">
              <div className="h-14 w-14 rounded-sm bg-muted/50" />
              <div className="space-y-2">
                <div className="h-3 w-32 rounded bg-muted/50" />
                <div className="h-12 w-24 rounded bg-muted/50" />
              </div>
            </div>
          </div>
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
          <div className="p-8 space-y-4 border-b border-border">
            <div className="h-6 w-48 rounded bg-muted/50 animate-pulse" />
            <div className="flex gap-3">
              <div className="h-12 flex-1 rounded-sm bg-muted/30 animate-pulse" />
              <div className="h-12 w-[250px] rounded-sm bg-muted/30 animate-pulse" />
            </div>
          </div>
          <div className="divide-y divide-border">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-4 w-32 rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-28 rounded bg-muted/30 animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted/30 animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted/30 animate-pulse" />
                <div className="h-4 w-16 rounded bg-muted/20 animate-pulse" />
                <div className="h-4 w-16 rounded bg-muted/20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
