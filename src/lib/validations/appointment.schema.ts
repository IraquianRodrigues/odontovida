import { z } from "zod";

// Enums para validação
export const appointmentStatusEnum = z.enum([
  "agendado",
  "confirmado",
  "em_atendimento",
  "concluido",
  "cancelado",
  "faltou",
]);

// Schema para criação de agendamento
export const createAppointmentSchema = z
  .object({
    cliente_id: z.number().int().positive("ID do cliente inválido"),
    profissional_id: z.number().int().positive("ID do profissional inválido"),
    servico_id: z.number().int().positive("ID do serviço inválido"),
    data_hora: z.string().refine((date) => {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return false;
      // Verificar se a data não é no passado
      return parsed >= new Date();
    }, "Data e hora devem ser no futuro"),
    duracao_minutos: z
      .number()
      .int()
      .positive("Duração deve ser positiva")
      .max(480, "Duração máxima é 8 horas"),
    status: appointmentStatusEnum.optional(),
    observacoes: z.string().max(1000, "Observações muito longas").optional(),
    valor: z.number().positive("Valor deve ser positivo").optional(),
  })
  .refine(
    (data) => {
      // Validar horário comercial (8h às 18h)
      const date = new Date(data.data_hora);
      const hour = date.getHours();
      return hour >= 8 && hour < 18;
    },
    {
      message: "Agendamentos devem ser entre 8h e 18h",
      path: ["data_hora"],
    }
  );

// Schema para atualização de agendamento
export const updateAppointmentSchema = createAppointmentSchema
  .partial()
  .extend({
    data_hora: z
      .string()
      .refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      }, "Data e hora inválidas")
      .optional(),
  });

// Schema para filtros de agendamento
export const appointmentFiltersSchema = z.object({
  cliente_id: z.number().int().positive().optional(),
  profissional_id: z.number().int().positive().optional(),
  servico_id: z.number().int().positive().optional(),
  status: appointmentStatusEnum.optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// Types inferidos dos schemas
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentFilters = z.infer<typeof appointmentFiltersSchema>;
