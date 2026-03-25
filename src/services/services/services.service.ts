import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { ServiceRow } from "@/types/database.types";

export class ServicesService {
  private get supabase() { return createClient(); }

  /**
   * Busca todos os serviços
   */
  async getServices(): Promise<ServiceRow[]> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      logger.error("Erro ao buscar serviços:", error);
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
      logger.error("Erro ao buscar serviço:", error);
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
      logger.error("Erro ao buscar serviço:", error);
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
    price?: number | null;
    description?: string | null;
  }): Promise<ServiceRow> {
    const { data, error } = await this.supabase
      .from("services")
      .insert({
        code: params.code,
        duration_minutes: params.duration_minutes,
        price: params.price ?? null,
        description: params.description?.trim() ? params.description.trim() : null,
      })
      .select()
      .single();

    if (error) {
      logger.error("Erro ao criar serviço:", error);
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
    price?: number | null;
    description?: string | null;
  }): Promise<ServiceRow> {
    const { data, error } = await this.supabase
      .from("services")
      .update({
        code: params.code,
        duration_minutes: params.duration_minutes,
        price: params.price ?? null,
        description: params.description?.trim() ? params.description.trim() : null,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      logger.error("Erro ao atualizar serviço:", error);
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
      logger.error("Erro ao deletar serviço:", error);
      throw new Error("Falha ao deletar serviço");
    }
  }
}

export const servicesService = new ServicesService();

