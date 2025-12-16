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
      const supabase = createBrowserClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: "Erro ao realizar login. Tente novamente.",
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
