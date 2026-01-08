"use client";

import { useProfessionals } from "@/services/professionals/use-professionals";
import { Card } from "@/components/ui/card";
import { ProfessionalsTable } from "./professionals-table";

export default function ProfessionalsContent() {
  const { data: professionals = [], isLoading, error } = useProfessionals();

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

        {error ? (
          <Card className="p-12 border border-border shadow-sm rounded-2xl bg-card transition-colors">
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
    </div>
  );
}
