import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { ServiceRow } from "@/types/database.types";

type ServiceDbRow = {
  id: string;
  service_code: number;
  created_at: string;
  nome: string;
  duracao_minutos: number;
  valor_reserva: number | null;
  valor_integral: number | null;
  ativo: boolean;
};

const toService = (row: ServiceDbRow): ServiceRow => ({
  id: row.service_code,
  database_id: row.id,
  created_at: row.created_at,
  code: String(row.service_code),
  duration_minutes: row.duracao_minutos,
  price: row.valor_reserva ?? row.valor_integral,
  description: row.nome,
  active: row.ativo,
});

const parseCode = (code: string) => {
  const value = Number(code);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("O código do serviço deve ser um número inteiro positivo");
  }
  return value;
};

export class ServicesService {
  private get supabase() { return createClient(); }

  async getServices(): Promise<ServiceRow[]> {
    const { data, error } = await this.supabase.from("services").select("*").order("service_code");
    if (error) throw new Error("Falha ao buscar serviços");
    return ((data || []) as ServiceDbRow[]).map(toService);
  }

  async getServiceById(id: number): Promise<ServiceRow | null> {
    const { data, error } = await this.supabase.from("services").select("*").eq("service_code", id).maybeSingle();
    if (error) throw new Error("Falha ao buscar serviço");
    return data ? toService(data as ServiceDbRow) : null;
  }

  async getServiceByCode(code: string): Promise<ServiceRow | null> {
    return this.getServiceById(parseCode(code));
  }

  async createService(params: { code: string; duration_minutes: number; price?: number | null; description?: string | null }): Promise<ServiceRow> {
    const serviceCode = parseCode(params.code);
    const { data, error } = await this.supabase.from("services").insert({
      service_code: serviceCode,
      nome: params.description?.trim() || `Serviço ${serviceCode}`,
      duracao_minutos: params.duration_minutes,
      valor_reserva: params.price ?? null,
    }).select().single();
    if (error) {
      logger.error("Erro ao criar serviço:", error);
      throw new Error("Falha ao criar serviço");
    }
    return toService(data as ServiceDbRow);
  }

  async updateService(params: { id: number; code: string; duration_minutes: number; price?: number | null; description?: string | null }): Promise<ServiceRow> {
    const { data, error } = await this.supabase.from("services").update({
      service_code: parseCode(params.code),
      nome: params.description?.trim() || `Serviço ${params.code}`,
      duracao_minutos: params.duration_minutes,
      valor_reserva: params.price ?? null,
    }).eq("service_code", params.id).select().single();
    if (error) throw new Error("Falha ao atualizar serviço");
    return toService(data as ServiceDbRow);
  }

  async deleteService(id: number): Promise<void> {
    const { error } = await this.supabase.from("services").delete().eq("service_code", id);
    if (error) throw new Error("Falha ao excluir serviço");
  }
}

export const servicesService = new ServicesService();
