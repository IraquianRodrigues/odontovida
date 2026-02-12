"use client";

import { useProfessionals } from "@/services/professionals/use-professionals";
import { Card } from "@/components/ui/card";
import { ProfessionalsTable } from "./professionals-table";
import { Users, Award, UserCheck, Stethoscope } from "lucide-react";
import { useMemo } from "react";

const statCards = [
  {
    key: "total",
    label: "Total de Profissionais",
    icon: Users,
    iconBg: "bg-sky-100 dark:bg-sky-900/30",
    iconColor: "text-sky-600 dark:text-sky-400",
    accent: "border-l-sky-500",
  },
  {
    key: "specialties",
    label: "Especialidades",
    icon: Stethoscope,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    accent: "border-l-amber-500",
  },
  {
    key: "common",
    label: "Mais Comum",
    icon: Award,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    accent: "border-l-emerald-500",
  },
  {
    key: "active",
    label: "Ativos",
    icon: UserCheck,
    iconBg: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600 dark:text-teal-400",
    accent: "border-l-teal-500",
  },
] as const;

export default function ProfessionalsContent() {
  const { data: professionals = [], isLoading, error } = useProfessionals();

  const stats = useMemo(() => {
    const totalProfessionals = professionals.length;
    const specialties = professionals.reduce((acc, p) => {
      const specialty = p.specialty || "Geral";
      acc[specialty] = (acc[specialty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonSpecialty = Object.entries(specialties).sort((a, b) => b[1] - a[1])[0];
    const uniqueSpecialties = Object.keys(specialties).length;

    return {
      total: totalProfessionals,
      specialties: uniqueSpecialties,
      common: mostCommonSpecialty ? mostCommonSpecialty[0] : "N/A",
      commonCount: mostCommonSpecialty ? mostCommonSpecialty[1] : 0,
      active: totalProfessionals,
    };
  }, [professionals]);

  const getStatValue = (key: string) => {
    switch (key) {
      case "total": return stats.total;
      case "specialties": return stats.specialties;
      case "common": return stats.common;
      case "active": return stats.active;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 transition-colors duration-300">
      <div className="container mx-auto p-6 lg:p-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors">
            Profissionais
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1 transition-colors">
            Gerencie e organize a equipe de profissionais da clínica
          </p>
        </div>

        {/* Statistics Dashboard */}
        {!isLoading && !error && professionals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              const value = getStatValue(card.key);

              return (
                <Card
                  key={card.key}
                  className={`p-5 border-l-4 ${card.accent} hover:shadow-lg transition-all duration-300 group`}
                  style={{
                    animationDelay: `${index * 80}ms`,
                    animation: "fadeSlideUp 0.5s ease-out both",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {card.label}
                      </p>
                      <p className={`font-bold text-foreground mt-0.5 ${
                        card.key === "common" ? "text-base truncate" : "text-2xl tabular-nums"
                      }`}>
                        {value}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {error ? (
          <Card className="p-12 border border-border shadow-sm rounded-xl bg-card transition-colors">
            <div className="text-center space-y-3">
              <p className="text-red-600 dark:text-red-400 font-medium">
                Erro ao carregar profissionais. Por favor, tente novamente.
              </p>
            </div>
          </Card>
        ) : (
          <ProfessionalsTable
            professionals={professionals}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Keyframe animation for stat cards and professional cards */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  );
}
