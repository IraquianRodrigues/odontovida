import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { ServiceRow } from "@/types/database.types";

type ServiceDatabaseRow = Omit<ServiceRow, "code" | "price">;

export class ServicesService {
  private get supabase() {
    return createClient();
  }

  private toServiceRow(service: ServiceDatabaseRow): ServiceRow {
    return { ...service, code: service.name, price: null };
  }

  async getServices(): Promise<ServiceRow[]> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      logger.error("Erro ao buscar serviÃ§os:", error);
      throw new Error("Falha ao buscar serviÃ§os");
    }

    return (data || []).map((service) => this.toServiceRow(service));
  }

  async getServiceById(id: number): Promise<ServiceRow | null> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      logger.error("Erro ao buscar serviÃ§o:", error);
      throw new Error("Falha ao buscar serviÃ§o");
    }

    return data ? this.toServiceRow(data) : null;
  }

  // Compatibilidade para chamadas antigas: o nome Ã© o identificador exibido.
  async getServiceByCode(name: string): Promise<ServiceRow | null> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .eq("name", name)
      .maybeSingle();

    if (error) {
      logger.error("Erro ao buscar serviÃ§o:", error);
      return null;
    }

    return data ? this.toServiceRow(data) : null;
  }

  async createService(params: {
    name: string;
    duration_minutes: number;
    description?: string | null;
    active?: boolean;
  }): Promise<ServiceRow> {
    const { data, error } = await this.supabase
      .from("services")
      .insert({
        name: params.name.trim(),
        duration_minutes: params.duration_minutes,
        description: params.description?.trim() || null,
        active: params.active ?? true,
      })
      .select()
      .single();

    if (error) {
      logger.error("Erro ao criar serviÃ§o:", error);
      throw new Error("Falha ao criar serviÃ§o");
    }

    return this.toServiceRow(data);
  }

  async updateService(params: {
    id: number;
    name: string;
    duration_minutes: number;
    description?: string | null;
    active?: boolean;
  }): Promise<ServiceRow> {
    const { data, error } = await this.supabase
      .from("services")
      .update({
        name: params.name.trim(),
        duration_minutes: params.duration_minutes,
        description: params.description?.trim() || null,
        ...(params.active === undefined ? {} : { active: params.active }),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      logger.error("Erro ao atualizar serviÃ§o:", error);
      throw new Error("Falha ao atualizar serviÃ§o");
    }

    return this.toServiceRow(data);
  }

  async deleteService(id: number): Promise<void> {
    const { error } = await this.supabase.from("services").delete().eq("id", id);

    if (error) {
      logger.error("Erro ao deletar serviÃ§o:", error);
      throw new Error("Falha ao deletar serviÃ§o");
    }
  }
}

export const servicesService = new ServicesService();
