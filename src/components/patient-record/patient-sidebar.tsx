"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar, FileText, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PatientSummary } from "@/services/medical-records/medical-records.service";

interface PatientSidebarProps {
  clientData: { nome: string; telefone: string; email?: string; notes?: string };
  summary?: PatientSummary | null;
}

export function PatientSidebar({ clientData, summary }: PatientSidebarProps) {
  return (
    <aside className="w-80 flex-shrink-0 border-r border-border/50 bg-card overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Patient Name */}
        <div className="text-center pb-6 border-b border-border/50">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-1 w-12 bg-primary rounded-full" />
            <User className="h-5 w-5 text-primary" />
            <div className="h-1 w-12 bg-primary rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{clientData.nome}</h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium">{clientData.telefone}</p>
          {clientData.email && (
            <p className="text-xs text-muted-foreground mt-1">{clientData.email}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-muted/30 rounded-sm border border-border/50 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-primary/10 rounded-sm">
                <Calendar className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold truncate" title="Consultas">
                Consultas
              </p>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {summary?.total_appointments || 0}
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-sm border border-border/50 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-primary/10 rounded-sm">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold truncate" title="Prontuários">
                Prontuários
              </p>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {summary?.total_records || 0}
            </p>
          </div>
        </div>

        {/* Last Appointment */}
        {summary?.last_appointment && (
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Último Atendimento
            </Label>
            <Badge variant="outline" className="w-full justify-center mt-2 py-2 rounded-sm border-border/50 bg-muted/20">
              <Calendar className="h-3 w-3 mr-2" />
              <span className="tabular-nums">
                {format(new Date(summary.last_appointment), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </Badge>
          </div>
        )}

        {/* Notes */}
        {clientData?.notes && (
          <div className="p-4 bg-muted/30 rounded-sm border border-border/50">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Observações Gerais
            </Label>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {clientData.notes}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
