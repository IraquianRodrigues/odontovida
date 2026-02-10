"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RecordLoadingSkeletonProps {
  onBack: () => void;
}

export function RecordLoadingSkeleton({ onBack }: RecordLoadingSkeletonProps) {
  return (
    <div className="fixed inset-0 bg-background z-50">
      <header className="border-b border-border/50 bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm" className="rounded-sm hover:bg-muted/50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-border/50" />
              <div className="space-y-2">
                <div className="h-5 w-48 bg-muted/50 rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex h-[calc(100vh-73px)]">
        <aside className="w-80 border-r border-border/50 bg-card p-6">
          <div className="space-y-6 animate-pulse">
            <div className="text-center pb-6 border-b border-border/50">
              <div className="h-8 w-48 bg-muted/50 rounded mx-auto mb-2" />
              <div className="h-4 w-32 bg-muted/50 rounded mx-auto" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-muted/50 rounded-sm" />
              <div className="h-20 bg-muted/50 rounded-sm" />
            </div>
          </div>
        </aside>
        <main className="flex-1 bg-muted/40 p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-muted/50 rounded-sm" />
            <div className="h-32 bg-muted/50 rounded-sm" />
            <div className="h-32 bg-muted/50 rounded-sm" />
          </div>
        </main>
      </div>
    </div>
  );
}
