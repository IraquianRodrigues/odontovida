"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  minuteStep?: number;
  minHour?: number;
  maxHour?: number;
}

function padZero(n: number): string {
  return n.toString().padStart(2, "0");
}

export function TimeSelect({
  value,
  onChange,
  id,
  className,
  disabled = false,
  minuteStep = 30,
  minHour = 6,
  maxHour = 22,
}: TimeSelectProps) {
  const timeOptions = React.useMemo(() => {
    const options: string[] = [];
    for (let h = minHour; h <= maxHour; h++) {
      for (let m = 0; m < 60; m += minuteStep) {
        options.push(`${padZero(h)}:${padZero(m)}`);
      }
    }
    return options;
  }, [minHour, maxHour, minuteStep]);

  const currentValue = React.useMemo(() => {
    if (!value) return "08:00";
    // Find the closest available time option
    const [h, m] = value.split(":").map(Number);
    const closestMinute = Math.round(m / minuteStep) * minuteStep;
    const adjustedMinute = closestMinute >= 60 ? 0 : closestMinute;
    const adjustedHour = closestMinute >= 60 ? Math.min(h + 1, maxHour) : h;
    const target = `${padZero(adjustedHour)}:${padZero(adjustedMinute)}`;
    return timeOptions.includes(target) ? target : timeOptions[0] || "08:00";
  }, [value, minuteStep, maxHour, timeOptions]);

  return (
    <Select
      value={currentValue}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn("w-full h-9 tabular-nums", className)}>
        <SelectValue placeholder="Horário" />
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        {timeOptions.map((time) => (
          <SelectItem key={time} value={time} className="tabular-nums">
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
