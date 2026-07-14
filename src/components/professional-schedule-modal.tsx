"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TimeSelect } from "@/components/ui/time-select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Calendar, Ban, Plus, Trash2, CalendarOff, Info } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isAfter, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useProfessionalSchedule,
  useUpdateProfessionalSchedule,
  useProfessionalBlockedDates,
  useCreateProfessionalBlockedDate,
  useDeleteProfessionalBlockedDate,
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
  const [activeTab, setActiveTab] = useState("agenda");

  if (!professional) return null;

  return (
    <Dialog open={!!professional} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Agenda de {professional.name}
          </DialogTitle>
          <DialogDescription>
            Gerencie os dias de atendimento e bloqueios de datas
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="agenda" className="gap-2">
                <Calendar className="h-4 w-4" />
                Agenda Semanal
              </TabsTrigger>
              <TabsTrigger value="bloqueios" className="gap-2">
                <Ban className="h-4 w-4" />
                Bloqueios de Datas
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="agenda" className="mt-0 px-6 py-4">
              <WeeklyScheduleTab
                professional={professional}
                onClose={onClose}
              />
            </TabsContent>

            <TabsContent value="bloqueios" className="mt-0 px-6 py-4">
              <BlockedDatesTab professional={professional} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// WEEKLY SCHEDULE TAB (existing functionality)
// ============================================

function WeeklyScheduleTab({
  professional,
  onClose,
}: {
  professional: ProfessionalRow;
  onClose: () => void;
}) {
  const { data: scheduleData, isLoading } = useProfessionalSchedule(
    professional.id
  );
  const updateMutation = useUpdateProfessionalSchedule();

  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>({});
  const [hasChanges, setHasChanges] = useState(false);

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

      DAYS_OF_WEEK.forEach((day) => {
        if (!scheduleMap[day.value]) {
          scheduleMap[day.value] = {
            day_of_week: day.value,
            is_available: day.value >= 1 && day.value <= 5,
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
    try {
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
    } catch {
      toast.error("Erro ao salvar agenda");
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
    <div className="space-y-3">
      {DAYS_OF_WEEK.map((day) => {
        const daySchedule = schedule[day.value];
        if (!daySchedule) return null;

        return (
          <div key={day.value} className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-3 mb-3">
              <Switch
                checked={daySchedule.is_available}
                onCheckedChange={(checked) =>
                  handleToggle(day.value, checked)
                }
              />
              <Label className="font-medium">{day.label}</Label>
            </div>

            {daySchedule.is_available ? (
              <div className="grid grid-cols-2 gap-4 pl-10">
                <div className="space-y-1">
                  <Label
                    htmlFor={`start-${day.value}`}
                    className="text-xs text-muted-foreground"
                  >
                    Início
                  </Label>
                  <TimeSelect
                    id={`start-${day.value}`}
                    value={daySchedule.start_time}
                    onChange={(value) =>
                      handleTimeChange(day.value, "start_time", value)
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor={`end-${day.value}`}
                    className="text-xs text-muted-foreground"
                  >
                    Fim
                  </Label>
                  <TimeSelect
                    id={`end-${day.value}`}
                    value={daySchedule.end_time}
                    onChange={(value) =>
                      handleTimeChange(day.value, "end_time", value)
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="pl-10 text-sm text-muted-foreground">
                Não trabalha
              </div>
            )}
          </div>
        );
      })}

      {hasChanges && (
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
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
      )}
    </div>
  );
}

// ============================================
// BLOCKED DATES TAB (new functionality)
// ============================================

function BlockedDatesTab({
  professional,
}: {
  professional: ProfessionalRow;
}) {
  const { data: blockedDates, isLoading } = useProfessionalBlockedDates(
    professional.id
  );
  const createMutation = useCreateProfessionalBlockedDate();
  const deleteMutation = useDeleteProfessionalBlockedDate();

  const [isAdding, setIsAdding] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleCreate = async () => {
    if (!startDate) {
      toast.error("Selecione a data de início");
      return;
    }

    if (endDate && isAfter(parseISO(startDate), parseISO(endDate))) {
      toast.error("A data final deve ser igual ou posterior à data inicial");
      return;
    }

    try {
      await createMutation.mutateAsync({
        professionalCode: professional.id,
        blockData: {
          date: startDate,
          end_date: endDate || null,
          reason: reason.trim() || null,
        },
      });
      toast.success("Data bloqueada com sucesso!");
      setIsAdding(false);
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch {
      toast.error("Erro ao bloquear data");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({
        id,
        professionalCode: professional.id,
      });
      toast.success("Bloqueio removido!");
    } catch {
      toast.error("Erro ao remover bloqueio");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy (EEEE)", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatDateShort = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter future or today's blocked dates
  const today = new Date().toISOString().slice(0, 10);
  const futureBlocks = blockedDates?.filter(
    (b) => (b.end_date || b.date) >= today
  ) || [];
  const pastBlocks = blockedDates?.filter(
    (b) => (b.end_date || b.date) < today
  ) || [];

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Bloqueie datas específicas quando {professional.name.split(" ")[0]} não puder atender.
          Ideal para viagens, folgas ou compromissos pessoais.
        </p>
      </div>

      {/* Add button or form */}
      {isAdding ? (
        <div className="p-4 border rounded-lg bg-card space-y-4">
          <h4 className="text-sm font-semibold">Nova data bloqueada</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="block-start-date" className="text-xs text-muted-foreground">
                Data Início
              </Label>
              <Input
                id="block-start-date"
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block-end-date" className="text-xs text-muted-foreground">
                Data Fim (opcional)
              </Label>
              <Input
                id="block-end-date"
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Mesmo dia"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="block-reason" className="text-xs text-muted-foreground">
              Motivo (opcional)
            </Label>
            <Textarea
              id="block-reason"
              placeholder="Ex: Viagem, Congresso, Folga pessoal..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setStartDate("");
                setEndDate("");
                setReason("");
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={createMutation.isPending || !startDate}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bloqueando...
                </>
              ) : (
                "Bloquear Data"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          variant="outline"
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" />
          Bloquear Nova Data
        </Button>
      )}

      {/* Blocked dates list */}
      {futureBlocks.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {futureBlocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell className="font-medium">
                    {block.end_date && block.end_date !== block.date ? (
                      <span>
                        {formatDateShort(block.date)} → {formatDateShort(block.end_date)}
                      </span>
                    ) : (
                      formatDate(block.date)
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {block.reason || "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(block.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-2xl bg-muted/60">
              <CalendarOff className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Nenhuma data bloqueada
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {professional.name.split(" ")[0]} está disponível em todos os dias configurados na agenda semanal
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Past blocks (collapsed) */}
      {pastBlocks.length > 0 && (
        <details className="group">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            {pastBlocks.length} bloqueio(s) passado(s)
          </summary>
          <div className="mt-2 border rounded-lg overflow-hidden opacity-60">
            <Table>
              <TableBody>
                {pastBlocks.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell className="text-sm">
                      {block.end_date && block.end_date !== block.date ? (
                        <span>
                          {formatDateShort(block.date)} → {formatDateShort(block.end_date)}
                        </span>
                      ) : (
                        formatDateShort(block.date)
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {block.reason || "—"}
                    </TableCell>
                    <TableCell className="w-[60px]">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(block.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive/60" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </details>
      )}
    </div>
  );
}
