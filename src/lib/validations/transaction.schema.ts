import { z } from "zod";

// Enums para validação
export const transactionTypeEnum = z.enum(["receita", "despesa"]);
export const transactionStatusEnum = z.enum([
  "pendente",
  "pago",
  "cancelado",
  "atrasado",
]);
export const paymentMethodEnum = z.enum([
  "dinheiro",
  "cartao_credito",
  "cartao_debito",
  "pix",
  "boleto",
  "transferencia",
]);

// Schema para criação de transação
export const createTransactionSchema = z
  .object({
    client_id: z.string().uuid("ID do cliente inválido").optional(),
    appointment_id: z.string().uuid("ID do agendamento inválido").optional(),
    professional_id: z.string().uuid("ID do profissional inválido").optional(),
    type: transactionTypeEnum,
    category: z
      .string()
      .min(1, "Categoria é obrigatória")
      .max(100, "Categoria muito longa"),
    description: z.string().max(500, "Descrição muito longa").optional(),
    amount: z
      .number()
      .positive("Valor deve ser positivo")
      .max(1000000, "Valor muito alto"),
    payment_method: paymentMethodEnum.optional(),
    status: transactionStatusEnum,
    due_date: z.string().refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Data de vencimento inválida"),
    paid_date: z
      .string()
      .refine((date) => {
        if (!date) return true;
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      }, "Data de pagamento inválida")
      .optional(),
    notes: z.string().max(1000, "Notas muito longas").optional(),
  })
  .refine(
    (data) => {
      // Se for receita, client_id é obrigatório
      if (data.type === "receita" && !data.client_id) {
        return false;
      }
      return true;
    },
    {
      message: "Cliente é obrigatório para receitas",
      path: ["client_id"],
    }
  )
  .refine(
    (data) => {
      // Se status for pago, payment_method é obrigatório
      if (data.status === "pago" && !data.payment_method) {
        return false;
      }
      return true;
    },
    {
      message: "Método de pagamento é obrigatório quando status é 'pago'",
      path: ["payment_method"],
    }
  );

// Schema para atualização de transação
export const updateTransactionSchema = createTransactionSchema.partial();

// Schema para filtros de transação
export const transactionFiltersSchema = z.object({
  type: transactionTypeEnum.optional(),
  status: transactionStatusEnum.optional(),
  client_id: z.string().uuid().optional(),
  professional_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  min_amount: z.number().positive().optional(),
  max_amount: z.number().positive().optional(),
});

// Types inferidos dos schemas
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
