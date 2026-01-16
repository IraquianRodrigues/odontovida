// Types for Financial Module

export type TransactionType = 'receita' | 'despesa';
export type TransactionStatus = 'pendente' | 'pago' | 'cancelado' | 'atrasado';
export type PaymentMethod = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'transferencia';
export type PaymentPlanStatus = 'ativo' | 'concluido' | 'cancelado';

export interface Transaction {
  id: string;
  client_id: string;
  appointment_id?: string | null;
  professional_id?: number | null;
  type: TransactionType;
  category: string;
  description?: string | null;
  amount: number;
  payment_method?: PaymentMethod | null;
  status: TransactionStatus;
  due_date: string;
  paid_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Mercado Pago fields
  mercadopago_preference_id?: string | null;
  mercadopago_payment_id?: string | null;
  mercadopago_payment_status?: string | null;
  mercadopago_payment_link?: string | null;
  // Joined data
  client?: {
    id: number;
    nome: string;
    telefone?: string;
  };
  professional?: {
    id: number;
    name: string;
  };
}

export interface PaymentPlan {
  id: string;
  client_id: string;
  description: string;
  total_amount: number;
  installments: number;
  paid_installments: number;
  status: PaymentPlanStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: {
    id: string;
    name: string;
  };
}

export interface Installment {
  id: string;
  payment_plan_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  paid_date?: string | null;
  status: TransactionStatus;
  payment_method?: PaymentMethod | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  payment_method?: PaymentMethod | null;
  due_date: string;
  paid_date?: string | null;
  status: TransactionStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialMetrics {
  totalReceivable: number;
  totalReceived: number;
  totalOverdue: number;
  totalPending: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
}

export interface CreateTransactionInput {
  client_id?: string; // Opcional para despesas
  appointment_id?: string;
  professional_id?: number;
  type: TransactionType;
  category: string;
  description?: string;
  amount: number;
  payment_method?: PaymentMethod;
  status?: TransactionStatus;
  due_date: string;
  paid_date?: string;
  notes?: string;
}

export interface UpdateTransactionInput {
  category?: string;
  description?: string;
  amount?: number;
  payment_method?: PaymentMethod;
  status?: TransactionStatus;
  due_date?: string;
  paid_date?: string;
  notes?: string;
}
