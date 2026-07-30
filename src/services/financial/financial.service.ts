import { createClient } from "@/lib/supabase/client";
import type {
  CreateTransactionInput,
  FinancialMetrics,
  PaymentMethod,
  Transaction,
  TransactionSource,
  TransactionStatus,
  UpdateTransactionInput,
} from "@/types/financial";

type FinancialFilters = {
  clientId?: string;
  status?: string;
  type?: string;
  professionalId?: number;
  startDate?: string;
  endDate?: string;
};

type ClientSummary = { id: string; nome: string; telefone?: string };
type ProfessionalSummary = { id: number; name: string };
type TransactionRef = Pick<Transaction, "id" | "source">;

const isMissingTransactionsTable = (error: { code?: string } | null) =>
  error?.code === "42P01" || error?.code === "PGRST205";

const financialTableMissingMessage =
  "A tabela public.transactions não existe no Supabase conectado. Os pagamentos de agendamentos continuam disponíveis, mas lançamentos avulsos precisam dessa tabela.";

const appointmentToTransaction = (
  row: any,
  professionals: Map<number, ProfessionalSummary> = new Map()
): Transaction => {
  const professionalId = Number(row.professional_code);

  return {
    id: String(row.id),
    source: "appointment",
    client_id: row.cliente_id || "",
    appointment_id: String(row.id),
    professional_id: professionalId,
    type: "receita",
    category: "agendamento",
    description: row.notes || row.customer_name,
    amount: Number(row.payment_value || 0),
    payment_method: (row.payment_method as PaymentMethod) || null,
    status: (
      row.payment_status === "paid" || row.asaas_status === "RECEIVED"
        ? "pago"
        : "pendente"
    ) as TransactionStatus,
    due_date: row.payment_due_date || row.start_time.slice(0, 10),
    paid_date: row.payment_received_at,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
    client: {
      id: row.cliente_id || "",
      nome: row.customer_name,
      telefone: row.customer_phone,
    },
    professional: professionals.get(professionalId) || {
      id: professionalId,
      name: `Profissional ${professionalId}`,
    },
  };
};

const rowToTransaction = (
  row: any,
  clients: Map<string, ClientSummary>
): Transaction => ({
  id: String(row.id),
  source: "transaction",
  client_id: row.client_id || "",
  appointment_id: row.appointment_id,
  professional_id: null,
  type: (row.type || "receita") as Transaction["type"],
  category: row.category,
  description: row.description,
  amount: Number(row.amount || 0),
  payment_method: row.payment_method as PaymentMethod | null,
  status: row.status as TransactionStatus,
  due_date: row.due_date,
  paid_date: row.paid_date,
  notes: row.notes,
  created_at: row.created_at,
  updated_at: row.updated_at || row.created_at,
  client: clients.get(String(row.client_id)),
});

const applyFilters = (rows: Transaction[], filters?: FinancialFilters) =>
  rows
    .filter((item) => !filters?.clientId || item.client_id === filters.clientId)
    .filter((item) => !filters?.status || item.status === filters.status)
    .filter((item) => !filters?.type || item.type === filters.type)
    .filter(
      (item) =>
        !filters?.professionalId ||
        item.professional_id === filters.professionalId
    )
    .filter((item) => !filters?.startDate || item.due_date >= filters.startDate.slice(0, 10))
    .filter((item) => !filters?.endDate || item.due_date <= filters.endDate.slice(0, 10))
    .sort((a, b) => {
      const byDate = b.due_date.localeCompare(a.due_date);
      return byDate || b.created_at.localeCompare(a.created_at);
    });

