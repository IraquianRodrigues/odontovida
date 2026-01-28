"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  useProfessionalSchedule,
  useUpdateProfessionalSchedule,
} from "@/services/professional-schedules";
import type { ProfessionalRow } from "@/types/database.types";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

interface DaySchedule {
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
}

interface ProfessionalScheduleModalProps {
  professional: ProfessionalRow | null;
  onClose: () => void;
}

export function ProfessionalScheduleModal({
  professional,
  onClose,
}: ProfessionalScheduleModalProps) {
  const { data: scheduleData, isLoading } = useProfessionalSchedule(
    professional?.id || 0
  );
  const updateMutation = useUpdateProfessionalSchedule();

  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize schedule from database
  useEffect(() => {
    if (scheduleData) {
      const scheduleMap: Record<number, DaySchedule> = {};
      scheduleData.forEach((s) => {
        scheduleMap[s.day_of_week] = {
          day_of_week: s.day_of_week,
          is_available: s.is_available,
          start_time: s.start_time,
          end_time: s.end_time,
        };
      });

      // Fill missing days with defaults
      DAYS_OF_WEEK.forEach((day) => {
        if (!scheduleMap[day.value]) {
          scheduleMap[day.value] = {
            day_of_week: day.value,
            is_available: day.value >= 1 && day.value <= 5, // Mon-Fri by default
            start_time: "09:00",
            end_time: "18:00",
          };
        }
      });

      setSchedule(scheduleMap);
    }
  }, [scheduleData]);

  const handleToggle = (dayOfWeek: number, isAvailable: boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], is_available: isAvailable },
    }));
    setHasChanges(true);
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], [field]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!professional) return;

    try {
      // Save all days
      for (const day of DAYS_OF_WEEK) {
        const daySchedule = schedule[day.value];
        if (daySchedule) {
          await updateMutation.mutateAsync({
            professionalId: professional.id,
            dayOfWeek: day.value,
            schedule: {
              is_available: daySchedule.is_available,
              start_time: daySchedule.start_time,
              end_time: daySchedule.end_time,
            },
          });
        }
      }
      toast.success("Agenda salva com sucesso!");
      setHasChanges(false);
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar agenda");
    }
  };

  if (!professional) return null;

  return (
    <Dialog open={!!professional} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Agenda de {professional.name}
          </DialogTitle>
          <DialogDescription>
            Configure os dias e horários em que este profissional trabalha
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {DAYS_OF_WEEK.map((day) => {
                const daySchedule = schedule[day.value];
                if (!daySchedule) return null;

                return (
                  <div
                    key={day.value}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-card"
                  >
                    {/* Day name with toggle */}
                    <div className="flex items-center gap-3 sm:w-48">
                      <Switch
                        checked={daySchedule.is_available}
                        onCheckedChange={(checked) =>
                          handleToggle(day.value, checked)
                        }
                      />
                      <Label className="font-medium">
                        {day.label}
                      </Label>
                    </div>

                    {/* Time inputs or "Não trabalha" message */}
                    {daySchedule.is_available ? (
                      <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="space-y-1">
                          <Label
                            htmlFor={`start-${day.value}`}
                            className="text-xs text-muted-foreground"
                          >
                            Início
                          </Label>
                          <Input
                            id={`start-${day.value}`}
                            type="time"
                            value={daySchedule.start_time}
                            onChange={(e) =>
                              handleTimeChange(
                                day.value,
                                "start_time",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label
                            htmlFor={`end-${day.value}`}
                            className="text-xs text-muted-foreground"
                          >
                            Fim
                          </Label>
                          <Input
                            id={`end-${day.value}`}
                            type="time"
                            value={daySchedule.end_time}
                            onChange={(e) =>
                              handleTimeChange(
                                day.value,
                                "end_time",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 text-sm text-muted-foreground">
                        Não trabalha
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Fechar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || !hasChanges}
              className="flex-1 sm:flex-none"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Agenda"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
