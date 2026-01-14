import { createClient } from "@/lib/supabase/client";
import type { ProfessionalRow } from "@/types/database.types";

const supabase = createClient();

export interface VitalSigns {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  client_id: number;
  date: string;
  clinical_notes: string | null;
  observations: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // SOAP fields
  professional_id: number | null;
  appointment_id: number | null;
  soap_subjective: string | null;
  soap_objective: string | null;
  soap_assessment: string | null;
  soap_plan: string | null;
  vital_signs: VitalSigns | null;
  prescriptions: Prescription[] | null;
  attachments: string[] | null;
  
  // Relations
  professional?: ProfessionalRow;
}

export interface CreateMedicalRecordInput {
  client_id: number;
  professional_id: number;
  appointment_id?: number;
  date?: string;
  clinical_notes?: string;
  observations?: string;
  soap_subjective?: string;
  soap_objective?: string;
  soap_assessment?: string;
  soap_plan?: string;
  vital_signs?: VitalSigns;
  prescriptions?: Prescription[];
  attachments?: string[];
}

export interface UpdateMedicalRecordInput {
  clinical_notes?: string;
  observations?: string;
  soap_subjective?: string;
  soap_objective?: string;
  soap_assessment?: string;
  soap_plan?: string;
  vital_signs?: VitalSigns;
  prescriptions?: Prescription[];
  attachments?: string[];
}

export interface PatientSummary {
  client_id: number;
  client_name: string;
  client_phone: string;
  last_appointment: string | null;
  total_appointments: number;
  total_records: number;
  professional_id: number;
}

export class MedicalRecordsService {
  // Get all medical records for a client
  static async getMedicalRecords(clientId: number) {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select(`
          *,
          professional:professionals!medical_records_professional_id_fkey(*)
        `)
        .eq("client_id", clientId)
        .order("date", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as MedicalRecord[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get medical records by professional (for doctors to see their patients)
  static async getMedicalRecordsByProfessional(professionalId: number) {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select(`
          *,
          professional:professionals!medical_records_professional_id_fkey(*)
        `)
        .eq("professional_id", professionalId)
        .order("date", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as MedicalRecord[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get patients by professional (unique patients from appointments)
  static async getPatientsByProfessional(professionalId: number) {
    try {
      const { data, error } = await supabase
        .from("professional_patients")
        .select("*")
        .eq("professional_id", professionalId)
        .order("last_appointment", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as PatientSummary[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get latest medical record for a client
  static async getLatestMedicalRecord(clientId: number, professionalId?: number) {
    try {
      let query = supabase
        .from("medical_records")
        .select(`
          *,
          professional:professionals!medical_records_professional_id_fkey(*)
        `)
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(1);

      if (professionalId) {
        query = query.eq("professional_id", professionalId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return { success: true, data: data as MedicalRecord | null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get a single medical record by ID
  static async getMedicalRecordById(id: string) {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select(`
          *,
          professional:professionals!medical_records_professional_id_fkey(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return { success: true, data: data as MedicalRecord };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Create a new medical record
  static async createMedicalRecord(input: CreateMedicalRecordInput) {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .insert([input])
        .select(`
          *,
          professional:professionals!medical_records_professional_id_fkey(*)
        `)
        .single();

      if (error) throw error;
      return { success: true, data: data as MedicalRecord };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update an existing medical record
  static async updateMedicalRecord(id: string, input: UpdateMedicalRecordInput) {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .update(input)
        .eq("id", id)
        .select(`
          *,
          professional:professionals!medical_records_professional_id_fkey(*)
        `)
        .single();

      if (error) throw error;
      return { success: true, data: data as MedicalRecord };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete a medical record
  static async deleteMedicalRecord(id: string) {
    try {
      const { error } = await supabase
        .from("medical_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