export class FinancialService {
  static async getTransactions(filters?: FinancialFilters) {
    const supabase = createClient();
    const [appointmentsResult, transactionsResult, clientsResult, professionalsResult] =
      await Promise.all([
        supabase.from("appointments").select("*").order("start_time", { ascending: false }),
        supabase.from("transactions").select("*").order("due_date", { ascending: false }),
        supabase.from("clientes").select("id, nome, telefone"),
        supabase.from("professionals").select("code, name"),
      ]);

    if (appointmentsResult.error) {
      return { success: false as const, error: appointmentsResult.error.message };
    }
    if (transactionsResult.error && !isMissingTransactionsTable(transactionsResult.error)) {
      return { success: false as const, error: transactionsResult.error.message };
    }

    const clients = new Map<string, ClientSummary>(
      (clientsResult.data || []).map((client: any) => [String(client.id), client])
    );
    const professionals = new Map<number, ProfessionalSummary>(
      (professionalsResult.data || []).map((professional: any) => [
        Number(professional.code),
        { id: Number(professional.code), name: professional.name },
      ])
    );

    const rows = [
      ...(appointmentsResult.data || []).map((row) => appointmentToTransaction(row, professionals)),
      ...(transactionsResult.error ? [] : transactionsResult.data || []).map((row) =>
        rowToTransaction(row, clients)
      ),
    ];

    return { success: true as const, data: applyFilters(rows, filters) };
  }

  static async getTransactionById(id: string, source: TransactionSource) {
    const table = source === "appointment" ? "appointments" : "transactions";
    const { data, error } = await createClient().from(table).select("*").eq("id", id).maybeSingle();

    if (error) return { success: false as const, error: error.message };
    if (!data) return { success: true as const, data: null };

    const transaction =
      source === "appointment"
        ? appointmentToTransaction(data)
        : rowToTransaction(data, new Map());

    return { success: true as const, data: transaction };
  }

  static async createTransaction(input: CreateTransactionInput) {
    const supabase = createClient();
    const status = input.status || "pendente";
    const paymentMethod = status === "pago" ? input.payment_method || "dinheiro" : null;

    if (input.type === "receita" && !input.client_id) {
      return { success: false as const, error: "Selecione um cliente para registrar a receita" };
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        client_id: input.client_id || null,
        appointment_id: input.appointment_id || null,
        type: input.type,
        category: input.category,
        description: input.description || null,
        amount: input.amount,
        payment_method: paymentMethod,
        status,
        due_date: input.due_date,
        paid_date: status === "pago" ? input.paid_date || input.due_date : null,
        notes: input.notes || null,
      })
      .select()
      .single();

