import { createClient } from "@/lib/supabase/client";
import type { ProfessionalRow } from "@/types/database.types";

export class ProfessionalsService {
  private supabase = createClient();

  /**
   * Busca todos os profissionais
   */
  async getProfessionals(): Promise<ProfessionalRow[]> {
    const { data, error } = await this.supabase
      .from("professionals")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar profissionais:", error);
      throw new Error("Falha ao buscar profissionais");
    }

    return data || [];
  }

  /**
   * Busca um profissional específico por ID
   */
  async getProfessionalById(id: number): Promise<ProfessionalRow | null> {
    const { data, error } = await this.supabase
      .from("professionals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar profissional:", error);
      throw new Error("Falha ao buscar profissional");
    }

    return data;
  }

  /**
   * Busca um profissional específico por código
   */
  async getProfessionalByCode(code: string): Promise<ProfessionalRow | null> {
    const { data, error } = await this.supabase
      .from("professionals")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      console.error("Erro ao buscar profissional:", error);
      return null;
    }

    return data;
  }

  /**
   * Cria um novo profissional
   */
  async createProfessional(params: { name: string; specialty: string | null }): Promise<ProfessionalRow> {
    // Gera o código a partir do nome (remove espaços, converte para minúsculas e substitui por hífen)
    const code = params.name.toLowerCase().trim().replace(/\s+/g, "-");

    const { data, error } = await this.supabase
      .from("professionals")
      .insert({ name: params.name, code, specialty: params.specialty })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar profissional:", error);
      throw new Error("Falha ao criar profissional");
    }

    return data;
  }

  /**
   * Atualiza o nome e especialidade de um profissional
   */
  async updateProfessional(params: { id: number; name: string; specialty: string | null }): Promise<ProfessionalRow> {
    // Gera o novo código a partir do novo nome
    const code = params.name.toLowerCase().trim().replace(/\s+/g, "-");

    const { data, error } = await this.supabase
      .from("professionals")
      .update({ name: params.name, code, specialty: params.specialty })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar profissional:", error);
      throw new Error("Falha ao atualizar profissional");
    }

    return data;
  }

  /**
   * Deleta um profissional
   */
  async deleteProfessional(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("professionals")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar profissional:", error);
      throw new Error("Falha ao deletar profissional");
    }
  }
}

export const professionalsService = new ProfessionalsService();
