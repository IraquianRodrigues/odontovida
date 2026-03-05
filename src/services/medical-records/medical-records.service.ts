import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/get-error-message";
import type { ProfessionalRow } from "@/types/database.types";

const getSupabase = () => createClient();

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
      const { data, error } = await getSupabase()
        .from("medical_records")
        .select(`
          *,
          professional:professionals!medical_records_professional_id_fkey(*)
        `)
        .eq("client_id", clientId)
        .order("date", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as MedicalRecord[] };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Get medical records by professional (for doctors to see their patients)
  static async getMedicalRecordsByProfessional(professionalId: number) {
    try {
      const { data, error } = await getSupabase()
        .from("medical_records")
        .select(`
          *,
          professional:professionals!medical_records_professional_id_fkey(*)
        `)
        .eq("professional_id", professionalId)
        .order("date", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as MedicalRecord[] };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Get patients by professional (unique patients from appointments)
  static async getPatientsByProfessional(professionalId: number) {
    try {
      const { data, error } = await getSupabase()
        .from("professional_patients")
        .select("*")
        .eq("professional_id", professionalId)
        .order("last_appointment", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as PatientSummary[] };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Get all patients (for admin users)
  static async getAllPatients() {
    try {
      // Get all unique clients who have appointments
      const { data, error } = await getSupabase()
        .from("clientes")
        .select(`
          id,
          nome,
          telefone
        `)
        .order("nome", { ascending: true });

      if (error) throw error;

      // For each client, get appointment and record counts
      const patientsWithStats = await Promise.all(
        (data || []).map(async (client: { id: number; nome: string; telefone: string }) => {
          const { data: appointments } = await getSupabase()
            .from("appointments")
            .select("start_time")
            .eq("customer_phone", client.telefone)
            .order("start_time", { ascending: false });

          const { data: records } = await getSupabase()
            .from("medical_records")
            .select("id")
            .eq("client_id", client.id);

          return {
            client_id: client.id,
            client_name: client.nome,
            client_phone: client.telefone,
            last_appointment: appointments?.[0]?.start_time || null,
            total_appointments: appointments?.length || 0,
            total_records: records?.length || 0,
            professional_id: 0, // Not applicable for admin view
          } as PatientSummary;
        })
      );

      return { success: true, data: patientsWithStats };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Get patient summary (single patient stats)
  static async getPatientSummary(clientId: number) {
    try {
      const { data: client } = await getSupabase()
        .from("clientes")
        .select("id, nome, telefone")
        .eq("id", clientId)
        .single();

      if (!client) {
        return { success: false, error: "Patient not found" };
      }

      const { data: appointments } = await getSupabase()
        .from("appointments")
        .select("start_time")
        .eq("customer_phone", client.telefone)
        .order("start_time", { ascending: false });

      const { data: records } = await getSupabase()
        .from("medical_records")
        .select("id")
        .eq("client_id", client.id);

      const summary: PatientSummary = {
        client_id: client.id,
        client_name: client.nome,
        client_phone: client.telefone,
        last_appointment: appointments?.[0]?.start_time || null,
        total_appointments: appointments?.length || 0,
        total_records: records?.length || 0,
        professional_id: 0,
      };

      return { success: true, data: summary };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Get latest medical record for a client
  static async getLatestMedicalRecord(clientId: number, professionalId?: number) {
    try {
      const supabase = getSupabase(); let query = supabase
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
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Get a single medical record by ID
  static async getMedicalRecordById(id: string) {
    try {
      const { data, error } = await getSupabase()
        .from("medical_records")
        .select(`
          *,
          professional:professionals!medical_records_professional_id_fkey(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return { success: true, data: data as MedicalRecord };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Create a new medical record
  static async createMedicalRecord(input: CreateMedicalRecordInput) {
    try {
      const { data, error } = await getSupabase()
        .from("medical_records")
        .insert([input])
        .select(`
          *,
          professional:professionals!medical_records_professional_id_fkey(*)
        `)
        .single();

      if (error) throw error;
      return { success: true, data: data as MedicalRecord };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Update an existing medical record
  static async updateMedicalRecord(id: string, input: UpdateMedicalRecordInput) {
    try {
      const { data, error } = await getSupabase()
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
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Delete a medical record
  static async deleteMedicalRecord(id: string) {
    try {
      const { error } = await getSupabase()
        .from("medical_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }
}
