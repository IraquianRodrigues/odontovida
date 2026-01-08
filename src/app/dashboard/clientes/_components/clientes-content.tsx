"use client";

import { ClientesTable } from "./clientes-table";
import { useClientes } from "@/services/clientes/use-clientes";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { Users, UserCheck, UserX, AlertCircle } from "lucide-react";

export default function ClientesContent() {
  const { data: clientes = [], isLoading, error } = useClientes();

  const stats = useMemo(() => {
    const total = clientes.length;
    const active = clientes.filter((cliente) => !cliente.trava).length;
    const blocked = clientes.filter((cliente) => cliente.trava).length;

    return { total, active, blocked };
  }, [clientes]);

  return (
    <div className="min-h-screen bg-muted/40 transition-colors duration-300">
      <div className="container mx-auto p-6 lg:p-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors">
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground font-medium transition-colors">
            Gerencie os clientes cadastrados no sistema
          </p>
        </div>

        {/* Cards de Estatísticas */}
        {!isLoading && !error && (
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="p-6 bg-card rounded-3xl border border-border shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 dark:shadow-none">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-card-foreground leading-none mb-1 transition-colors">
                      {stats.total}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground transition-colors">
                      Total de Clientes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card rounded-3xl border border-border shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 dark:shadow-none">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 transition-colors">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-card-foreground leading-none mb-1 transition-colors">
                      {stats.active}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground transition-colors">
                      Clientes Ativos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card rounded-3xl border border-border shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 dark:shadow-none">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 transition-colors">
                    <UserX className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-card-foreground leading-none mb-1 transition-colors">
                      {stats.blocked}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground transition-colors">
                      Bloqueados
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error ? (
          <Card className="p-12 border shadow-sm">
            <div className="text-center space-y-2">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-destructive font-medium">
                Erro ao carregar clientes
              </p>
              <p className="text-sm text-muted-foreground">
                Por favor, tente novamente mais tarde.
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
