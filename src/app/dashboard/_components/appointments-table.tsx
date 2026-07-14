"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import type { AppointmentWithRelations } from "@/types/database.types";
import { useProfessionals } from "@/services/professionals/use-professionals";
import {
  useMarkAppointmentAsNotCompleted,
} from "@/services/appointments/use-appointments";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/get-error-message";
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
}

const TABLE_HEADERS = [
  "Horário",
  "Cliente",
  "Procedimento",
  "Profissional",
  "Ações",
];

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

export function AppointmentsTable({ appointments, isLoading = false, onRefresh }: AppointmentsTableProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [appointmentForPayment, setAppointmentForPayment] = useState<AppointmentWithRelations | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("all");

  const { data: professionals = [], isLoading: isLoadingProfessionals } = useProfessionals();
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

  const handleUncomplete = async (appointmentId: string | number) => {
    try {
      await markAsNotCompletedMutation.mutateAsync(appointmentId);
      toast.success("Agendamento desmarcado como concluído");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Erro ao desmarcar agendamento", { duration: 5000 });
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl border p-10 shadow-none">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Carregando agendamentos...</p>
        </div>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="rounded-xl border p-10 shadow-none">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-muted-foreground">Nenhum agendamento encontrado para esta data</p>
          <p className="text-sm text-muted-foreground/70">Tente selecionar outra data ou verifique os filtros aplicados</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Header + Filters */}
        <div className="flex flex-col gap-4 border-b border-border p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Agendamentos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredAppointments.length} atendimento(s) na visualização atual
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="group relative sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-lg border-input bg-background pl-9 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Select value={selectedProfessionalId} onValueChange={setSelectedProfessionalId} disabled={isLoadingProfessionals}>
              <SelectTrigger className="h-10 w-full rounded-lg border-input bg-background sm:w-56">
                <SelectValue placeholder="Todos os profissionais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {professionals.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="block space-y-3 p-4 lg:hidden">
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
              <tr className="border-b border-border bg-muted/40">
                {TABLE_HEADERS.map(header => (
                  <th key={header} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAppointments.length === 0 ? (
                <tr><td colSpan={5}><EmptyFilteredState /></td></tr>
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
        onSuccess={() => {
          setAppointmentForPayment(null);
          onRefresh?.();
        }}
      />
    </>
  );
}
