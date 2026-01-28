"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useBusinessHours,
  useUpdateBusinessHours,
} from "@/services/business-hours";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

interface DayHours {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export function WeeklyHoursEditor() {
  const { data: businessHours, isLoading } = useBusinessHours();
  const updateMutation = useUpdateBusinessHours();
  
  const [hours, setHours] = useState<Record<number, DayHours>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize hours from database
  useEffect(() => {
    if (businessHours) {
      const hoursMap: Record<number, DayHours> = {};
      businessHours.forEach((h) => {
        hoursMap[h.day_of_week] = {
          day_of_week: h.day_of_week,
          is_open: h.is_open,
          open_time: h.open_time,
          close_time: h.close_time,
        };
      });
      
      // Fill missing days with defaults
      DAYS_OF_WEEK.forEach((day) => {
        if (!hoursMap[day.value]) {
          hoursMap[day.value] = {
            day_of_week: day.value,
            is_open: day.value >= 1 && day.value <= 5, // Mon-Fri open by default
            open_time: "08:00",
            close_time: "18:00",
          };
        }
      });
      
      setHours(hoursMap);
    }
  }, [businessHours]);

  const handleToggle = (dayOfWeek: number, isOpen: boolean) => {
    setHours((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], is_open: isOpen },
    }));
    setHasChanges(true);
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: "open_time" | "close_time",
    value: string
  ) => {
    setHours((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], [field]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Save all days
      for (const day of DAYS_OF_WEEK) {
        const dayHours = hours[day.value];
        if (dayHours) {
          await updateMutation.mutateAsync({
            dayOfWeek: day.value,
            hours: {
              is_open: dayHours.is_open,
              open_time: dayHours.open_time,
              close_time: dayHours.close_time,
            },
          });
        }
      }
      toast.success("Horários salvos com sucesso!");
      setHasChanges(false);
    } catch (error) {
      toast.error("Erro ao salvar horários");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayHours = hours[day.value];
          if (!dayHours) return null;

          return (
            <div
              key={day.value}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-card"
            >
              <div className="flex items-center gap-3 sm:w-48">
                <Switch
                  checked={dayHours.is_open}
                  onCheckedChange={(checked) => handleToggle(day.value, checked)}
                />
                <Label className="font-medium">{day.label}</Label>
              </div>

              {dayHours.is_open ? (
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor={`open-${day.value}`} className="text-xs text-muted-foreground">
                      Abertura
                    </Label>
                    <Input
                      id={`open-${day.value}`}
                      type="time"
                      value={dayHours.open_time}
                      onChange={(e) =>
                        handleTimeChange(day.value, "open_time", e.target.value)
                      }
                      className="w-full sm:w-32"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <Label htmlFor={`close-${day.value}`} className="text-xs text-muted-foreground">
                      Fechamento
                    </Label>
                    <Input
                      id={`close-${day.value}`}
                      type="time"
                      value={dayHours.close_time}
                      onChange={(e) =>
                        handleTimeChange(day.value, "close_time", e.target.value)
                      }
                      className="w-full sm:w-32"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-sm text-muted-foreground">
                  Fechado
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasChanges && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              // Reset to original data
              if (businessHours) {
                const hoursMap: Record<number, DayHours> = {};
                businessHours.forEach((h) => {
                  hoursMap[h.day_of_week] = {
                    day_of_week: h.day_of_week,
                    is_open: h.is_open,
                    open_time: h.open_time,
                    close_time: h.close_time,
                  };
                });
                setHours(hoursMap);
                setHasChanges(false);
              }
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
