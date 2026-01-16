"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./progress-ring";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "blue" | "green" | "orange" | "purple" | "red";
  progress?: number; // 0-100
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number; // Animation delay in ms
  className?: string;
}

const variantStyles = {
  blue: {
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500/10 via-transparent to-transparent",
    ring: "text-blue-600 dark:text-blue-400",
    glow: "shadow-blue-500/20",
  },
  green: {
    iconBg: "bg-green-50 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    gradient: "from-green-500/10 via-transparent to-transparent",
    ring: "text-green-600 dark:text-green-400",
    glow: "shadow-green-500/20",
  },
  orange: {
    iconBg: "bg-orange-50 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500/10 via-transparent to-transparent",
    ring: "text-orange-600 dark:text-orange-400",
    glow: "shadow-orange-500/20",
  },
  purple: {
    iconBg: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    gradient: "from-purple-500/10 via-transparent to-transparent",
    ring: "text-purple-600 dark:text-purple-400",
    glow: "shadow-purple-500/20",
  },
  red: {
    iconBg: "bg-red-50 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    gradient: "from-red-500/10 via-transparent to-transparent",
    ring: "text-red-600 dark:text-red-400",
    glow: "shadow-red-500/20",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  variant = "blue",
  progress,
  trend,
  delay = 0,
  className,
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const styles = variantStyles[variant];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-border bg-card p-6",
        "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none",
        "transition-all duration-500 ease-out",
        "hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-1",
        styles.glow,
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-300",
          "group-hover:opacity-70",
          styles.gradient
        )}
      />

      {/* Content */}
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          {/* Icon */}
          <div
            className={cn(
              "mb-4 inline-flex p-3.5 rounded-2xl transition-transform duration-300",
              "group-hover:scale-110",
              styles.iconBg
            )}
          >
            <Icon className={cn("h-7 w-7", styles.iconColor)} />
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
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
                  trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
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
              color={styles.ring}
              showPercentage={true}
            />
          </div>
        )}
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
}
