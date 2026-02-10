"use client";

import { Calendar, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecordHistoryListProps {
  history: any[];
}

export function RecordHistoryList({ history }: RecordHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-muted/30 rounded-sm inline-block mb-4">
          <History className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-foreground font-semibold">Nenhum prontuário anterior encontrado</p>
        <p className="text-sm text-muted-foreground mt-1">Este é o primeiro atendimento do paciente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record) => (
        <div
          key={record.id}
          className="border border-border/50 rounded-sm overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)] bg-card"
        >
          <div className="p-4 border-b border-border/50 bg-gradient-to-br from-background to-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-sm">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {format(new Date(record.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dr(a). {record.professional?.name || "Não informado"}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {record.soap_subjective && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subjetivo:</p>
                <p className="text-sm text-foreground mt-1">{record.soap_subjective}</p>
              </div>
            )}
            {record.soap_assessment && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avaliação:</p>
                <p className="text-sm text-foreground mt-1">{record.soap_assessment}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
