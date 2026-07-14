export type DiagnosisType = "primary" | "secondary" | "differential";
export interface Diagnosis { id: string; medical_record_id: string; diagnosis_type: DiagnosisType; description: string; cid10_code: string | null; cid10_description: string | null; clinical_justification: string | null; created_at: string; updated_at: string }
export interface CreateDiagnosisInput { medical_record_id: string; diagnosis_type: DiagnosisType; description: string; cid10_code?: string; cid10_description?: string; clinical_justification?: string }
export type UpdateDiagnosisInput = Partial<Omit<CreateDiagnosisInput, "medical_record_id">>;
const missing = { success: false as const, error: "Diagnósticos não existem no esquema conectado", data: undefined as Diagnosis | undefined };
export class DiagnosesService {
  static async getDiagnosesByRecordId(_id: string) { return { success: true as const, data: [] as Diagnosis[], error: undefined }; }
  static async getDiagnosisById(_id: string) { return { success: true as const, data: null as Diagnosis | null, error: undefined }; }
  static async createDiagnosis(_input: CreateDiagnosisInput) { return missing; }
  static async updateDiagnosis(_id: string, _input: UpdateDiagnosisInput) { return missing; }
  static async deleteDiagnosis(_id: string) { return missing; }
  static async searchCID10(_query: string) { return { success: true as const, data: [] }; }
}
