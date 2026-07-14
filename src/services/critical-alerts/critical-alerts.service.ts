export type AlertType = "allergy" | "medication" | "condition" | "restriction";
export type AlertSeverity = "low" | "moderate" | "high" | "critical";
export interface CriticalAlert { id: string; client_id: number; alert_type: AlertType; description: string; severity: AlertSeverity; notes: string | null; is_active: boolean; created_by: string | null; created_at: string; updated_at: string }
export interface CreateCriticalAlertInput { client_id: number; alert_type: AlertType; description: string; severity: AlertSeverity; notes?: string }
export type UpdateCriticalAlertInput = Partial<Omit<CreateCriticalAlertInput, "client_id">> & { is_active?: boolean };
const missing = { success: false as const, error: "Alertas clínicos não existem no esquema conectado", data: undefined as CriticalAlert | undefined };
export class CriticalAlertsService {
  static async getAlertsByClient(_id: number) { return { success: true as const, data: [] as CriticalAlert[], error: undefined }; }
  static async getActiveAlertsByClient(_id: number) { return { success: true as const, data: [] as CriticalAlert[], error: undefined }; }
  static async getAlertById(_id: string) { return { success: true as const, data: null as CriticalAlert | null, error: undefined }; }
  static async createAlert(_input: CreateCriticalAlertInput) { return missing; }
  static async updateAlert(_id: string, _input: UpdateCriticalAlertInput) { return missing; }
  static async deactivateAlert(_id: string) { return missing; }
  static async reactivateAlert(_id: string) { return missing; }
  static async deleteAlert(_id: string) { return missing; }
}
