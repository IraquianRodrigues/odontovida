import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type SmokingStatus = "yes" | "no" | "former";
export type YesNo = "yes" | "no";

export interface Anamnesis {
  id: string;
  medical_record_id: string;
  
  // Queixa e História
  chief_complaint: string | null;
  history_present_illness: string | null;
  onset: string | null;
  evolution: string | null;
  intensity: string | null;
  aggravating_factors: string | null;
  relieving_factors: string | null;
  associated_symptoms: string | null;
  previous_treatments: string | null;
  
  // Antecedentes
  personal_history: Record<string, any> | null;
  family_history: Record<string, any> | null;
  surgical_history: string | null;
  hospitalizations: string | null;
  chronic_diseases: string | null;
  
  // Hábitos
  smoking: SmokingStatus | null;
  alcohol: YesNo | null;
  drugs: YesNo | null;
  sleep_quality: string | null;
  diet_quality: string | null;
  physical_activity: string | null;
  
  // Vacinação
  vaccination_status: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface CreateAnamnesisInput {
  medical_record_id: string;
  chief_complaint?: string;
  history_present_illness?: string;
  onset?: string;
  evolution?: string;
  intensity?: string;
  aggravating_factors?: string;
  relieving_factors?: string;
  associated_symptoms?: string;
  previous_treatments?: string;
  personal_history?: Record<string, any>;
  family_history?: Record<string, any>;
  surgical_history?: string;
  hospitalizations?: string;
  chronic_diseases?: string;
  smoking?: SmokingStatus;
  alcohol?: YesNo;
  drugs?: YesNo;
  sleep_quality?: string;
  diet_quality?: string;
  physical_activity?: string;
  vaccination_status?: string;
}

export interface UpdateAnamnesisInput extends Partial<CreateAnamnesisInput> {}

export class AnamnesisService {
  // Get anamnesis by medical record ID
  static async getAnamnesisById(id: string) {
    try {
      const { data, error } = await supabase
        .from("anamnesis")
        .select("*")
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return { success: true, data: data as Anamnesis | null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get anamnesis by medical record ID
  static async getAnamnesisbyRecordId(recordId: string) {
    try {
      const { data, error } = await supabase
        .from("anamnesis")
        .select("*")
        .eq("medical_record_id", recordId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return { success: true, data: data as Anamnesis | null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Create a new anamnesis
  static async createAnamnesis(input: CreateAnamnesisInput) {
    try {
      const { data, error } = await supabase
        .from("anamnesis")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Anamnesis };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update an existing anamnesis
  static async updateAnamnesis(id: string, input: UpdateAnamnesisInput) {
    try {
      const { data, error } = await supabase
        .from("anamnesis")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Anamnesis };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete an anamnesis
  static async deleteAnamnesis(id: string) {
    try {
      const { error } = await supabase
        .from("anamnesis")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
