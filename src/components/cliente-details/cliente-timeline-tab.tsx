"use client";

import { Badge } from "@/components/ui/badge";
import { User, Calendar, Clock, CheckCircle2, Activity } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClienteTimelineTabProps {
  appointments: any[];
  isLoading: boolean;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ClienteTimelineTab({ appointments, isLoading }: ClienteTimelineTabProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent mb-3" />
        <p className="text-sm font-medium">Carregando histórico…</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">Nenhum histórico</p>
        <p className="text-xs text-muted-foreground">Este paciente ainda não realizou consultas.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-1">
        {appointments.map((apt: any) => {
          const isCompleted = apt.completed_at !== null;
          return (
            <div key={apt.id} className="relative flex gap-4 py-3 group">
              {/* Dot */}
              <div className="relative z-10 flex-shrink-0 mt-1">
                <div className={`w-[10px] h-[10px] rounded-full ring-2 ring-background ${
                  isCompleted ? "bg-emerald-500" : "bg-amber-500"
                }`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 -mt-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {apt.service?.code || "Procedimento"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {apt.professional?.name || "N/A"}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(apt.start_time), "dd/MM/yyyy 'às' HH:mm")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant="secondary" className={`text-[10px] px-2 py-0 h-5 font-medium border-0 ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}>
                      {isCompleted ? (
                        <><CheckCircle2 className="w-3 h-3 mr-1" /> Concluído</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" /> Agendado</>
                      )}
                    </Badge>
                    {apt.service?.price != null && (
                      <span className="font-mono text-xs font-medium text-muted-foreground">
                        {currencyFormatter.format(apt.service.price)}
                      </span>
                    )}
                  </div>
                </div>

                {isCompleted && apt.completed_at && (
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    Concluído {formatDistanceToNow(new Date(apt.completed_at), { addSuffix: true, locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
