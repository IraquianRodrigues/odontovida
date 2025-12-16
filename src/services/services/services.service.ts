import { createClient } from "@/lib/supabase/client";
import type { ServiceRow } from "@/types/database.types";

export class ServicesService {
  private supabase = createClient();

  /**
   * Busca todos os serviços
   */
  async getServices(): Promise<ServiceRow[]> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      console.error("Erro ao buscar serviços:", error);
      throw new Error("Falha ao buscar serviços");
    }

    return data || [];
  }

  /**
   * Busca um serviço específico por ID
   */
  async getServiceById(id: number): Promise<ServiceRow | null> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar serviço:", error);
      throw new Error("Falha ao buscar serviço");
    }

    return data;
  }

  /**
   * Busca um serviço específico por código
   */
  async getServiceByCode(code: string): Promise<ServiceRow | null> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      console.error("Erro ao buscar serviço:", error);
      return null;
    }

    return data;
  }

  /**
   * Cria um novo serviço
   */
  async createService(params: {
    code: string;
    duration_minutes: number;
  }): Promise<ServiceRow> {
    const { data, error } = await this.supabase
      .from("services")
      .insert({
        code: params.code,
        duration_minutes: params.duration_minutes,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar serviço:", error);
      throw new Error("Falha ao criar serviço");
    }

    return data;
  }

  /**
   * Atualiza um serviço
   */
  async updateService(params: {
    id: number;
    code: string;
    duration_minutes: number;
  }): Promise<ServiceRow> {
    const { data, error } = await this.supabase
      .from("services")
      .update({
        code: params.code,
        duration_minutes: params.duration_minutes,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar serviço:", error);
      throw new Error("Falha ao atualizar serviço");
    }

    return data;
  }

  /**
   * Deleta um serviço
   */
  async deleteService(id: number): Promise<void> {
    const { error } = await this.supabase.from("services").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar serviço:", error);
      throw new Error("Falha ao deletar serviço");
    }
  }
}

export const servicesService = new ServicesService();

