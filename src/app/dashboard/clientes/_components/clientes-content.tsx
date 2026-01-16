"use client";

import { ClientesTable } from "./clientes-table";
import { useClientes } from "@/services/clientes/use-clientes";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { Users, UserCheck, UserX, AlertCircle } from "lucide-react";
import { StatCard } from "@/app/dashboard/_components/stat-card";

export default function ClientesContent() {
  const { data: clientes = [], isLoading, error } = useClientes();

  const stats = useMemo(() => {
    const total = clientes.length;
    const active = clientes.filter((cliente) => !cliente.trava).length;
    const blocked = clientes.filter((cliente) => cliente.trava).length;
    
    // Calculate percentages
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
    const blockedRate = total > 0 ? Math.round((blocked / total) * 100) : 0;

    return { total, active, blocked, activeRate, blockedRate };
  }, [clientes]);

  return (
    <div className="min-h-screen bg-muted/40 transition-colors duration-300">
      <div className="container mx-auto p-4 lg:p-10 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors">
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground font-medium transition-colors">
            Gerencie os clientes cadastrados no sistema
          </p>
        </div>

        {/* Stats Cards */}
        {!isLoading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Card */}
            <StatCard
              title="Total de Clientes"
              value={stats.total}
              icon={Users}
              variant="blue"
              progress={100}
              delay={0}
            />

            {/* Active Card */}
            <StatCard
              title="Clientes Ativos"
              value={stats.active}
              icon={UserCheck}
              variant="green"
              progress={stats.activeRate}
              delay={100}
            />

            {/* Blocked Card */}
            <StatCard
              title="Bloqueados"
              value={stats.blocked}
              icon={UserX}
              variant="red"
              progress={stats.blockedRate}
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
        {error ? (
          <Card className="p-12 border border-border shadow-sm rounded-2xl bg-card transition-colors">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center transition-colors">
                <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium transition-colors">
                Erro ao carregar clientes
              </p>
              <p className="text-sm text-muted-foreground transition-colors">
                Por favor, tente novamente mais tarde.
              </p>
            </div>
          </Card>
        ) : (
          <div className="bg-card rounded-2xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-none">
            <ClientesTable clientes={clientes} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
