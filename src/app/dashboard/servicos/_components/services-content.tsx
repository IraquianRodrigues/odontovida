"use client";

import { useServices } from "@/services/services/use-services";
import { Card } from "@/components/ui/card";
import { ServicesTable } from "./services-table";

export default function ServicesContent() {
  const { data: services = [], isLoading, error } = useServices();

  return (
    <div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Serviços</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie os serviços cadastrados
          </p>
        </div>

        {error ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-destructive">
                Erro ao carregar serviços. Por favor, tente novamente.
              </p>
            </div>
          </Card>
        ) : (
          <ServicesTable services={services} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}

