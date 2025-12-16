import { createClient } from "@/lib/supabase/client";
import type { ClienteRow } from "@/types/database.types";

export class ClientesService {
  private supabase = createClient();

  /**
   * Busca todos os clientes
   */
  async getAllClientes(): Promise<ClienteRow[]> {
    const { data, error } = await this.supabase
      .from("clientes")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      throw new Error("Falha ao buscar clientes");
    }

    return data || [];
  }

  /**
   * Busca um cliente pelo telefone
   */
  async getClienteByTelefone(telefone: string): Promise<ClienteRow | null> {
    const { data, error } = await this.supabase
      .from("clientes")
      .select("*")
      .eq("telefone", telefone)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Código para "não encontrado"
        return null;
      }
      console.error("Erro ao buscar cliente:", error);
      throw new Error("Falha ao buscar cliente");
    }

    return data;
  }

  /**
   * Atualiza a propriedade trava de um cliente
   */
  async updateClienteTrava(
    telefone: string,
    trava: boolean
  ): Promise<ClienteRow | null> {
    // Primeiro busca o cliente
    const cliente = await this.getClienteByTelefone(telefone);

    if (!cliente) {
      return null;
    }

    // Atualiza a trava
    const { data, error } = await this.supabase
      .from("clientes")
      .update({ trava })
      .eq("telefone", telefone)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar trava do cliente:", error);
      throw new Error("Falha ao atualizar trava do cliente");
    }

    return data;
  }
}

// Singleton instance
export const clientesService = new ClientesService();
