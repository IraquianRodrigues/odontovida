"use client";

import { Textarea } from "@/components/ui/textarea";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";
import type { ClienteRow } from "@/types/database.types";
import type { ClienteStats } from "./cliente-stats-cards";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClienteOverviewTabProps {
  cliente: ClienteRow;
  isLocked: boolean;
  stats: ClienteStats;
  notes: string;
  onNotesChange: (value: string) => void;
  onNotesBlur: () => void;
  isSaving: boolean;
}

export function ClienteOverviewTab({
  cliente,
  isLocked,
  stats,
  notes,
  onNotesChange,
  onNotesBlur,
  isSaving,
}: ClienteOverviewTabProps) {
  return (
    <div className="space-y-5">
      {/* Info cards row */}
      <div className="grid sm:grid-cols-2 gap-3">
        {/* Account status */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Status da Conta
          </p>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isLocked ? "bg-destructive animate-pulse" : "bg-emerald-500"}`} />
            <span className="text-sm font-medium text-foreground">
              {isLocked ? "Bloqueado" : "Ativo e Regular"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Cliente desde {format(new Date(cliente.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* Next appointment */}
        {stats.nextAppointment && (
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Próxima Consulta
            </p>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {format(new Date(stats.nextAppointment.start_time), "dd/MM/yyyy 'às' HH:mm")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {stats.nextAppointment.service?.code || "Procedimento"}
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Anotações
          </p>
          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Salvando…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Salvo
              </>
            )}
          </span>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onBlur={onNotesBlur}
          placeholder="Adicione observações importantes sobre o paciente…"
          className="min-h-[120px] bg-muted/30 border-border resize-none text-sm leading-relaxed p-4 rounded-lg focus-visible:ring-1 focus-visible:ring-ring transition-colors"
        />
      </div>
    </div>
  );
}