    return error
      ? {
          success: false as const,
          error: isMissingTransactionsTable(error)
            ? financialTableMissingMessage
            : error.message,
        }
      : { success: true as const, data: rowToTransaction(data, new Map()) };
  }

  static async updateTransaction(id: string, input: UpdateTransactionInput, source: TransactionSource) {
    const supabase = createClient();

    if (source === "appointment") {
      const payload: Record<string, unknown> = {};
      if (input.amount !== undefined) payload.payment_value = input.amount;
      if (input.notes !== undefined) payload.notes = input.notes || null;
      if (input.status !== undefined) {
        const paid = input.status === "pago";
        payload.payment_status = paid ? "paid" : "pending";
        payload.payment_method = paid ? input.payment_method || "dinheiro" : null;
        payload.payment_received_at = paid ? new Date().toISOString() : null;
        payload.payment_confirmed_at = paid ? new Date().toISOString() : null;
      }

      const { data, error } = await supabase
        .from("appointments")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      return error
        ? { success: false as const, error: error.message }
        : { success: true as const, data: appointmentToTransaction(data) };
    }

    const payload = {
      ...(input.category !== undefined && { category: input.category }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.payment_method !== undefined && { payment_method: input.payment_method }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.due_date !== undefined && { due_date: input.due_date }),
      ...(input.paid_date !== undefined && { paid_date: input.paid_date || null }),
      ...(input.notes !== undefined && { notes: input.notes || null }),
    };
    const { data, error } = await supabase.from("transactions").update(payload).eq("id", id).select().single();

    return error
      ? { success: false as const, error: error.message }
      : {
          success: true as const,
          data: rowToTransaction(data, new Map()),
        };
  }

  static async deleteTransaction(id: string, source: TransactionSource) {
    if (source === "appointment") {
      return {
        success: false as const,
        error: "O pagamento pertence a um agendamento e deve ser gerenciado pelo próprio agendamento",
      };
    }

    const { error } = await createClient().from("transactions").delete().eq("id", id);
    return error
      ? { success: false as const, error: error.message }
      : { success: true as const };
  }

  static async deleteTransactions(items: TransactionRef[]) {
    for (const item of items) {
      const result = await this.deleteTransaction(item.id, item.source);
      if (!result.success) return result;
    }
    return { success: true as const };
  }

  static async getDailyAppointmentsReceivable(): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);
    const result = await this.getTransactions({ startDate: today, endDate: today });
    return result.success
      ? (result.data || [])
          .filter((item) => item.source === "appointment" && item.status !== "pago")
          .reduce((sum, item) => sum + item.amount, 0)
      : 0;
  }

  static async getFinancialMetrics(): Promise<{ success: boolean; data?: FinancialMetrics; error?: string }> {
    const result = await this.getTransactions();
    if (!result.success) return result;

    const rows = result.data || [];
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);
    const receipts = rows.filter((item) => item.type === "receita");
    const expenses = rows.filter((item) => item.type === "despesa");
    const received = receipts.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.amount, 0);
    const pending = receipts.filter((item) => item.status === "pendente").reduce((sum, item) => sum + item.amount, 0);
    const overdue = rows
      .filter((item) => item.status === "atrasado" || (item.status === "pendente" && item.due_date < today))
      .reduce((sum, item) => sum + item.amount, 0);
    const monthlyRevenue = receipts
      .filter((item) => item.status !== "cancelado" && item.due_date.startsWith(month))
      .reduce((sum, item) => sum + item.amount, 0);
    const monthlyExpenses = expenses
      .filter((item) => item.status !== "cancelado" && item.due_date.startsWith(month))
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      success: true,
      data: {
        totalReceivable: received + pending,
        totalReceived: received,
        totalOverdue: overdue,
        totalPending: pending,
        monthlyRevenue,
        monthlyExpenses,
        netProfit: monthlyRevenue - monthlyExpenses,
        dailyAppointmentsReceivable: await this.getDailyAppointmentsReceivable(),
      },
    };
  }

  static async markAsPaid(item: TransactionRef, paymentMethod: PaymentMethod) {
    const now = new Date().toISOString();

    if (item.source === "appointment") {
      const { data, error } = await createClient()
        .from("appointments")
        .update({
          payment_status: "paid",
          payment_method: paymentMethod,
          payment_received_at: now,
          payment_confirmed_at: now,
        })
        .eq("id", item.id)
        .select()
        .single();

      return error
        ? { success: false as const, error: error.message }
        : { success: true as const, data: appointmentToTransaction(data) };
    }

    const { data, error } = await createClient()
      .from("transactions")
      .update({ status: "pago", payment_method: paymentMethod, paid_date: now.slice(0, 10) })
      .eq("id", item.id)
      .select()
      .single();

    return error
      ? { success: false as const, error: error.message }
      : {
          success: true as const,
          data: rowToTransaction(data, new Map()),
        };
  }

  static async completeAppointmentWithPayment(
    id: string | number,
    paymentMethod: PaymentMethod,
    amount: number
  ) {
    const now = new Date().toISOString();
    const { data, error } = await createClient()
      .from("appointments")
      .update({
        payment_status: "paid",
        payment_method: paymentMethod,
        payment_value: amount,
        payment_received_at: now,
        payment_confirmed_at: now,
        status: "completed",
        attendance_status: "attended",
        attended_at: now,
      })
      .eq("id", id)
      .select()
      .single();

    return error
      ? { success: false as const, error: error.message }
      : { success: true as const, data: appointmentToTransaction(data) };
  }
}
