import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { ClienteRow } from "@/types/database.types";

export class ClientesService {
  private get supabase() { return createClient(); }

  /**
   * Busca todos os clientes
   */
  async getAllClientes(): Promise<ClienteRow[]> {
    const { data, error } = await this.supabase
      .from("clientes")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      logger.error("Erro ao buscar clientes:", error);
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
      logger.error("Erro ao buscar cliente:", error);
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
      logger.error("Erro ao atualizar trava do cliente:", error);
      throw new Error("Falha ao atualizar trava do cliente");
    }

    return data;
  }

  /**
   * Atualiza as anotações de um cliente
   */
  async updateClienteNotes(
    telefone: string,
    notes: string
  ): Promise<ClienteRow | null> {
    const { data, error } = await this.supabase
      .from("clientes")
      .update({ notes })
      .eq("telefone", telefone)
      .select()
      .single();

    if (error) {
      logger.error("Erro ao atualizar anotações do cliente:", error);

      // Check for missing column error (Postgres code 42703)
      if (error.code === '42703' || error.message?.includes("column") || error.details?.includes("notes")) {
        throw new Error("A coluna 'notes' ainda não existe no banco. Execute o script: supabase/migrations/add_notes_to_clientes.sql");
      }

      throw new Error("Falha ao atualizar anotações do cliente");
    }

    return data;
  }

  /**
   * Cria um novo cliente
   */
  async createCliente(
    data: Omit<ClienteRow, "id" | "created_at">
  ): Promise<ClienteRow> {
    const { data: cliente, error } = await this.supabase
      .from("clientes")
      .insert({
        nome: data.nome,
        telefone: data.telefone,
        trava: data.trava ?? false,
        notes: data.notes ?? null,
        endereco: data.endereco ?? null,
        cidade: data.cidade ?? null,
        bairro: data.bairro ?? null,
        data_nascimento: data.data_nascimento ?? null,
      })
      .select()
      .single();

    if (error) {
      logger.error("Erro ao criar cliente:", error);
      
      // Check for duplicate phone number
      if (error.code === "23505") {
        throw new Error("Já existe um cliente cadastrado com este telefone");
      }
      
      throw new Error("Falha ao criar cliente");
    }

    return cliente;
  }

  /**
   * Atualiza um cliente existente
   */
  async updateCliente(
    id: number,
    data: Partial<Omit<ClienteRow, "id" | "created_at">>
  ): Promise<ClienteRow> {
    const { data: cliente, error } = await this.supabase
      .from("clientes")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Erro ao atualizar cliente:", error);
      
      // Check for duplicate phone number
      if (error.code === "23505") {
        throw new Error("Já existe um cliente cadastrado com este telefone");
      }
      
      throw new Error("Falha ao atualizar cliente");
    }

    return cliente;
  }

  /**
   * Deleta um cliente
   */
  async deleteCliente(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Erro ao deletar cliente:", error);
      
      // Check for foreign key constraint violations
      if (error.code === "23503") {
        throw new Error("Não é possível excluir este cliente pois existem registros relacionados (agendamentos, prontuários, etc.)");
      }
      
      throw new Error("Falha ao excluir cliente");
    }
  }
}

// Singleton instance
export const clientesService = new ClientesService();
