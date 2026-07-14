"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays,
  CircleCheckBig,
  Clock3,
  Plus,
  Radio,
} from "lucide-react";
import { formatDateFullBR } from "@/lib/date-utils";
import { useAppointments } from "@/services/appointments/use-appointments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FloatingActionButton } from "@/components/floating-action-button";
import { AppointmentsTable } from "./appointments-table";
import { DatePickerButton } from "./date-picker-button";

const NewAppointmentModal = dynamic(
  () =>
    import("@/components/new-appointment-modal").then(
      (mod) => mod.NewAppointmentModal
    ),
  { ssr: false }
);

export default function DashboardContent() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] =
    useState(false);

  const {
    data: appointments = [],
    isLoading,
    error,
    refetch: refetchAppointments,
  } = useAppointments({ date: selectedDate });

  const stats = useMemo(() => {
    const confirmedStatuses = new Set(["confirmed", "scheduled", "agendado"]);
    const confirmed = appointments.filter((appointment) =>
      confirmedStatuses.has(appointment.status)
    ).length;

    return {
      total: appointments.length,
      confirmed,
      waiting: Math.max(appointments.length - confirmed, 0),
    };
  }, [appointments]);

  const metrics = [
    {
      label: "Agenda do dia",
      value: stats.total,
      detail: "agendamentos ativos",
      icon: CalendarDays,
    },
    {
      label: "Confirmados",
      value: stats.confirmed,
      detail: "prontos para atendimento",
      icon: CircleCheckBig,
    },
    {
      label: "Aguardando",
      value: stats.waiting,
      detail: "aguardando confirmação",
      icon: Clock3,
    },
  ];

  const openNewAppointment = () => setIsNewAppointmentModalOpen(true);

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Visão geral
            </h1>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {formatDateFullBR(selectedDate)}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground">
              <Radio className="h-3.5 w-3.5 text-primary" />
              Atualização em tempo real
            </div>
            <DatePickerButton
              date={selectedDate}
              onDateChange={setSelectedDate}
            />
            <Button
              onClick={openNewAppointment}
              className="hidden h-10 gap-2 rounded-lg px-4 sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              Novo agendamento
            </Button>
          </div>
        </section>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : (
          !error && (
            <section className="grid gap-3 sm:grid-cols-3">
              {metrics.map(({ label, value, detail, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground">
                        {value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {detail}
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )
        )}

        {error ? (
          <Card className="rounded-xl border-border p-10 text-center shadow-none">
            <p className="font-medium text-destructive">
              Erro ao carregar agendamentos
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente novamente em alguns instantes.
            </p>
          </Card>
        ) : (
          <AppointmentsTable
            appointments={appointments}
            isLoading={isLoading}
            onRefresh={refetchAppointments}
          />
        )}

        <FloatingActionButton onClick={openNewAppointment} />

        <NewAppointmentModal
          isOpen={isNewAppointmentModalOpen}
          onClose={() => setIsNewAppointmentModalOpen(false)}
          onSuccess={() => {
            refetchAppointments();
            setIsNewAppointmentModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
