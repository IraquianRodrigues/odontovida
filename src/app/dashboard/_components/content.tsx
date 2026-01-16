"use client";

import { useState, useMemo } from "react";
import { formatDateFullBR } from "@/lib/date-utils";
import { AppointmentsTable } from "./appointments-table";
import { DatePickerButton } from "./date-picker-button";
import { useAppointments } from "@/services/appointments/use-appointments";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react";
import { StatCard } from "./stat-card";

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
    
    // Calculate completion percentage
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;

    return { total, completed, pending, completionRate, pendingRate };
  }, [appointments]);

  return (
    <div className="min-h-screen bg-muted/40 transition-colors duration-300">
      <div className="container mx-auto p-4 lg:p-10 space-y-8">
        {/* Header */}
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

        {/* Stats Cards */}
        {!isLoading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Card */}
            <StatCard
              title="Total de Agendamentos"
              value={stats.total}
              icon={Calendar}
              variant="blue"
              progress={100}
              delay={0}
            />

            {/* Completed Card */}
            <StatCard
              title="Concluídos"
              value={stats.completed}
              icon={CheckCircle2}
              variant="green"
              progress={stats.completionRate}
              delay={100}
            />

            {/* Pending Card */}
            <StatCard
              title="Pendentes"
              value={stats.pending}
              icon={Clock}
              variant="orange"
              progress={stats.pendingRate}
              delay={200}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[160px] rounded-[24px] border border-border bg-card animate-pulse"
              >
                <div className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 rounded bg-muted/50" />
                    <div className="h-8 w-16 rounded bg-muted/50" />
                  </div>
                </div>
              </div>
            ))}
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
            <div className="bg-card rounded-2xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-none">
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
