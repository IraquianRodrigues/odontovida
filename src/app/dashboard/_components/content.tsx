"use client";

import { useState } from "react";
import { formatDateFullBR } from "@/lib/date-utils";
import { AppointmentsTable } from "./appointments-table";
import { DatePickerButton } from "./date-picker-button";
import { useAppointments } from "@/services/appointments/use-appointments";
import { Card } from "@/components/ui/card";

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

  return (
    <div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {formatDateFullBR(selectedDate)}
            </p>
          </div>
          <DatePickerButton
            date={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {error ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-destructive">
                Erro ao carregar agendamentos. Por favor, tente novamente.
              </p>
            </div>
          </Card>
        ) : (
          <AppointmentsTable
            appointments={appointments}
            isLoading={isLoading}
            onRefresh={refetchAppointments}
            isRefreshing={isFetchingAppointments}
          />
        )}
      </div>
    </div>
  );
}
