export interface Prescription { id: string; medical_record_id: string; medication: string; dosage: string; route: string; frequency: string; duration: string; quantity: string | null; notes: string | null; created_at: string; updated_at: string }
export interface CreatePrescriptionInput { medical_record_id: string; medication: string; dosage: string; route: string; frequency: string; duration: string; quantity?: string; notes?: string }
export type UpdatePrescriptionInput = Partial<Omit<CreatePrescriptionInput, "medical_record_id">>;
const missing = { success: false as const, error: "Prescrições não existem no esquema conectado", data: undefined as Prescription | undefined };
export class PrescriptionsService {
  static async getPrescriptionsByRecordId(_id: string) { return { success: true as const, data: [] as Prescription[], error: undefined }; }
  static async getPrescriptionById(_id: string) { return { success: true as const, data: null as Prescription | null, error: undefined }; }
  static async createPrescription(_input: CreatePrescriptionInput) { return missing; }
  static async updatePrescription(_id: string, _input: UpdatePrescriptionInput) { return missing; }
  static async deletePrescription(_id: string) { return missing; }
}
