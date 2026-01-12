import { z } from "zod";

// Schema de validação para variáveis de ambiente
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida")
    .min(1, "NEXT_PUBLIC_SUPABASE_URL é obrigatória"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória"),
});

/**
 * Valida as variáveis de ambiente necessárias
 * @throws Error se alguma variável estiver faltando ou inválida
 */
export function validateEnv() {
  try {
    envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => e.path.join(".")).join(", ");
      throw new Error(
        `❌ Variáveis de ambiente inválidas ou faltando: ${missingVars}\n\n` +
          `Por favor, verifique seu arquivo .env.local e certifique-se de que todas as variáveis necessárias estão definidas.\n` +
          `Consulte o arquivo .env.example para referência.`
      );
    }
    throw error;
  }
}

// Validar na inicialização (apenas no servidor)
if (typeof window === "undefined") {
  validateEnv();
}

// Exportar variáveis tipadas
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
} as const;
