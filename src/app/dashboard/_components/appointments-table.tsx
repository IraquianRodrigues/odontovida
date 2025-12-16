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
import { Search, Loader2, RefreshCw } from "lucide-react";
import type { AppointmentWithRelations } from "@/types/database.types";
import { formatTimeBR } from "@/lib/date-utils";
import { AppointmentDetailsModal } from "@/components/appointment-details-modal";
import { useProfessionals } from "@/services/professionals/use-professionals";

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
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </div>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-muted-foreground">
            Nenhum agendamento encontrado para esta data
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Agendamentos do Dia</h2>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie os atendimentos agendados
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedProfessionalId}
                onValueChange={setSelectedProfessionalId}
                disabled={isLoadingProfessionals}
              >
                <SelectTrigger className="w-full sm:w-[250px]">
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
              <tr className="border-y bg-muted/30">
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Cliente
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Telefone
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Horário Início
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Horário Fim
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-muted-foreground"
                  >
                    Nenhum agendamento encontrado para esta data
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => {
                  return (
                    <tr
                      key={appointment.id}
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-medium">
                          {appointment.customer_name}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {appointment.customer_phone}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {formatTimeBR(appointment.start_time)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {formatTimeBR(appointment.end_time)}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAppointment(appointment)}
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
