"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
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
  minuteStep = 5,
  minHour = 0,
  maxHour = 23,
}: TimeSelectProps) {
  const [hour, minute] = React.useMemo(() => {
    if (!value) return ["08", "00"];
    const parts = value.split(":");
    return [parts[0] || "08", parts[1] || "00"];
  }, [value]);

  const hours = React.useMemo(() => {
    const result: string[] = [];
    for (let h = minHour; h <= maxHour; h++) {
      result.push(padZero(h));
    }
    return result;
  }, [minHour, maxHour]);

  const minutes = React.useMemo(() => {
    const result: string[] = [];
    for (let m = 0; m < 60; m += minuteStep) {
      result.push(padZero(m));
    }
    return result;
  }, [minuteStep]);

  const handleHourChange = (newHour: string) => {
    const closestMinute = findClosestMinute(minute, minuteStep);
    onChange(`${newHour}:${closestMinute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute}`);
  };

  return (
    <div id={id} className={cn("flex items-center gap-1.5", className)}>
      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select
        value={hour}
        onValueChange={handleHourChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[70px] h-9 text-center tabular-nums">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {hours.map((h) => (
            <SelectItem key={h} value={h} className="tabular-nums">
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-lg font-semibold text-muted-foreground select-none">:</span>

      <Select
        value={findClosestMinute(minute, minuteStep)}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[70px] h-9 text-center tabular-nums">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {minutes.map((m) => (
            <SelectItem key={m} value={m} className="tabular-nums">
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function findClosestMinute(minute: string, step: number): string {
  const m = parseInt(minute, 10);
  const closest = Math.round(m / step) * step;
  return padZero(closest >= 60 ? 0 : closest);
}
