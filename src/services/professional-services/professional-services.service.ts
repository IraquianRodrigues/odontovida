import type { ProfessionalServiceWithRelations } from "@/types/database.types";
import { professionalsService } from "@/services/professionals/professionals.service";
import { servicesService } from "@/services/services/services.service";

const unavailable = () => { throw new Error("O esquema deste projeto não possui associações entre profissionais e serviços"); };

export class ProfessionalServicesService {
  async getServicesByProfessional(professionalId: number): Promise<ProfessionalServiceWithRelations[]> {
    const [professional, services] = await Promise.all([professionalsService.getProfessionalById(professionalId), servicesService.getServices()]);
    return services.map((service) => ({ id: service.id, created_at: service.created_at, professional_id: professionalId, service_id: service.id, custom_duration_minutes: service.duration_minutes, is_active: service.active !== false, professional, service }));
  }
  async getProfessionalsByService(serviceId: number, _onlyActive = true): Promise<ProfessionalServiceWithRelations[]> {
    const [service, professionals] = await Promise.all([servicesService.getServiceById(serviceId), professionalsService.getProfessionals()]);
    return professionals.map((professional) => ({ id: professional.id, created_at: professional.created_at, professional_id: professional.id, service_id: serviceId, custom_duration_minutes: service?.duration_minutes || 0, is_active: professional.active !== false, professional, service }));
  }
  async getProfessionalService(professionalId: number, serviceId: number) { return (await this.getServicesByProfessional(professionalId)).find((item) => item.service_id === serviceId) || null; }
  async createProfessionalService(_params: { professional_id: number; service_id: number; custom_duration_minutes: number; is_active?: boolean }) { return unavailable(); }
  async updateProfessionalService(_id: number, _data: { custom_duration_minutes?: number; is_active?: boolean }) { return unavailable(); }
  async toggleProfessionalService(_id: number, _isActive: boolean) { return unavailable(); }
  async deleteProfessionalService(_id: number): Promise<void> { unavailable(); }
  async getDuration(_professionalId: number, serviceId: number): Promise<number | null> { return (await servicesService.getServiceById(serviceId))?.duration_minutes ?? null; }
  async canProfessionalPerformService(_professionalId: number, _serviceId: number): Promise<boolean> { return true; }
}
export const professionalServicesService = new ProfessionalServicesService();
