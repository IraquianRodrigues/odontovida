"use client";

import { useState } from "react";
import { useBusinessHours, useUpdateBusinessHours } from "@/services/business-hours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export function WeeklyScheduleEditor() {
  const { data: businessHours, isLoading } = useBusinessHours();
  const updateHours = useUpdateBusinessHours();
  const { toast } = useToast();

  const [editedHours, setEditedHours] = useState<
    Record<
      number,
      { is_open: boolean; open_time: string; close_time: string }
    >
  >({});

  const getHoursForDay = (dayOfWeek: number) => {
    if (editedHours[dayOfWeek]) {
      return editedHours[dayOfWeek];
    }
    const existing = businessHours?.find((h) => h.day_of_week === dayOfWeek);
    return (
      existing || {
        is_open: false,
        open_time: "09:00",
        close_time: "18:00",
      }
    );
  };

  const handleToggleDay = (dayOfWeek: number, isOpen: boolean) => {
    setEditedHours((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...getHoursForDay(dayOfWeek),
        is_open: isOpen,
      },
    }));
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: "open_time" | "close_time",
    value: string
  ) => {
    setEditedHours((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...getHoursForDay(dayOfWeek),
        [field]: value,
      },
    }));
  };

  const handleSave = async (dayOfWeek: number) => {
    const hours = editedHours[dayOfWeek] || getHoursForDay(dayOfWeek);

    try {
      await updateHours.mutateAsync({
        dayOfWeek,
        hours,
      });

      toast({
        title: "Horário atualizado",
        description: `Horário de ${DAYS_OF_WEEK[dayOfWeek].label} salvo com sucesso`,
      });

      // Limpar edição após salvar
      setEditedHours((prev) => {
        const newState = { ...prev };
        delete newState[dayOfWeek];
        return newState;
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o horário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {DAYS_OF_WEEK.map((day) => {
        const hours = getHoursForDay(day.value);
        const hasChanges = !!editedHours[day.value];

        return (
          <div
            key={day.value}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3 sm:w-48">
              <Switch
                checked={hours.is_open}
                onCheckedChange={(checked) => handleToggleDay(day.value, checked)}
              />
              <Label className="font-medium">{day.label}</Label>
            </div>

            {hours.is_open && (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Abertura</Label>
                  <Input
                    type="time"
                    value={hours.open_time}
                    onChange={(e) =>
                      handleTimeChange(day.value, "open_time", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <span className="text-muted-foreground mt-6">até</span>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Fechamento</Label>
                  <Input
                    type="time"
                    value={hours.close_time}
                    onChange={(e) =>
                      handleTimeChange(day.value, "close_time", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {!hours.is_open && (
              <div className="flex-1 text-sm text-muted-foreground">
                Fechado
              </div>
            )}

            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSave(day.value)}
                disabled={updateHours.isPending}
                className="sm:w-auto w-full"
              >
                {updateHours.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
