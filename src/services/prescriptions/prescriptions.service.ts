import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/get-error-message";

const supabase = createClient();

export interface Prescription {
  id: string;
  medical_record_id: string;
  medication: string;
  dosage: string;
  route: string; // oral, intravenosa, tópica, etc.
  frequency: string;
  duration: string;
  quantity: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePrescriptionInput {
  medical_record_id: string;
  medication: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  quantity?: string;
  notes?: string;
}

export interface UpdatePrescriptionInput {
  medication?: string;
  dosage?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  quantity?: string;
  notes?: string;
}

export class PrescriptionsService {
  // Get all prescriptions for a medical record
  static async getPrescriptionsByRecordId(recordId: string) {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("medical_record_id", recordId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as Prescription[] };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Get a single prescription by ID
  static async getPrescriptionById(id: string) {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { success: true, data: data as Prescription };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Create a new prescription
  static async createPrescription(input: CreatePrescriptionInput) {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Prescription };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Update an existing prescription
  static async updatePrescription(id: string, input: UpdatePrescriptionInput) {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Prescription };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Delete a prescription
  static async deletePrescription(id: string) {
    try {
      const { error } = await supabase
        .from("prescriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }
}
