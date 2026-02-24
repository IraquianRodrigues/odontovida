import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Inicializar Redis apenas se as variáveis estiverem configuradas
function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("⚠️ UPSTASH_REDIS_REST_URL ou UPSTASH_REDIS_REST_TOKEN não configuradas. Rate limiting desabilitado.");
    return null;
  }

  return new Redis({ url, token });
}

const redis = createRedisClient();

// Rate limiters por contexto
const loginLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "ratelimit:login",
      analytics: true,
    })
  : null;

const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "60 s"),
      prefix: "ratelimit:api",
      analytics: true,
    })
  : null;

const transactionCreateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "60 s"),
      prefix: "ratelimit:transaction:create",
      analytics: true,
    })
  : null;

/**
 * Verifica rate limit de login
 * @param identifier - Email ou IP do usuário
 * @returns true se permitido, false se bloqueado
 */
export async function checkLoginRateLimit(identifier: string): Promise<boolean> {
  if (!loginLimiter) return true;

  const { success } = await loginLimiter.limit(identifier);
  return success;
}

/**
 * Verifica rate limit de API genérica
 * @param identifier - User ID ou IP
 * @returns true se permitido, false se bloqueado
 */
export async function checkApiRateLimit(identifier: string): Promise<boolean> {
  if (!apiLimiter) return true;

  const { success } = await apiLimiter.limit(identifier);
  return success;
}

/**
 * Verifica rate limit de criação de transações
 * @param userId - ID do usuário
 * @returns true se permitido, false se bloqueado
 */
export async function checkTransactionCreateRateLimit(userId: string): Promise<boolean> {
  if (!transactionCreateLimiter) return true;

  const { success } = await transactionCreateLimiter.limit(userId);
  return success;
}

/**
 * Reseta o rate limit de login (após login bem-sucedido)
 * @param identifier - Email ou IP do usuário
 */
export async function resetLoginRateLimit(identifier: string): Promise<void> {
  if (!redis) return;
  await loginLimiter?.resetUsedTokens(identifier);
}
