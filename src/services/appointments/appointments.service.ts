import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { AppointmentWithRelations, ProfessionalRow, ServiceRow } from "@/types/database.types";
import { professionalsService } from "@/services/professionals/professionals.service";
import { servicesService } from "@/services/services/services.service";

export interface GetAppointmentsParams { date?: Date; startDate?: Date; endDate?: Date }

type AppointmentDbRow = Omit<AppointmentWithRelations, "service" | "professional" | "completed_at"> & {
  attended_at?: string | null;
};

export class AppointmentsService {
  private get supabase() { return createClient(); }

  private async withRelations(rows: AppointmentDbRow[]): Promise<AppointmentWithRelations[]> {
    const [services, professionals] = await Promise.all([
      servicesService.getServices(),
      professionalsService.getProfessionals(),
    ]);
    const serviceMap = new Map(services.map((item) => [item.id, item]));
    const professionalMap = new Map(professionals.map((item) => [item.id, item]));
    return rows.map((row) => ({
      ...row,
      completed_at: row.attended_at ?? (row.status === "completed" ? row.updated_at : null),
      service: serviceMap.get(row.service_code),
      professional: professionalMap.get(row.professional_code),
    }));
  }

  async getAppointments(params?: GetAppointmentsParams): Promise<AppointmentWithRelations[]> {
    let query = this.supabase.from("appointments").select("*").neq("status", "completed").order("start_time");
    if (params?.date) {
      const start = new Date(params.date); start.setHours(0, 0, 0, 0);
      const end = new Date(params.date); end.setHours(23, 59, 59, 999);
      query = query.gte("start_time", start.toISOString()).lte("start_time", end.toISOString());
    }
    if (params?.startDate && params?.endDate) {
      query = query.gte("start_time", params.startDate.toISOString()).lte("start_time", params.endDate.toISOString());
    }
    const { data, error } = await query;
    if (error) throw new Error("Falha ao buscar agendamentos");
    return this.withRelations((data || []) as AppointmentDbRow[]);
  }

  async getAppointmentById(id: string | number): Promise<AppointmentWithRelations | null> {
    const { data, error } = await this.supabase.from("appointments").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error("Falha ao buscar agendamento");
    if (!data) return null;
    return (await this.withRelations([data as AppointmentDbRow]))[0];
  }

  async getAppointmentsByPhone(telefone: string): Promise<AppointmentWithRelations[]> {
    const { data, error } = await this.supabase.from("appointments").select("*").eq("customer_phone", telefone).order("start_time", { ascending: false });
    if (error) return [];
    return this.withRelations((data || []) as AppointmentDbRow[]);
  }

  async updateAppointment(id: string | number, data: Partial<{ service_code: number; professional_code: number; customer_name: string; customer_phone: string; start_time: string; end_time: string; completed_at: string | null }>): Promise<void> {
    const { completed_at, ...update } = data;
    const payload: Record<string, unknown> = { ...update };
    if (completed_at !== undefined) {
      payload.attended_at = completed_at;
      payload.status = completed_at ? "completed" : "pending";
    }
    const { error } = await this.supabase.from("appointments").update(payload).eq("id", id);
    if (error) throw new Error("Falha ao atualizar agendamento");
  }

  async markAsCompleted(id: string | number): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase.from("appointments").update({ status: "completed", attendance_status: "attended", attended_at: now }).eq("id", id);
    if (error) throw new Error("Falha ao concluir agendamento");
  }

  async updateStatus(id: string | number, status: string): Promise<void> {
    if (status === "completed") return this.markAsCompleted(id);
    const { error } = await this.supabase.from("appointments").update({ status }).eq("id", id);
    if (error) throw new Error("Falha ao atualizar status");
  }

  async markAsNotCompleted(id: string | number): Promise<void> {
    const { error } = await this.supabase.from("appointments").update({ status: "pending", attendance_status: "pending", attended_at: null }).eq("id", id);
    if (error) throw new Error("Falha ao reabrir agendamento");
  }

  async deleteAppointment(id: string | number): Promise<void> {
    const { error } = await this.supabase.from("appointments").delete().eq("id", id);
    if (error) throw new Error("Falha ao excluir agendamento");
  }

  async createAppointment(params: { customer_name: string; customer_phone: string; service_code: number; professional_code: number; start_time: string; end_time: string }): Promise<void> {
    const { error } = await this.supabase.from("appointments").insert({ ...params, status: "agendado" });
    if (error) {
      logger.error("Erro ao criar agendamento:", error);
      throw new Error(`Erro ao criar agendamento: ${error.message}`);
    }
  }

  async getAvailableServicesForProfessional(_professionalId: number): Promise<ServiceRow[]> {
    return (await servicesService.getServices()).filter((item) => item.active !== false);
  }

  async getAvailableProfessionalsForService(_serviceId: number): Promise<ProfessionalRow[]> {
    return (await professionalsService.getProfessionals()).filter((item) => item.active !== false);
  }

  async getDurationForProfessionalService(_professionalId: number, serviceId: number): Promise<number | null> {
    return (await servicesService.getServiceById(serviceId))?.duration_minutes ?? null;
  }
}

export const appointmentsService = new AppointmentsService();
