import { createClient } from "@/lib/supabase/client";
import type {
  ProfessionalServiceRow,
  ProfessionalServiceWithRelations,
} from "@/types/database.types";

export class ProfessionalServicesService {
  private supabase = createClient();

  /**
   * Busca todos os serviços de um profissional
   */
  async getServicesByProfessional(
    professionalId: number
  ): Promise<ProfessionalServiceWithRelations[]> {
    const { data, error } = await this.supabase
      .from("professional_services")
      .select(
        `
        *,
        professional:professionals(*),
        service:services(*)
      `
      )
      .eq("professional_id", professionalId)
      .order("service_id", { ascending: true });

    if (error) {
      console.error("Erro ao buscar serviços do profissional:", error);
      throw new Error("Falha ao buscar serviços do profissional");
    }

    return (data as any[]).map((item) => ({
      ...item,
      professional: Array.isArray(item.professional)
        ? item.professional[0]
        : item.professional,
      service: Array.isArray(item.service) ? item.service[0] : item.service,
    })) as ProfessionalServiceWithRelations[];
  }

  /**
   * Busca todos os profissionais que podem realizar um serviço
   */
  async getProfessionalsByService(
    serviceId: number,
    onlyActive: boolean = true
  ): Promise<ProfessionalServiceWithRelations[]> {
    let query = this.supabase
      .from("professional_services")
      .select(
        `
        *,
        professional:professionals(*),
        service:services(*)
      `
      )
      .eq("service_id", serviceId);

    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    query = query.order("professional_id", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar profissionais do serviço:", error);
      throw new Error("Falha ao buscar profissionais do serviço");
    }

    return (data as any[]).map((item) => ({
      ...item,
      professional: Array.isArray(item.professional)
        ? item.professional[0]
        : item.professional,
      service: Array.isArray(item.service) ? item.service[0] : item.service,
    })) as ProfessionalServiceWithRelations[];
  }

  /**
   * Busca uma associação específica
   */
  async getProfessionalService(
    professionalId: number,
    serviceId: number
  ): Promise<ProfessionalServiceWithRelations | null> {
    const { data, error } = await this.supabase
      .from("professional_services")
      .select(
        `
        *,
        professional:professionals(*),
        service:services(*)
      `
      )
      .eq("professional_id", professionalId)
      .eq("service_id", serviceId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      console.error("Erro ao buscar associação:", error);
      throw new Error("Falha ao buscar associação");
    }

    if (!data) return null;

    return {
      ...data,
      professional: Array.isArray(data.professional)
        ? data.professional[0]
        : data.professional,
      service: Array.isArray(data.service) ? data.service[0] : data.service,
    } as ProfessionalServiceWithRelations;
  }

  /**
   * Cria uma nova associação profissional-serviço
   */
  async createProfessionalService(params: {
    professional_id: number;
    service_id: number;
    custom_duration_minutes: number;
    is_active?: boolean;
  }): Promise<ProfessionalServiceRow> {
    const { data, error } = await this.supabase
      .from("professional_services")
      .insert({
        professional_id: params.professional_id,
        service_id: params.service_id,
        custom_duration_minutes: params.custom_duration_minutes,
        is_active: params.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar associação:", error);
      throw new Error("Falha ao criar associação");
    }

    return data;
  }

  /**
   * Atualiza uma associação profissional-serviço
   */
  async updateProfessionalService(
    id: number,
    params: {
      custom_duration_minutes?: number;
      is_active?: boolean;
    }
  ): Promise<ProfessionalServiceRow> {
    const { data, error } = await this.supabase
      .from("professional_services")
      .update(params)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar associação:", error);
      throw new Error("Falha ao atualizar associação");
    }

    return data;
  }

  /**
   * Alterna o status ativo/inativo de uma associação
   */
  async toggleProfessionalService(
    id: number,
    isActive: boolean
  ): Promise<ProfessionalServiceRow> {
    return this.updateProfessionalService(id, { is_active: isActive });
  }

  /**
   * Deleta uma associação profissional-serviço
   */
  async deleteProfessionalService(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("professional_services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar associação:", error);
      throw new Error("Falha ao deletar associação");
    }
  }

  /**
   * Busca a duração customizada para uma combinação profissional-serviço
   */
  async getDuration(
    professionalId: number,
    serviceId: number
  ): Promise<number | null> {
    const association = await this.getProfessionalService(
      professionalId,
      serviceId
    );

    if (!association || !association.is_active) {
      return null;
    }

    return association.custom_duration_minutes;
  }

  /**
   * Verifica se um profissional pode realizar um serviço
   */
  async canProfessionalPerformService(
    professionalId: number,
    serviceId: number
  ): Promise<boolean> {
    const association = await this.getProfessionalService(
      professionalId,
      serviceId
    );

    return association !== null && association.is_active;
  }
}

export const professionalServicesService = new ProfessionalServicesService();
