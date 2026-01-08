"use client";

import { useState, useMemo } from "react";
import { formatDateFullBR } from "@/lib/date-utils";
import { AppointmentsTable } from "./appointments-table";
import { DatePickerButton } from "./date-picker-button";
import { useAppointments } from "@/services/appointments/use-appointments";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react";
// import { AppointmentsKanban } from "./appointments-kanban";

export default function DashboardContent() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    data: appointments = [],
    isLoading,
    error,
    refetch: refetchAppointments,
    isFetching: isFetchingAppointments,
  } = useAppointments({
    date: selectedDate,
  });

  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(apt => apt.completed_at !== null).length;
    const pending = appointments.filter(apt => apt.completed_at === null).length;

    return { total, completed, pending };
  }, [appointments]);

  return (
    <div className="min-h-screen bg-muted/40 transition-colors duration-300">
      <div className="container mx-auto p-6 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground font-medium transition-colors">
              Visão geral de {formatDateFullBR(selectedDate)}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-card p-1 rounded-xl border border-border shadow-sm transition-colors">
            <DatePickerButton
              date={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </div>

        {/* Cards de Estatísticas */}
        {!isLoading && !error && (
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Total Card */}
            <div className="p-6 bg-card rounded-[24px] border border-border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1 dark:shadow-none">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors">
                  <Calendar className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide transition-colors">
                    Total
                  </p>
                  <p className="text-3xl font-bold text-card-foreground tracking-tight transition-colors">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            {/* Completed Card */}
            <div className="p-6 bg-card rounded-[24px] border border-border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1 dark:shadow-none">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide transition-colors">
                    Concluídos
                  </p>
                  <p className="text-3xl font-bold text-card-foreground tracking-tight transition-colors">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Card */}
            <div className="p-6 bg-card rounded-[24px] border border-border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1 dark:shadow-none">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 transition-colors">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide transition-colors">
                    Pendentes
                  </p>
                  <p className="text-3xl font-bold text-card-foreground tracking-tight transition-colors">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {error ? (
            <Card className="p-12 border border-border shadow-sm rounded-2xl bg-card transition-colors">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center transition-colors">
                  <Users className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400 font-medium transition-colors">
                  Erro ao carregar agendamentos
                </p>
                <p className="text-sm text-muted-foreground transition-colors">
                  Por favor, tente novamente mais tarde.
                </p>
              </div>
            </Card>
          ) : (
            <div className="bg-card rounded-2xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden transition-colors dark:shadow-none">
              <AppointmentsTable
                appointments={appointments}
                isLoading={isLoading}
                onRefresh={refetchAppointments}
                isRefreshing={isFetchingAppointments}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
