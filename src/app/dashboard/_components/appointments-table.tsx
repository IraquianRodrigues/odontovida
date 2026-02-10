"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, RefreshCw } from "lucide-react";
import type { AppointmentWithRelations } from "@/types/database.types";
import { useProfessionals } from "@/services/professionals/use-professionals";
import {
  useMarkAppointmentAsCompleted,
  useMarkAppointmentAsNotCompleted,
} from "@/services/appointments/use-appointments";
import { toast } from "sonner";
import { AppointmentMobileCard, AppointmentTableRow } from "./appointments-table/appointment-row";

const AppointmentDetailsModal = dynamic(
  () => import("@/components/appointment-details-modal").then(mod => mod.AppointmentDetailsModal),
  { ssr: false }
);

const CompleteAppointmentPaymentModal = dynamic(
  () => import("@/components/complete-appointment-payment-modal").then(mod => mod.CompleteAppointmentPaymentModal),
  { ssr: false }
);

interface AppointmentsTableProps {
  appointments: AppointmentWithRelations[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const TABLE_HEADERS = ["Cliente", "Telefone", "Médico", "Procedimento", "Horário Início", "Horário Fim", "Ações"];

function EmptyFilteredState() {
  return (
    <div className="p-12 text-center text-muted-foreground">
      <div className="flex flex-col items-center gap-2">
        <p className="text-base font-medium">Nenhum agendamento encontrado</p>
        <p className="text-sm text-muted-foreground/70">Tente ajustar os filtros ou selecionar outra data</p>
      </div>
    </div>
  );
}

export function AppointmentsTable({ appointments, isLoading = false, onRefresh, isRefreshing = false }: AppointmentsTableProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [appointmentForPayment, setAppointmentForPayment] = useState<AppointmentWithRelations | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("all");

  const { data: professionals = [], isLoading: isLoadingProfessionals } = useProfessionals();
  const markAsCompletedMutation = useMarkAppointmentAsCompleted();
  const markAsNotCompletedMutation = useMarkAppointmentAsNotCompleted();

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    if (selectedProfessionalId !== "all") {
      filtered = filtered.filter(a => a.professional_code.toString() === selectedProfessionalId);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(a => a.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [appointments, searchQuery, selectedProfessionalId]);

  const handleUncomplete = async (appointmentId: number) => {
    try {
      await markAsNotCompletedMutation.mutateAsync(appointmentId);
      toast.success("Agendamento desmarcado como concluído");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao desmarcar agendamento", { duration: 5000 });
    }
  };

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
          <p className="text-base font-medium text-muted-foreground">Nenhum agendamento encontrado para esta data</p>
          <p className="text-sm text-muted-foreground/70">Tente selecionar outra data ou verifique os filtros aplicados</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-card rounded-[32px] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden transition-colors dark:shadow-none">
        {/* Header + Filters */}
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
              <Select value={selectedProfessionalId} onValueChange={setSelectedProfessionalId} disabled={isLoadingProfessionals}>
                <SelectTrigger className="w-full sm:w-[250px] h-12 bg-muted/50 border-input focus:bg-background focus:ring-2 focus:ring-ring transition-all rounded-2xl font-medium text-foreground">
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {professionals.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline" size="icon" onClick={onRefresh}
                disabled={isRefreshing || !onRefresh} title="Atualizar agendamentos"
                className="h-10 w-10 border-input hover:bg-muted text-muted-foreground"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden space-y-3 p-4">
          {filteredAppointments.length === 0 ? <EmptyFilteredState /> : (
            filteredAppointments.map(appointment => (
              <AppointmentMobileCard
                key={appointment.id}
                appointment={appointment}
                onComplete={setAppointmentForPayment}
                onUncomplete={handleUncomplete}
                onViewDetails={setSelectedAppointment}
                isUncompleting={markAsNotCompletedMutation.isPending}
              />
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {TABLE_HEADERS.map(header => (
                  <th key={header} className="text-left p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAppointments.length === 0 ? (
                <tr><td colSpan={7}><EmptyFilteredState /></td></tr>
              ) : (
                filteredAppointments.map(appointment => (
                  <AppointmentTableRow
                    key={appointment.id}
                    appointment={appointment}
                    onComplete={setAppointmentForPayment}
                    onUncomplete={handleUncomplete}
                    onViewDetails={setSelectedAppointment}
                    isUncompleting={markAsNotCompletedMutation.isPending}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdate={() => { setSelectedAppointment(null); onRefresh?.(); }}
      />

      <CompleteAppointmentPaymentModal
        isOpen={!!appointmentForPayment}
        onClose={() => setAppointmentForPayment(null)}
        appointment={appointmentForPayment}
        onSuccess={async () => {
          if (appointmentForPayment) {
            try {
              await markAsCompletedMutation.mutateAsync(appointmentForPayment.id);
              toast.success("Agendamento concluído e pagamento registrado!");
              setAppointmentForPayment(null);
              onRefresh?.();
            } catch (error) {
              toast.error("Erro ao marcar agendamento como concluído");
            }
          }
        }}
      />
    </>
  );
}
