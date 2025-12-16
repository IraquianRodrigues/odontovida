"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateLongBR } from "@/lib/date-utils";

interface DashboardHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DashboardHeader({
  selectedDate,
  onDateChange,
}: DashboardHeaderProps) {
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
          Agendamentos da Clínica
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Gerencie os agendamentos e consultas do dia
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousDay}
          className="shrink-0 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 min-w-[200px] sm:min-w-[280px] justify-center px-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium capitalize text-sm sm:text-base text-center">
            {formatDateLongBR(selectedDate)}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNextDay}
          className="shrink-0 bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {!isToday() && (
          <Button variant="default" onClick={goToToday} className="shrink-0">
            Hoje
          </Button>
        )}
      </div>
    </div>
  );
}
