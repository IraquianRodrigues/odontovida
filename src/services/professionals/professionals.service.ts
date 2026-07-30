import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { ProfessionalRow } from "@/types/database.types";

type ProfessionalDatabaseRow = Omit<ProfessionalRow, "code">;

export class ProfessionalsService {
  private get supabase() {
    return createClient();
  }

  private toProfessionalRow(professional: ProfessionalDatabaseRow): ProfessionalRow {
    return { ...professional, code: professional.name };
  }

  async getProfessionals(): Promise<ProfessionalRow[]> {
    const { data, error } = await this.supabase
      .from("professionals")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      logger.error("Erro ao buscar profissionais:", error);
      throw new Error("Falha ao buscar profissionais");
    }

    return (data || []).map((professional) => this.toProfessionalRow(professional));
  }

  async getProfessionalById(id: number): Promise<ProfessionalRow | null> {
    const { data, error } = await this.supabase
      .from("professionals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      logger.error("Erro ao buscar profissional:", error);
      throw new Error("Falha ao buscar profissional");
    }

    return data ? this.toProfessionalRow(data) : null;
  }

  async getProfessionalByCode(name: string): Promise<ProfessionalRow | null> {
    const { data, error } = await this.supabase
      .from("professionals")
      .select("*")
      .eq("name", name)
      .maybeSingle();

    if (error) {
      logger.error("Erro ao buscar profissional:", error);
      return null;
    }

    return data ? this.toProfessionalRow(data) : null;
  }

  async createProfessional(params: {
    name: string;
    specialty: string | null;
    active?: boolean;
  }): Promise<ProfessionalRow> {
    const { data, error } = await this.supabase
      .from("professionals")
      .insert({
        name: params.name.trim(),
        specialty: params.specialty,
        active: params.active ?? true,
      })
      .select()
      .single();

    if (error) {
      logger.error("Erro ao criar profissional:", error);
      throw new Error("Falha ao criar profissional");
    }

    return this.toProfessionalRow(data);
  }

  async updateProfessional(params: {
    id: number;
    name: string;
    specialty: string | null;
    active?: boolean;
  }): Promise<ProfessionalRow> {
    const { data, error } = await this.supabase
      .from("professionals")
      .update({
        name: params.name.trim(),
        specialty: params.specialty,
        ...(params.active === undefined ? {} : { active: params.active }),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      logger.error("Erro ao atualizar profissional:", error);
      throw new Error("Falha ao atualizar profissional");
    }

    return this.toProfessionalRow(data);
  }

  async deleteProfessional(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("professionals")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Erro ao deletar profissional:", error);
      throw new Error("Falha ao deletar profissional");
    }
  }
}

export const professionalsService = new ProfessionalsService();
