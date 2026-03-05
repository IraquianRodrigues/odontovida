import { z } from "zod";

// Schema de validação para variáveis de ambiente públicas (client + server)
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida")
    .min(1, "NEXT_PUBLIC_SUPABASE_URL é obrigatória"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória"),
});

// Schema de validação para variáveis server-only (rate limiting)
const serverEnvSchema = z.object({
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url("UPSTASH_REDIS_REST_URL deve ser uma URL válida")
    .min(1, "UPSTASH_REDIS_REST_URL é obrigatória para rate limiting"),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, "UPSTASH_REDIS_REST_TOKEN é obrigatório para rate limiting"),
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

    // Validar vars de servidor apenas no server-side
    if (typeof window === "undefined") {
      serverEnvSchema.parse({
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
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

