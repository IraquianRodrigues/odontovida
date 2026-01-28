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
}

export function StatCard({
  title,
  value,
  icon: Icon,
  progress,
  trend,
  delay = 0,
  className,
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-6",
        "shadow-sm hover:shadow-md",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Content */}
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          {/* Icon */}
          <div
            className={cn(
              "mb-4 inline-flex p-3 rounded-xl bg-sidebar-accent transition-transform duration-300",
              "group-hover:scale-105"
            )}
          >
            <Icon className="h-6 w-6 text-primary" />
          </div>

          {/* Title */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {title}
          </p>

          {/* Value */}
          <p className="text-3xl font-bold text-card-foreground tracking-tight">
            {value}
          </p>

          {/* Trend */}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.isPositive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs. ontem</span>
            </div>
          )}
        </div>

        {/* Progress Ring */}
        {progress !== undefined && (
          <div className="flex-shrink-0">
            <ProgressRing
              progress={progress}
              size={60}
              strokeWidth={4}
              showPercentage={true}
            />
          </div>
        )}
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
}
