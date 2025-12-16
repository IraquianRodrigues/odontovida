"use client";

import { Card } from "@/components/ui/card";
import { Calendar, CheckCircle2, XCircle, Users } from "lucide-react";
import type { Appointment } from "@/lib/mock-data";

interface StatsCardsProps {
  appointments: Appointment[];
}

export function StatsCards({ appointments }: StatsCardsProps) {
  const total = appointments.length;
  const scheduled = appointments.filter(
    (apt) => apt.status === "scheduled" || apt.status === "confirmed"
  ).length;
  const completed = appointments.filter(
    (apt) => apt.status === "completed"
  ).length;
  const cancelled = appointments.filter(
    (apt) => apt.status === "cancelled"
  ).length;

  const stats = [
    {
      label: "Total de Agendamentos",
      value: total,
      subtitle: "para hoje",
      icon: Calendar,
      iconColor: "text-gray-600",
    },
    {
      label: "Agendados",
      value: scheduled,
      subtitle: "aguardando atendimento",
      icon: Users,
      iconColor: "text-blue-600",
    },
    {
      label: "Concluídos",
      value: completed,
      subtitle: "atendimentos finalizados",
      icon: CheckCircle2,
      iconColor: "text-green-600",
    },
    {
      label: "Cancelados",
      value: cancelled,
      subtitle: "cancelamentos",
      icon: XCircle,
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
              <Icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
