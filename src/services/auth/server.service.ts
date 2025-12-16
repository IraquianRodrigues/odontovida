import { createClient as createServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// Serviço de autenticação para Server Components
export class AuthServerService {
  /**
   * Obtém o usuário autenticado (Server Component)
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = await createServerClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica se o usuário está autenticado (Server Component)
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  /**
   * Obtém a sessão do usuário (Server Component)
   */
  static async getSession() {
    try {
      const supabase = await createServerClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      return session;
    } catch (error) {
      return null;
    }
  }
}
