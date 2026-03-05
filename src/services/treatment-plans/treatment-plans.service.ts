import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { getErrorMessage } from "@/lib/get-error-message";
import type {
  TreatmentPlanWithItems,
  TreatmentPlanItem,
  CreateTreatmentPlanInput,
  TreatmentPlanStatus,
  TreatmentItemStatus,
} from "@/types/treatment-plan";

function getSupabase() {
  return createClient();
}

export const TreatmentPlansService = {
  async getPlansForClient(clientId: number) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("treatment_plans")
        .select(`
          *,
          professional:professionals(id, name),
          items:treatment_plan_items(*)
        `)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const plans = (data || []).map((plan: Record<string, unknown>) => ({
        ...plan,
        items: Array.isArray(plan.items)
          ? (plan.items as TreatmentPlanItem[]).sort((a, b) => a.sort_order - b.sort_order)
          : [],
      })) as TreatmentPlanWithItems[];

      return { success: true, data: plans };
    } catch (error) {
      logger.error("Error fetching treatment plans:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async createPlan(input: CreateTreatmentPlanInput) {
    try {
      const supabase = getSupabase();

      const { data: plan, error: planError } = await supabase
        .from("treatment_plans")
        .insert({
          client_id: input.client_id,
          professional_id: input.professional_id,
          title: input.title,
          discount: input.discount || 0,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (planError) throw planError;

      if (input.items.length > 0) {
        const itemsToInsert = input.items.map((item) => ({
          treatment_plan_id: plan.id,
          tooth_number: item.tooth_number || null,
          procedure_name: item.procedure_name,
          description: item.description || null,
          price: item.price,
          sort_order: item.sort_order,
        }));

        const { error: itemsError } = await supabase
          .from("treatment_plan_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return { success: true, data: plan };
    } catch (error) {
      logger.error("Error creating treatment plan:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async updatePlanStatus(planId: number, status: TreatmentPlanStatus) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("treatment_plans")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", planId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error("Error updating plan status:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async updateItemStatus(itemId: number, status: TreatmentItemStatus) {
    try {
      const supabase = getSupabase();
      const updateData: Record<string, unknown> = { status };
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from("treatment_plan_items")
        .update(updateData)
        .eq("id", itemId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error("Error updating item status:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async deletePlan(planId: number) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("treatment_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error("Error deleting treatment plan:", error);
      return { success: false, error: getErrorMessage(error) };
    }
  },

  calculateTotal(items: TreatmentPlanItem[], discount: number = 0): { subtotal: number; total: number } {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const total = Math.max(0, subtotal - discount);
    return { subtotal, total };
  },
};
