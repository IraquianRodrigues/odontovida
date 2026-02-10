"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ClienteStats {
  totalInvestido: number;
  totalVisitas: number;
  visitasConcluidas: number;
  avgTicket: number;
  lastVisit: Date | null;
  nextAppointment: any;
}

interface ClienteStatsCardsProps {
  stats: ClienteStats;
}

const fmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-0 text-center py-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-lg font-semibold text-foreground tabular-nums truncate">{value}</p>
    </div>
  );
}

function Divider() {
  return <div className="w-px bg-border self-stretch my-2" />;
}

export function ClienteStatsCards({ stats }: ClienteStatsCardsProps) {
  return (
    <div className="mx-6 sm:mx-8 mt-4 flex-shrink-0">
      <div className="flex items-center bg-muted/50 rounded-lg border border-border overflow-hidden">
        <Stat label="Investido" value={fmt.format(stats.totalInvestido)} />
        <Divider />
        <Stat label="Consultas" value={String(stats.totalVisitas)} />
        <Divider />
        <Stat label="Ticket Médio" value={fmt.format(stats.avgTicket)} />
        <Divider />
        <Stat
          label="Última Visita"
          value={stats.lastVisit ? formatDistanceToNow(stats.lastVisit, { addSuffix: false, locale: ptBR }) : "—"}
        />
      </div>
    </div>
  );
}
