"use client";

import { Bot, Loader2, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CrmLeadStage } from "@/types/database.types";
import { CRM_STAGES } from "@/services/crm/crm.service";
import { useCrmLeads, useMoveCrmLeadStage } from "@/services/crm/use-crm-leads";

const manualActions: Partial<Record<CrmLeadStage, CrmLeadStage[]>> = {
  agendamento_confirmado: ["compareceu", "nao_compareceu", "atendimento_humano"],
  compareceu: ["fechado", "atendimento_humano"],
  nao_compareceu: ["atendimento_humano", "perdido"],
  atendimento_humano: ["fechado", "perdido"],
};

const stageLabel = new Map(CRM_STAGES.map((stage) => [stage.value, stage.label]));

export default function CrmPipelineContent() {
  const { data: leads = [], isLoading, error } = useCrmLeads();
  const moveStage = useMoveCrmLeadStage();

  const moveLead = async (leadId: string, toStage: CrmLeadStage) => {
    try {
      await moveStage.mutateAsync({ leadId, toStage });
      toast.success(`Lead movido para ${stageLabel.get(toStage)}.`);
    } catch (moveError) {
      toast.error(
        moveError instanceof Error ? moveError.message : "Não foi possível atualizar o lead."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 flex justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <Card className="p-6 text-sm text-destructive">
          Não foi possível carregar a pipeline. Verifique a configuração no Supabase.
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-muted/40 p-6 lg:p-10 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          A IA conduz até o agendamento confirmado. As etapas seguintes são atualizadas pela equipe.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {CRM_STAGES.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage.value);

          return (
            <section key={stage.value} className="w-72 shrink-0 space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {stage.automated ? (
                    <Bot className="h-4 w-4 text-primary" />
                  ) : (
                    <UserRound className="h-4 w-4 text-amber-600" />
                  )}
                  <span>{stage.label}</span>
                </div>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {stageLeads.length}
                </span>
              </div>

              <div className="min-h-40 space-y-3 rounded-xl border border-border/70 bg-background/60 p-3">
                {stageLeads.map((lead) => {
                  const actions = manualActions[lead.stage] ??
                    (stage.value !== "fechado" && stage.value !== "perdido"
                      ? ["atendimento_humano" as CrmLeadStage]
                      : []);

                  return (
                    <Card key={lead.id} className="space-y-3 p-3 shadow-sm">
                      <div>
                        <p className="font-medium leading-tight">
                          {lead.cliente?.nome || "Cliente não encontrado"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {lead.cliente?.telefone || "Sem telefone"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {actions.map((action) => (
                          <Button
                            key={action}
                            size="sm"
                            variant={action === "atendimento_humano" ? "outline" : "secondary"}
                            disabled={moveStage.isPending}
                            onClick={() => moveLead(lead.id, action)}
                          >
                            {stageLabel.get(action)}
                          </Button>
                        ))}
                      </div>
                    </Card>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="flex h-24 flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                    <UsersRound className="h-5 w-5" />
                    Nenhum lead nesta etapa
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
