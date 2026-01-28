"use client";

import { useState, useMemo } from "react";
import { formatDateFullBR } from "@/lib/date-utils";
import { AppointmentsTable } from "./appointments-table";
import { DatePickerButton } from "./date-picker-button";
import { useAppointments } from "@/services/appointments/use-appointments";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react";
import { StatCard } from "./stat-card";
import { FloatingActionButton } from "@/components/floating-action-button";
import { NewAppointmentModal } from "@/components/new-appointment-modal";

export default function DashboardContent() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);

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
      <div className="container mx-auto p-6 lg:p-12 space-y-10 lg:space-y-12">
        {/* Header - Premium refinement */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-1 w-12 bg-primary rounded-full" />
              <p className="text-sm text-muted-foreground font-medium">
                {formatDateFullBR(selectedDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-card p-1.5 rounded-sm border border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)]">
            <DatePickerButton
              date={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </div>

        {/* Stats Cards - Asymmetric Premium Layout */}
        {!isLoading && !error && (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {/* Hero Card - Total (Larger, prominent) */}
            <StatCard
              title="Total de Agendamentos"
              value={stats.total}
              icon={Calendar}
              progress={100}
              delay={0}
              variant="hero"
              className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
            />

            {/* Compact Cards - Secondary metrics */}
            <StatCard
              title="Concluídos"
              value={stats.completed}
              icon={CheckCircle2}
              progress={stats.completionRate}
              delay={100}
              variant="compact"
            />

            <StatCard
              title="Pendentes"
              value={stats.pending}
              icon={Clock}
              progress={stats.pendingRate}
              delay={200}
              variant="compact"
            />

            {/* Additional info card - spans 2 columns on larger screens */}
            <div className="sm:col-span-2 p-6 bg-card border border-border/50 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04)]">
              <style jsx>{`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                div {
                  animation: fadeIn 0.6s ease-out 0.3s forwards;
                  opacity: 0;
                }
              `}</style>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/5 rounded-sm">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Taxa de Conclusão
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-card-foreground tracking-tight">
                      {stats.completionRate}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      dos agendamentos
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block h-12 w-px bg-border/50" />
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-muted-foreground mb-1">Hoje</p>
                  <p className="text-lg font-semibold text-card-foreground">
                    {stats.total} total
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State - Premium skeleton */}
        {isLoading && (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Hero skeleton */}
            <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2 h-[280px] lg:h-full rounded-sm border border-border/50 bg-card animate-pulse">
              <div className="p-8 space-y-4">
                <div className="h-14 w-14 rounded-sm bg-muted/50" />
                <div className="space-y-2">
                  <div className="h-3 w-32 rounded bg-muted/50" />
                  <div className="h-12 w-24 rounded bg-muted/50" />
                </div>
              </div>
            </div>
            {/* Compact skeletons */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[140px] rounded-sm border border-border/50 bg-card animate-pulse"
              >
                <div className="p-5 space-y-3">
                  <div className="h-10 w-10 rounded-sm bg-muted/50" />
                  <div className="space-y-2">
                    <div className="h-2 w-20 rounded bg-muted/50" />
                    <div className="h-8 w-16 rounded bg-muted/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content - Premium table container */}
        <div className="flex flex-col gap-6">
          {error ? (
            <Card className="p-12 border border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04)] rounded-sm bg-card">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-sm flex items-center justify-center">
                  <Users className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Erro ao carregar agendamentos
                </p>
                <p className="text-sm text-muted-foreground">
                  Por favor, tente novamente mais tarde.
                </p>
              </div>
            </Card>
          ) : (
            <div className="bg-card rounded-sm border border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.06),0_16px_32px_rgba(0,0,0,0.08)]">
              <AppointmentsTable
                appointments={appointments}
                isLoading={isLoading}
                onRefresh={refetchAppointments}
                isRefreshing={isFetchingAppointments}
              />
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton onClick={() => setIsNewAppointmentModalOpen(true)} />

        {/* New Appointment Modal */}
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
