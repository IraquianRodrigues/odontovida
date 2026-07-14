import type { CreateTreatmentPlanInput, TreatmentItemStatus, TreatmentPlanStatus, TreatmentPlanWithItems } from "@/types/treatment-plan";
const missing = { success: false as const, error: "Planos odontológicos não existem no esquema conectado" };
export const TreatmentPlansService = {
  async getPlansForClient(_clientId: number) { return { success: true as const, data: [] as TreatmentPlanWithItems[] }; },
  async createPlan(_input: CreateTreatmentPlanInput) { return missing; },
  async updatePlanStatus(_id: number, _status: TreatmentPlanStatus) { return missing; },
  async updateItemStatus(_id: number, _status: TreatmentItemStatus) { return missing; },
  async deletePlan(_id: number) { return missing; },
  calculateTotal(items: { price: number }[], discount = 0) { const subtotal = items.reduce((sum, item) => sum + item.price, 0); return { subtotal, total: Math.max(0, subtotal - discount) }; },
};
