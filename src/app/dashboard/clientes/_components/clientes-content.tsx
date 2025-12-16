"use client";

import { ClientesTable } from "./clientes-table";
import { useClientes } from "@/services/clientes/use-clientes";
import { Card } from "@/components/ui/card";

export default function ClientesContent() {
  const { data: clientes = [], isLoading, error } = useClientes();

  return (
    <div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Clientes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie os clientes cadastrados
          </p>
        </div>

        {error ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-destructive">
                Erro ao carregar clientes. Por favor, tente novamente.
              </p>
            </div>
          </Card>
        ) : (
          <ClientesTable clientes={clientes} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
