import { createClient } from "@/lib/supabase/client";
import type { ProfessionalRow } from "@/types/database.types";

type ProfessionalDbRow = {
  id: string; professional_code: number; created_at: string; nome: string;
  especialidade: string | null; email: string | null; telefone: string | null; ativo: boolean;
};

const toProfessional = (row: ProfessionalDbRow): ProfessionalRow => ({
  id: row.professional_code,
  database_id: row.id,
  created_at: row.created_at,
  code: String(row.professional_code),
  name: row.nome,
  specialty: row.especialidade,
  email: row.email,
  phone: row.telefone,
  active: row.ativo,
});

export class ProfessionalsService {
  private get supabase() { return createClient(); }

  async getProfessionals(): Promise<ProfessionalRow[]> {
    const { data, error } = await this.supabase.from("professionals").select("*").order("professional_code");
    if (error) throw new Error("Falha ao buscar profissionais");
    return ((data || []) as ProfessionalDbRow[]).map(toProfessional);
  }

  async getProfessionalById(id: number): Promise<ProfessionalRow | null> {
    const { data, error } = await this.supabase.from("professionals").select("*").eq("professional_code", id).maybeSingle();
    if (error) throw new Error("Falha ao buscar profissional");
    return data ? toProfessional(data as ProfessionalDbRow) : null;
  }

  async getProfessionalByCode(code: string): Promise<ProfessionalRow | null> {
    const numericCode = Number(code);
    return Number.isInteger(numericCode) ? this.getProfessionalById(numericCode) : null;
  }

  async createProfessional(params: { name: string; specialty: string | null }): Promise<ProfessionalRow> {
    const { data, error } = await this.supabase.from("professionals").insert({
      nome: params.name,
      especialidade: params.specialty,
    }).select().single();
    if (error) throw new Error("Falha ao criar profissional");
    return toProfessional(data as ProfessionalDbRow);
  }

  async updateProfessional(params: { id: number; name: string; specialty: string | null }): Promise<ProfessionalRow> {
    const { data, error } = await this.supabase.from("professionals").update({
      nome: params.name,
      especialidade: params.specialty,
    }).eq("professional_code", params.id).select().single();
    if (error) throw new Error("Falha ao atualizar profissional");
    return toProfessional(data as ProfessionalDbRow);
  }

  async deleteProfessional(id: number): Promise<void> {
    const { error } = await this.supabase.from("professionals").delete().eq("professional_code", id);
    if (error) throw new Error("Falha ao excluir profissional");
  }
}

export const professionalsService = new ProfessionalsService();
