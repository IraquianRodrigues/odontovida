import { createClient } from "@/lib/supabase/client";
import type {
  ClienteRow,
  CrmLeadActor,
  CrmLeadRow,
  CrmLeadStage,
  CrmLeadWithCliente,
} from "@/types/database.types";

export const CRM_STAGES: Array<{ value: CrmLeadStage; label: string; automated: boolean }> = [
  { value: "novo_lead", label: "Novo lead", automated: true },
  { value: "primeiro_contato", label: "Primeiro contato", automated: true },
  { value: "follow_up", label: "Follow-up", automated: true },
  { value: "qualificado", label: "Qualificado", automated: true },
  { value: "agendamento_confirmado", label: "Agendamento confirmado", automated: true },
  { value: "compareceu", label: "Compareceu", automated: false },
  { value: "nao_compareceu", label: "Não compareceu", automated: false },
  { value: "atendimento_humano", label: "Atendimento humano", automated: false },
  { value: "fechado", label: "Fechado", automated: false },
  { value: "perdido", label: "Perdido", automated: false },
];

export const HUMAN_STAGES = new Set<CrmLeadStage>(
  CRM_STAGES.filter((stage) => !stage.automated).map((stage) => stage.value)
);

export class CrmService {
  private get supabase() {
    return createClient();
  }

  async getLeads(): Promise<CrmLeadWithCliente[]> {
    const { data: leads, error } = await this.supabase
      .from("crm_leads")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw new Error("Falha ao carregar a pipeline do CRM");

    const clienteIds = [...new Set((leads || []).map((lead) => lead.cliente_id))];
    if (clienteIds.length === 0) return [];

    const { data: clientes, error: clientesError } = await this.supabase
      .from("clientes")
      .select("id, nome, telefone")
      .in("id", clienteIds);

    if (clientesError) throw new Error("Falha ao carregar os clientes do CRM");

    const clientesById = new Map(
      (clientes || []).map((cliente) => [cliente.id, cliente])
    );

    return (leads || []).map((lead) => ({
      ...lead,
      cliente:
        (clientesById.get(lead.cliente_id) as Pick<
          ClienteRow,
          "id" | "nome" | "telefone"
        > | undefined) ?? null,
    }));
  }

  async moveLeadStage({
    leadId,
    toStage,
    note,
  }: {
    leadId: string;
    toStage: CrmLeadStage;
    note?: string;
  }): Promise<CrmLeadRow> {
    if (!HUMAN_STAGES.has(toStage)) {
      throw new Error("As etapas até agendamento confirmado são controladas pela IA.");
    }

    const { data: currentLead, error: currentLeadError } = await this.supabase
      .from("crm_leads")
      .select("id, stage")
      .eq("id", leadId)
      .single();

    if (currentLeadError || !currentLead) {
      throw new Error("Lead não encontrado");
    }

    const now = new Date().toISOString();
    const stageTimestamps: Partial<CrmLeadRow> = {
      ...(toStage === "atendimento_humano" ? { human_takeover_at: now } : {}),
      ...(toStage === "fechado" || toStage === "perdido" ? { closed_at: now } : {}),
    };

    const { data: lead, error } = await this.supabase
      .from("crm_leads")
      .update({
        stage: toStage,
        last_stage_actor: "human" as CrmLeadActor,
        ...stageTimestamps,
      })
      .eq("id", leadId)
      .select()
      .single();

    if (error) throw new Error("Falha ao atualizar a etapa do lead");

    const { error: historyError } = await this.supabase
      .from("crm_lead_history")
      .insert({
        lead_id: leadId,
        from_stage: currentLead.stage,
        to_stage: toStage,
        actor_type: "human",
        source: "dashboard",
        note: note?.trim() || null,
      });

    if (historyError) {
      throw new Error("A etapa foi alterada, mas não foi possível registrar o histórico");
    }

    return lead;
  }
}

export const crmService = new CrmService();
