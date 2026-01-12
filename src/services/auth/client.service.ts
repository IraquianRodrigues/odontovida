import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Tipos para autenticação
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
}

// Serviço de autenticação para Client Components
export class AuthClientService {
  /**
   * Realiza login do usuário (Client Component)
   */
  static async login({
    email,
    password,
  }: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validação das variáveis de ambiente
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL não está definida");
      }
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida");
      }

      // Rate limiting check (importar dinamicamente para evitar erro no build)
      const { checkLoginRateLimit, resetLoginRateLimit } = await import("@/lib/rate-limit");
      
      if (!checkLoginRateLimit(email)) {
        return {
          success: false,
          error: "Muitas tentativas de login. Por favor, aguarde 1 minuto e tente novamente.",
        };
      }

      const supabase = createBrowserClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase Auth Error:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Login bem-sucedido - resetar rate limit
      resetLoginRateLimit(email);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error("System Login Error:", error);
      return {
        success: false,
        error: `Erro de sistema: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Realiza logout do usuário (Client Component)
   */
  static async logout(): Promise<AuthResponse> {
    try {
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: "Erro ao realizar logout. Tente novamente.",
      };
    }
  }

  /**
   * Obtém o usuário autenticado (Client Component)
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = createBrowserClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      return user;
    } catch (error) {
      return null;
    }
  }
}
