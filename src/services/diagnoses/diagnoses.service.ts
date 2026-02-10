import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type DiagnosisType = "primary" | "secondary" | "differential";

export interface Diagnosis {
  id: string;
  medical_record_id: string;
  diagnosis_type: DiagnosisType;
  description: string;
  cid10_code: string | null;
  cid10_description: string | null;
  clinical_justification: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDiagnosisInput {
  medical_record_id: string;
  diagnosis_type: DiagnosisType;
  description: string;
  cid10_code?: string;
  cid10_description?: string;
  clinical_justification?: string;
}

export interface UpdateDiagnosisInput {
  diagnosis_type?: DiagnosisType;
  description?: string;
  cid10_code?: string;
  cid10_description?: string;
  clinical_justification?: string;
}

export class DiagnosesService {
  // Get all diagnoses for a medical record
  static async getDiagnosesByRecordId(recordId: string) {
    try {
      const { data, error } = await supabase
        .from("diagnoses")
        .select("*")
        .eq("medical_record_id", recordId)
        .order("diagnosis_type", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as Diagnosis[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get a single diagnosis by ID
  static async getDiagnosisById(id: string) {
    try {
      const { data, error } = await supabase
        .from("diagnoses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { success: true, data: data as Diagnosis };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Create a new diagnosis
  static async createDiagnosis(input: CreateDiagnosisInput) {
    try {
      const { data, error } = await supabase
        .from("diagnoses")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Diagnosis };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update an existing diagnosis
  static async updateDiagnosis(id: string, input: UpdateDiagnosisInput) {
    try {
      const { data, error } = await supabase
        .from("diagnoses")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Diagnosis };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete a diagnosis
  static async deleteDiagnosis(id: string) {
    try {
      const { error } = await supabase
        .from("diagnoses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Search CID-10 codes (placeholder for future API integration)
  static async searchCID10(query: string) {
    // TODO: Integrate with CID-10 API in the future
    // For now, return empty array
    return { success: true, data: [] };
  }
}
