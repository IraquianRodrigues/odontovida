import { z } from "zod";

// Validação de CPF (formato brasileiro)
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// Validação de telefone (formato brasileiro)
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

// Schema para criação de cliente
export const createClientSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo")
    .trim(),
  email: z
    .string()
    .email("Email inválido")
    .max(100, "Email muito longo")
    .optional()
    .or(z.literal("")),
  telefone: z
    .string()
    .regex(phoneRegex, "Telefone inválido. Use o formato (XX) XXXXX-XXXX")
    .optional()
    .or(z.literal("")),
  cpf: z
    .string()
    .regex(cpfRegex, "CPF inválido. Use o formato XXX.XXX.XXX-XX")
    .optional()
    .or(z.literal("")),
  data_nascimento: z
    .string()
    .refine((date) => {
      if (!date) return true;
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return false;
      // Verificar se a data não é futura
      return parsed <= new Date();
    }, "Data de nascimento inválida")
    .optional(),
  endereco: z.string().max(200, "Endereço muito longo").optional(),
  observacoes: z.string().max(1000, "Observações muito longas").optional(),
});

// Schema para atualização de cliente
export const updateClientSchema = createClientSchema.partial();

// Schema para busca de clientes
export const searchClientSchema = z.object({
  query: z.string().min(1, "Digite algo para buscar").max(100),
  limit: z.number().int().positive().max(100).optional(),
});

// Types inferidos dos schemas
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type SearchClientInput = z.infer<typeof searchClientSchema>;
