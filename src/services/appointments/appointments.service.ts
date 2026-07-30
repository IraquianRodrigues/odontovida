import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type {
  AppointmentWithRelations,
  ProfessionalRow,
  ServiceRow,
} from "@/types/database.types";

export interface GetAppointmentsParams {
  date?: Date;
  startDate?: Date;
  endDate?: Date;
}

type AppointmentDatabaseRow = Omit<AppointmentWithRelations, "completed_at" | "service" | "professional">;

export class AppointmentsService {
  private get supabase() {
    return createClient();
  }

  private isCompleted(status: string) {
    return ["completed", "concluido", "concluÃ­do"].includes(status.toLowerCase());
  }

  private async getReferences() {
    const [servicesResult, professionalsResult] = await Promise.all([
      this.supabase.from("services").select("*").eq("active", true),
      this.supabase.from("professionals").select("*").eq("active", true),
    ]);

    if (servicesResult.error || professionalsResult.error) {
      logger.error("Erro ao carregar referÃªncias de agendamento", {
        services: servicesResult.error,
        professionals: professionalsResult.error,
      });
      throw new Error("Falha ao carregar serviÃ§os e profissionais");
    }

    const services = new Map<number, ServiceRow>(
      (servicesResult.data || []).map((service) => [
        service.id,
        { ...service, code: service.name, price: null },
      ])
    );
    const professionals = new Map<number, ProfessionalRow>(
      (professionalsResult.data || []).map((professional) => [
        professional.id,
        { ...professional, code: professional.name },
      ])
    );

    return { services, professionals };
  }

  private async toAppointments(rows: AppointmentDatabaseRow[]): Promise<AppointmentWithRelations[]> {
    const { services, professionals } = await this.getReferences();

    return rows.map((appointment) => ({
      ...appointment,
      completed_at: this.isCompleted(appointment.status) ? appointment.updated_at : null,
      service: services.get(appointment.service_code) || null,
      professional: professionals.get(appointment.professional_code) || null,
    }));
  }

  async getAppointments(params?: GetAppointmentsParams): Promise<AppointmentWithRelations[]> {
    let query = this.supabase
      .from("appointments")
      .select("*")
      .neq("status", "completed")
      .order("start_time", { ascending: true });

    if (params?.date) {
      const startOfDay = new Date(params.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(params.date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString());
    }

    if (params?.startDate && params?.endDate) {
      query = query
        .gte("start_time", params.startDate.toISOString())
        .lte("start_time", params.endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) {
      logger.error("Erro ao buscar appointments:", error);
      throw new Error("Falha ao buscar agendamentos");
    }

    return this.toAppointments(data || []);
  }

  async getAppointmentById(id: string | number): Promise<AppointmentWithRelations | null> {
    const { data, error } = await this.supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      logger.error("Erro ao buscar appointment:", error);
      throw new Error("Falha ao buscar agendamento");
    }

    if (!data) return null;
    return (await this.toAppointments([data]))[0];
  }

  async getAppointmentsByPhone(telefone: string): Promise<AppointmentWithRelations[]> {
    const { data, error } = await this.supabase
      .from("appointments")
      .select("*")
      .eq("customer_phone", telefone)
      .order("start_time", { ascending: false });

    if (error) {
      logger.error("Erro ao buscar histÃ³rico do cliente:", error);
      return [];
    }

    return this.toAppointments(data || []);
  }

  async updateAppointment(
    id: string | number,
    data: Partial<{
      service_code: number;
      professional_code: number;
      customer_name: string;
      customer_phone: string;
      start_time: string;
      end_time: string;
      status: string;
    }>
  ): Promise<void> {
    const { error } = await this.supabase.from("appointments").update(data).eq("id", id);
    if (error) {
      logger.error("Erro ao atualizar appointment:", error);
      throw new Error("Falha ao atualizar agendamento");
    }
  }

  async markAsCompleted(id: string | number): Promise<void> {
    await this.updateAppointment(id, { status: "completed" });
  }

  async updateStatus(id: string | number, status: string): Promise<void> {
    await this.updateAppointment(id, { status });
  }

  async markAsNotCompleted(id: string | number): Promise<void> {
    await this.updateAppointment(id, { status: "agendado" });
  }

  async deleteAppointment(id: string | number): Promise<void> {
    const { error } = await this.supabase.from("appointments").delete().eq("id", id);
    if (error) {
      logger.error("Erro ao deletar appointment:", error);
      throw new Error("Falha ao deletar agendamento");
    }
  }

  async createAppointment(params: {
    customer_name: string;
    customer_phone: string;
    service_code: number;
    professional_code: number;
    start_time: string;
    end_time: string;
  }): Promise<void> {
    const { error } = await this.supabase.from("appointments").insert({
      ...params,
      status: "agendado",
    });

    if (error) {
      logger.error("Erro ao criar agendamento:", error);
      throw new Error(`Erro ao criar agendamento: ${error.message}`);
    }
  }

  async getAvailableServicesForProfessional(_professionalId: number): Promise<ServiceRow[]> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("name");
    if (error) throw new Error("Falha ao buscar serviÃ§os disponÃ­veis");
    return (data || []).map((service) => ({ ...service, code: service.name, price: null }));
  }

  async getAvailableProfessionalsForService(_serviceId: number): Promise<ProfessionalRow[]> {
    const { data, error } = await this.supabase
      .from("professionals")
      .select("*")
      .eq("active", true)
      .order("name");
    if (error) throw new Error("Falha ao buscar profissionais disponÃ­veis");
    return (data || []).map((professional) => ({ ...professional, code: professional.name }));
  }

  async getDurationForProfessionalService(
    _professionalId: number,
    serviceId: number
  ): Promise<number | null> {
    const { data, error } = await this.supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .maybeSingle();
    if (error) return null;
    return data?.duration_minutes || null;
  }
}

export const appointmentsService = new AppointmentsService();
