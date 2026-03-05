export type TreatmentPlanStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type TreatmentItemStatus = 'pending' | 'in_progress' | 'completed';

export interface TreatmentPlan {
  id: number;
  client_id: number;
  professional_id: number;
  title: string;
  status: TreatmentPlanStatus;
  discount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreatmentPlanItem {
  id: number;
  treatment_plan_id: number;
  tooth_number: number | null;
  procedure_name: string;
  description: string | null;
  price: number;
  status: TreatmentItemStatus;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
}

export interface TreatmentPlanWithItems extends TreatmentPlan {
  items: TreatmentPlanItem[];
  professional?: { id: number; name: string };
}

export interface CreateTreatmentPlanInput {
  client_id: number;
  professional_id: number;
  title: string;
  discount?: number;
  notes?: string;
  items: CreateTreatmentPlanItemInput[];
}

export interface CreateTreatmentPlanItemInput {
  tooth_number?: number | null;
  procedure_name: string;
  description?: string;
  price: number;
  sort_order: number;
}

export const PLAN_STATUS_LABELS: Record<TreatmentPlanStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const ITEM_STATUS_LABELS: Record<TreatmentItemStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
};
