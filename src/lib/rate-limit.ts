/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpar entradas expiradas a cada minuto
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Verifica se uma requisição está dentro do limite
   * @param key - Identificador único (ex: IP, user ID)
   * @param limit - Número máximo de requisições
   * @param windowMs - Janela de tempo em milissegundos
   * @returns true se permitido, false se bloqueado
   */
  check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Nova entrada ou janela expirada
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (entry.count >= limit) {
      // Limite excedido
      return false;
    }

    // Incrementar contador
    entry.count++;
    this.store.set(key, entry);
    return true;
  }

  /**
   * Obtém informações sobre o limite atual
   * @param key - Identificador único
   * @returns Informações do rate limit ou null
   */
  getInfo(key: string): {
    remaining: number;
    resetTime: number;
  } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    return {
      remaining: Math.max(0, entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reseta o contador para uma chave específica
   * @param key - Identificador único
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Limpa entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Limpa o intervalo de limpeza (para testes)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Instância singleton
const rateLimiter = new RateLimiter();

// Configurações de rate limit
export const RATE_LIMITS = {
  LOGIN: {
    limit: 5,
    windowMs: 60000, // 1 minuto
  },
  API: {
    limit: 100,
    windowMs: 60000, // 1 minuto
  },
  TRANSACTION_CREATE: {
    limit: 20,
    windowMs: 60000, // 1 minuto
  },
  TRANSACTION_UPDATE: {
    limit: 30,
    windowMs: 60000, // 1 minuto
  },
};

/**
 * Helper para verificar rate limit de login
 * @param identifier - Email ou IP do usuário
 * @returns true se permitido, false se bloqueado
 */
export function checkLoginRateLimit(identifier: string): boolean {
  return rateLimiter.check(
    `login:${identifier}`,
    RATE_LIMITS.LOGIN.limit,
    RATE_LIMITS.LOGIN.windowMs
  );
}

/**
 * Helper para verificar rate limit de API genérica
 * @param identifier - User ID ou IP
 * @returns true se permitido, false se bloqueado
 */
export function checkApiRateLimit(identifier: string): boolean {
  return rateLimiter.check(
    `api:${identifier}`,
    RATE_LIMITS.API.limit,
    RATE_LIMITS.API.windowMs
  );
}

/**
 * Helper para verificar rate limit de criação de transações
 * @param userId - ID do usuário
 * @returns true se permitido, false se bloqueado
 */
export function checkTransactionCreateRateLimit(userId: string): boolean {
  return rateLimiter.check(
    `transaction:create:${userId}`,
    RATE_LIMITS.TRANSACTION_CREATE.limit,
    RATE_LIMITS.TRANSACTION_CREATE.windowMs
  );
}

/**
 * Reseta o rate limit de login (útil após login bem-sucedido)
 * @param identifier - Email ou IP do usuário
 */
export function resetLoginRateLimit(identifier: string): void {
  rateLimiter.reset(`login:${identifier}`);
}

export { rateLimiter };
