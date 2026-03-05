import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/get-error-message";

const getSupabase = () => createClient();

export type AlertType = "allergy" | "medication" | "condition" | "restriction";
export type AlertSeverity = "low" | "moderate" | "high" | "critical";

export interface CriticalAlert {
  id: string;
  client_id: number;
  alert_type: AlertType;
  description: string;
  severity: AlertSeverity;
  notes: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCriticalAlertInput {
  client_id: number;
  alert_type: AlertType;
  description: string;
  severity: AlertSeverity;
  notes?: string;
}

export interface UpdateCriticalAlertInput {
  alert_type?: AlertType;
  description?: string;
  severity?: AlertSeverity;
  notes?: string;
  is_active?: boolean;
}

export class CriticalAlertsService {
  // Get all alerts for a client
  static async getAlertsByClient(clientId: number) {
    try {
      const { data, error } = await getSupabase()
        .from("critical_alerts")
        .select("*")
        .eq("client_id", clientId)
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as CriticalAlert[] };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Get only active alerts for a client
  static async getActiveAlertsByClient(clientId: number) {
    try {
      const { data, error } = await getSupabase()
        .from("critical_alerts")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_active", true)
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as CriticalAlert[] };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Get a single alert by ID
  static async getAlertById(id: string) {
    try {
      const { data, error } = await getSupabase()
        .from("critical_alerts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { success: true, data: data as CriticalAlert };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Create a new alert
  static async createAlert(input: CreateCriticalAlertInput) {
    try {
      const { data, error } = await getSupabase()
        .from("critical_alerts")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as CriticalAlert };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Update an existing alert
  static async updateAlert(id: string, input: UpdateCriticalAlertInput) {
    try {
      const { data, error } = await getSupabase()
        .from("critical_alerts")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as CriticalAlert };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Deactivate an alert (soft delete)
  static async deactivateAlert(id: string) {
    try {
      const { data, error } = await getSupabase()
        .from("critical_alerts")
        .update({ is_active: false })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as CriticalAlert };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Reactivate an alert
  static async reactivateAlert(id: string) {
    try {
      const { data, error } = await getSupabase()
        .from("critical_alerts")
        .update({ is_active: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as CriticalAlert };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  // Delete an alert (hard delete - use with caution)
  static async deleteAlert(id: string) {
    try {
      const { error } = await getSupabase()
        .from("critical_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }
}
