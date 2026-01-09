"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import type { AppointmentWithRelations } from "@/types/database.types";
import { formatTimeBR } from "@/lib/date-utils";
import { AppointmentDetailsModal } from "@/components/appointment-details-modal";
import { useProfessionals } from "@/services/professionals/use-professionals";
import {
  useMarkAppointmentAsCompleted,
  useMarkAppointmentAsNotCompleted,
} from "@/services/appointments/use-appointments";
import { toast } from "sonner";

interface AppointmentsTableProps {
  appointments: AppointmentWithRelations[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AppointmentsTable({
  appointments,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: AppointmentsTableProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessionalId, setSelectedProfessionalId] =
    useState<string>("all");

  const { data: professionals = [], isLoading: isLoadingProfessionals } =
    useProfessionals();

  const markAsCompletedMutation = useMarkAppointmentAsCompleted();
  const markAsNotCompletedMutation = useMarkAppointmentAsNotCompleted();

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    if (selectedProfessionalId !== "all") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.professional_code.toString() === selectedProfessionalId
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((appointment) =>
        appointment.customer_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [appointments, searchQuery, selectedProfessionalId]);

  if (isLoading) {
    return (
      <Card className="p-12 border shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Carregando agendamentos...</p>
        </div>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-12 border shadow-sm">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-muted-foreground">
            Nenhum agendamento encontrado para esta data
          </p>
          <p className="text-sm text-muted-foreground/70">
            Tente selecionar outra data ou verifique os filtros aplicados
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-card rounded-[32px] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden transition-colors dark:shadow-none">
        <div className="p-8 space-y-6 border-b border-border">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground transition-colors">Agendamentos do Dia</h2>
            <p className="text-sm text-muted-foreground font-medium transition-colors">
              Visualize e gerencie os atendimentos agendados
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                placeholder="Buscar por nome do cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-muted/50 border-input focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring transition-all rounded-2xl font-medium text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedProfessionalId}
                onValueChange={setSelectedProfessionalId}
                disabled={isLoadingProfessionals}
              >
                <SelectTrigger className="w-full sm:w-[250px] h-12 bg-muted/50 border-input focus:bg-background focus:ring-2 focus:ring-ring transition-all rounded-2xl font-medium text-foreground">
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {professionals.map((professional) => (
                    <SelectItem
                      key={professional.id}
                      value={professional.id.toString()}
                    >
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshing || !onRefresh}
                title="Atualizar agendamentos"
                className="h-10 w-10 border-input hover:bg-muted text-muted-foreground"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Telefone
                </th>
                <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Médico
                </th>
                <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Procedimento
                </th>
                <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Horário Início
                </th>
                <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Horário Fim
                </th>
                <th className="text-left p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base font-medium">Nenhum agendamento encontrado</p>
                      <p className="text-sm text-muted-foreground/70">
                        Tente ajustar os filtros ou selecionar outra data
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment, index) => {
                  const isCompleted = appointment.completed_at !== null;
                  return (
                    <tr
                      key={appointment.id}
                      className={`group transition-colors hover:bg-muted/50 ${isCompleted ? "bg-green-50/30 dark:bg-green-900/10" : ""
                        }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium transition-colors ${isCompleted ? "text-green-700 dark:text-green-400" : "text-foreground group-hover:text-primary"
                            }`}>
                            {appointment.customer_name}
                          </span>
                          {isCompleted && (
                            <Badge variant="outline" className="bg-green-100/50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-[10px] px-1.5 py-0 h-5">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Concluído
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground font-mono">
                          {appointment.customer_phone}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground font-medium">
                          {appointment.professional?.name || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">
                          {appointment.service?.code || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 border-0 font-mono font-medium">
                          {formatTimeBR(appointment.start_time)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 border-0 font-mono font-medium">
                          {formatTimeBR(appointment.end_time)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {appointment.completed_at ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await markAsNotCompletedMutation.mutateAsync(
                                    appointment.id
                                  );
                                  toast.success("Agendamento desmarcado como concluído");
                                } catch (error: any) {
                                  const errorMessage = error?.message || "Erro ao desmarcar agendamento";
                                  toast.error(errorMessage, {
                                    duration: 5000,
                                  });
                                }
                              }}
                              disabled={markAsNotCompletedMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white h-8 px-3 text-xs shadow-none border border-transparent"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                              Concluído
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await markAsCompletedMutation.mutateAsync(
                                    appointment.id
                                  );
                                  toast.success("Agendamento marcado como concluído");
                                } catch (error: any) {
                                  const errorMessage = error?.message || "Erro ao marcar agendamento como concluído";
                                  toast.error(errorMessage, {
                                    duration: 5000,
                                  });
                                }
                              }}
                              disabled={markAsCompletedMutation.isPending}
                              className="h-8 px-3 text-xs border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                              Concluir
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAppointment(appointment)}
                            className="h-8 px-3 text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdate={() => {
          setSelectedAppointment(null);
        }}
      />
    </>
  );
}
