export type SmokingStatus = "yes" | "no" | "former";
export type YesNo = "yes" | "no";
export interface Anamnesis { id: string; medical_record_id: string; chief_complaint: string | null; history_present_illness: string | null; onset: string | null; evolution: string | null; intensity: string | null; aggravating_factors: string | null; relieving_factors: string | null; associated_symptoms: string | null; previous_treatments: string | null; personal_history: Record<string, any> | null; family_history: Record<string, any> | null; surgical_history: string | null; hospitalizations: string | null; chronic_diseases: string | null; smoking: SmokingStatus | null; alcohol: YesNo | null; drugs: YesNo | null; sleep_quality: string | null; diet_quality: string | null; physical_activity: string | null; vaccination_status: string | null; created_at: string; updated_at: string }
export interface CreateAnamnesisInput { medical_record_id: string; chief_complaint?: string; history_present_illness?: string; onset?: string; evolution?: string; intensity?: string; aggravating_factors?: string; relieving_factors?: string; associated_symptoms?: string; previous_treatments?: string; personal_history?: Record<string, any>; family_history?: Record<string, any>; surgical_history?: string; hospitalizations?: string; chronic_diseases?: string; smoking?: SmokingStatus; alcohol?: YesNo; drugs?: YesNo; sleep_quality?: string; diet_quality?: string; physical_activity?: string; vaccination_status?: string }
export type UpdateAnamnesisInput = Partial<CreateAnamnesisInput>;
const missing = { success: false as const, error: "Anamnese não existe no esquema conectado", data: undefined as Anamnesis | undefined };
export class AnamnesisService {
  static async getAnamnesisById(_id: string) { return { success: true as const, data: null as Anamnesis | null, error: undefined }; }
  static async getAnamnesisbyRecordId(_id: string) { return { success: true as const, data: null as Anamnesis | null, error: undefined }; }
  static async createAnamnesis(_input: CreateAnamnesisInput) { return missing; }
  static async updateAnamnesis(_id: string, _input: UpdateAnamnesisInput) { return missing; }
  static async deleteAnamnesis(_id: string) { return missing; }
}
