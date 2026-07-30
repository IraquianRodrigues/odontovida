import type { ProfessionalRow } from "@/types/database.types";
export interface VitalSigns { blood_pressure_systolic?: number; blood_pressure_diastolic?: number; heart_rate?: number; temperature?: number; oxygen_saturation?: number; weight?: number; height?: number; bmi?: number }
export interface Prescription { medication: string; dosage: string; frequency: string; duration: string; notes?: string }
export interface MedicalRecord { id: string; client_id: string | number; date: string; clinical_notes: string | null; observations: string | null; created_by: string | null; created_at: string; updated_at: string; professional_id: number | null; appointment_id: string | number | null; soap_subjective: string | null; soap_objective: string | null; soap_assessment: string | null; soap_plan: string | null; vital_signs: VitalSigns | null; prescriptions: Prescription[] | null; attachments: string[] | null; professional?: ProfessionalRow }
export interface CreateMedicalRecordInput { client_id: string | number; professional_id: number; appointment_id?: string | number; date?: string; clinical_notes?: string; observations?: string; soap_subjective?: string; soap_objective?: string; soap_assessment?: string; soap_plan?: string; vital_signs?: VitalSigns; prescriptions?: Prescription[]; attachments?: string[] }
export interface UpdateMedicalRecordInput { clinical_notes?: string; observations?: string; soap_subjective?: string; soap_objective?: string; soap_assessment?: string; soap_plan?: string; vital_signs?: VitalSigns; prescriptions?: Prescription[]; attachments?: string[] }
export interface PatientSummary { client_id: string | number; client_name: string; client_phone: string; last_appointment: string | null; total_appointments: number; total_records: number; professional_id: number }
const missing = { success: false as const, error: "Prontuários clínicos não existem no esquema conectado", data: undefined as MedicalRecord | undefined };
export class MedicalRecordsService {
  static async getMedicalRecords(_id: string | number) { return { success: true as const, data: [] as MedicalRecord[], error: undefined }; }
  static async getMedicalRecordsByProfessional(_id: number) { return { success: true as const, data: [] as MedicalRecord[] }; }
  static async getPatientsByProfessional(_id: number) { return { success: true as const, data: [] }; }
  static async getAllPatients() { return { success: true as const, data: [] }; }
  static async getPatientSummary(_id: string | number) { return { success: true as const, data: null as PatientSummary | null }; }
  static async getLatestMedicalRecord(_id: string | number, _professionalId?: number) { return { success: true as const, data: null as MedicalRecord | null, error: undefined }; }
  static async getMedicalRecordById(_id: string) { return { success: true as const, data: null as MedicalRecord | null }; }
  static async createMedicalRecord(_input: CreateMedicalRecordInput) { return missing; }
  static async updateMedicalRecord(_id: string, _input: UpdateMedicalRecordInput) { return missing; }
  static async deleteMedicalRecord(_id: string) { return missing; }
}
