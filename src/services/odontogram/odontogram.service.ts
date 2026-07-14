import type { AddSurfaceConditionInput, AddTreatmentHistoryInput, OdontogramWithTeeth, ToothRecordWithDetails, ToothTreatmentHistory, UpdateToothStatusInput } from "@/types/odontogram";
const missing = { success: false as const, error: "Odontograma não existe no esquema conectado" };
export class OdontogramService {
  static async getPatientOdontogram(_patientId: number): Promise<{ success: boolean; data?: OdontogramWithTeeth; error?: string }> { return missing; }
  static async createOdontogram(_patientId: number) { return missing; }
  static async updateToothStatus(_input: UpdateToothStatusInput) { return missing; }
  static async addSurfaceCondition(_input: AddSurfaceConditionInput) { return missing; }
  static async removeSurfaceCondition(_id: string) { return missing; }
  static async addTreatmentHistory(_input: AddTreatmentHistoryInput) { return missing; }
  static async getToothDetails(_id: string): Promise<{ success: boolean; data?: ToothRecordWithDetails; error?: string }> { return missing; }
  static async getToothHistory(_id: string): Promise<{ success: boolean; data?: ToothTreatmentHistory[]; error?: string }> { return missing; }
  static async deleteTreatmentHistory(_id: string) { return missing; }
}
