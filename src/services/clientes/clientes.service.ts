import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { ClienteRow } from "@/types/database.types";

type ClienteDatabaseRow = Omit<
  ClienteRow,
  "notes" | "endereco" | "cidade" | "bairro" | "data_nascimento"
>;

export class ClientesService {
  private get supabase() {
    return createClient();
  }

  private toClienteRow(cliente: ClienteDatabaseRow): ClienteRow {
    return {
      ...cliente,
      // O esquema atual nÃ£o possui campos de endereÃ§o/nascimento. Mantemos
      // valores nulos para que telas legadas continuem renderizando sem erro.
      notes: cliente.motivo_trava_humano,
      endereco: null,
      cidade: null,
      bairro: null,
      data_nascimento: null,
    };
  }

  async getAllClientes(): Promise<ClienteRow[]> {
    const { data, error } = await this.supabase
      .from("clientes")
      .select("*")
      .order("nome", { ascending: true });
    if (error) throw new Error("Falha ao buscar clientes");
    return (data || []).map((cliente) => this.toClienteRow(cliente));
  }

  async getClienteByTelefone(telefone: string): Promise<ClienteRow | null> {
    const { data, error } = await this.supabase
      .from("clientes")
      .select("*")
      .eq("telefone", telefone)
      .maybeSingle();
    if (error) {
      logger.error("Erro ao buscar cliente:", error);
      throw new Error("Falha ao buscar cliente");
    }
    return data ? this.toClienteRow(data) : null;
  }

  async updateClienteTrava(telefone: string, trava: boolean): Promise<ClienteRow | null> {
    const { data, error } = await this.supabase
      .from("clientes")
      .update({ trava })
      .eq("telefone", telefone)
      .select()
      .maybeSingle();
    if (error) throw new Error("Falha ao atualizar trava do cliente");
    return data ? this.toClienteRow(data) : null;
  }

  async updateClienteNotes(telefone: string, notes: string): Promise<ClienteRow | null> {
    const { data, error } = await this.supabase
      .from("clientes")
      .update({ motivo_trava_humano: notes || null })
      .eq("telefone", telefone)
      .select()
      .maybeSingle();
    if (error) throw new Error("Falha ao atualizar observaÃ§Ãµes do cliente");
    return data ? this.toClienteRow(data) : null;
  }

  async createCliente(
    data: Pick<ClienteRow, "nome" | "telefone"> & Partial<ClienteRow>
  ): Promise<ClienteRow> {
    const { data: cliente, error } = await this.supabase
      .from("clientes")
      .insert({
        nome: data.nome.trim(),
        telefone: data.telefone.trim(),
        trava: data.trava ?? false,
        ia_ativa: data.ia_ativa ?? true,
        motivo_trava_humano: data.motivo_trava_humano ?? data.notes ?? null,
        trava_humano_ate: data.trava_humano_ate ?? null,
      })
      .select()
      .single();

    if (error) {
      logger.error("Erro ao criar cliente:", error);
      if (error.code === "23505") throw new Error("JÃ¡ existe um cliente cadastrado com este telefone");
      throw new Error("Falha ao criar cliente");
    }
    return this.toClienteRow(cliente);
  }

  async updateCliente(
    id: number,
    data: Partial<ClienteRow>
  ): Promise<ClienteRow> {
    const { data: cliente, error } = await this.supabase
      .from("clientes")
      .update({
        ...(data.nome === undefined ? {} : { nome: data.nome.trim() }),
        ...(data.telefone === undefined ? {} : { telefone: data.telefone.trim() }),
        ...(data.trava === undefined ? {} : { trava: data.trava }),
        ...(data.ia_ativa === undefined ? {} : { ia_ativa: data.ia_ativa }),
        ...(data.motivo_trava_humano === undefined && data.notes === undefined
          ? {}
          : { motivo_trava_humano: data.motivo_trava_humano ?? data.notes ?? null }),
        ...(data.trava_humano_ate === undefined ? {} : { trava_humano_ate: data.trava_humano_ate }),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      logger.error("Erro ao atualizar cliente:", error);
      throw new Error("Falha ao atualizar cliente");
    }
    return this.toClienteRow(cliente);
  }

  async deleteCliente(id: number): Promise<void> {
    const { error } = await this.supabase.from("clientes").delete().eq("id", id);
    if (error) throw new Error("Falha ao deletar cliente");
  }
}

export const clientesService = new ClientesService();
