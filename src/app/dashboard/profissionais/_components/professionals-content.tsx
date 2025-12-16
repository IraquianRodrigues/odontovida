"use client";

import { useProfessionals } from "@/services/professionals/use-professionals";
import { Card } from "@/components/ui/card";
import { ProfessionalsTable } from "./professionals-table";

export default function ProfessionalsContent() {
  const { data: professionals = [], isLoading, error } = useProfessionals();

  return (
    <div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Profissionais</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie os profissionais cadastrados
          </p>
        </div>

        {error ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-destructive">
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
