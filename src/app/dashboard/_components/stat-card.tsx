"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./progress-ring";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  progress?: number; // 0-100
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number; // Animation delay in ms
  className?: string;
  variant?: "default" | "hero" | "compact";
}

export function StatCard({
  title,
  value,
  icon: Icon,
  progress,
  trend,
  delay = 0,
  className,
  variant = "default",
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-card border border-border/50",
        // Sharp geometry for premium feel
        "rounded-sm",
        // Layered shadows for depth hierarchy
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.04)]",
        "hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.06),0_16px_32px_rgba(0,0,0,0.08)]",
        // Spring physics animation
        "transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "hover:-translate-y-1 hover:scale-[1.01]",
        // Entrance animation
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        // Variant-specific padding
        isHero ? "p-8 lg:p-10" : isCompact ? "p-5" : "p-6",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Background accent - subtle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          {/* Icon */}
          <div
            className={cn(
              "inline-flex rounded-sm bg-primary/5 transition-all duration-300",
              "group-hover:bg-primary/10 group-hover:scale-110",
              isHero ? "p-4 mb-6" : isCompact ? "p-2.5 mb-3" : "p-3 mb-4"
            )}
          >
            <Icon 
              className={cn(
                "text-primary",
                isHero ? "h-8 w-8" : isCompact ? "h-5 w-5" : "h-6 w-6"
              )} 
            />
          </div>

          {/* Title */}
          <p 
            className={cn(
              "font-semibold text-muted-foreground uppercase tracking-wider mb-2",
              isHero ? "text-sm" : "text-xs"
            )}
          >
            {title}
          </p>

          {/* Value */}
          <p 
            className={cn(
              "font-bold text-card-foreground tracking-tight",
              isHero ? "text-5xl lg:text-6xl" : isCompact ? "text-2xl" : "text-3xl"
            )}
          >
            {value}
          </p>

          {/* Trend */}
          {trend && (
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-sm",
                  trend.isPositive 
                    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30" 
                    : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/30"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs. ontem</span>
            </div>
          )}
        </div>

        {/* Progress Ring */}
        {progress !== undefined && !isHero && (
          <div className="flex-shrink-0">
            <ProgressRing
              progress={progress}
              size={isCompact ? 52 : 60}
              strokeWidth={3}
              showPercentage={true}
            />
          </div>
        )}
      </div>

      {/* Hero variant - progress at bottom */}
      {isHero && progress !== undefined && (
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="ml-4 text-sm font-semibold text-muted-foreground">
              {progress}%
            </span>
          </div>
        </div>
      )}

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
}
