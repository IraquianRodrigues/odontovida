import { createClient } from "@/lib/supabase/client";
import type {
  AppointmentWithRelations,
  ServiceRow,
  ProfessionalRow,
} from "@/types/database.types";

export interface GetAppointmentsParams {
  date?: Date;
  startDate?: Date;
  endDate?: Date;
}

export class AppointmentsService {
  private supabase = createClient();

  /**
   * Busca appointments com filtro opcional por data
   */
  async getAppointments(
    params?: GetAppointmentsParams
  ): Promise<AppointmentWithRelations[]> {
    let query = this.supabase
      .from("appointments")
      .select(
        `
        *,
        service:services!appointments_service_code_fkey(*),
        professional:professionals!appointments_professional_code_fkey(*)
      `
      )
      .order("start_time", { ascending: true });

    // Filtro por data específica
    if (params?.date) {
      const startOfDay = new Date(params.date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(params.date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString());
    }

    // Filtro por range de datas
    if (params?.startDate && params?.endDate) {
      query = query
        .gte("start_time", params.startDate.toISOString())
        .lte("start_time", params.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar appointments:", error);
      throw new Error("Falha ao buscar agendamentos");
    }

    return (data as any[]).map((item) => ({
      ...item,
      service: Array.isArray(item.service) ? item.service[0] : item.service,
      professional: Array.isArray(item.professional)
        ? item.professional[0]
        : item.professional,
    })) as AppointmentWithRelations[];
  }

  /**
   * Busca um appointment específico por ID
   */
  async getAppointmentById(
    id: number
  ): Promise<AppointmentWithRelations | null> {
    const { data, error } = await this.supabase
      .from("appointments")
      .select(
        `
        *,
        service:services!appointments_service_code_fkey(*),
        professional:professionals!appointments_professional_code_fkey(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar appointment:", error);
      throw new Error("Falha ao buscar agendamento");
    }

    if (!data) return null;

    return {
      ...data,
      service: Array.isArray(data.service) ? data.service[0] : data.service,
      professional: Array.isArray(data.professional)
        ? data.professional[0]
        : data.professional,
    } as AppointmentWithRelations;
  }

  /**
   * Atualiza um appointment
   */
  async updateAppointment(
    id: number,
    data: Partial<{
      service_code: number;
      professional_code: number;
      customer_name: string;
      customer_phone: string;
      start_time: string;
      end_time: string;
    }>
  ): Promise<void> {
    const { error } = await this.supabase
      .from("appointments")
      .update(data)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar appointment:", error);
      throw new Error("Falha ao atualizar agendamento");
    }
  }

  /**
   * Deleta um appointment
   */
  async deleteAppointment(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("appointments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar appointment:", error);
      throw new Error("Falha ao deletar agendamento");
    }
  }

  /**
   * Busca serviços disponíveis para um profissional
   * Retorna apenas serviços ativos configurados para o profissional
   */
  async getAvailableServicesForProfessional(
    professionalId: number
  ): Promise<ServiceRow[]> {
    const { data, error } = await this.supabase
      .from("professional_services")
      .select("service:services(*)")
      .eq("professional_id", professionalId)
      .eq("is_active", true);

    if (error) {
      console.error("Erro ao buscar serviços disponíveis:", error);
      throw new Error("Falha ao buscar serviços disponíveis");
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data
      .map((item: any) =>
        Array.isArray(item.service) ? item.service[0] : item.service
      )
      .filter((service: any) => service !== null) as ServiceRow[];
  }

  /**
   * Busca profissionais disponíveis para um serviço
   * Retorna apenas profissionais com o serviço ativo
   */
  async getAvailableProfessionalsForService(
    serviceId: number
  ): Promise<ProfessionalRow[]> {
    const { data, error } = await this.supabase
      .from("professional_services")
      .select("professional:professionals(*)")
      .eq("service_id", serviceId)
      .eq("is_active", true);

    if (error) {
      console.error("Erro ao buscar profissionais disponíveis:", error);
      throw new Error("Falha ao buscar profissionais disponíveis");
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data
      .map((item: any) =>
        Array.isArray(item.professional)
          ? item.professional[0]
          : item.professional
      )
      .filter((professional: any) => professional !== null) as ProfessionalRow[];
  }

  /**
   * Busca a duração customizada para uma combinação profissional-serviço
   * Retorna null se não houver configuração específica
   */
  async getDurationForProfessionalService(
    professionalId: number,
    serviceId: number
  ): Promise<number | null> {
    const { data, error } = await this.supabase
      .from("professional_services")
      .select("custom_duration_minutes")
      .eq("professional_id", professionalId)
      .eq("service_id", serviceId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found - não há configuração específica
        return null;
      }
      console.error("Erro ao buscar duração customizada:", error);
      return null;
    }

    return data?.custom_duration_minutes || null;
  }
}

// Singleton instance
export const appointmentsService = new AppointmentsService();
