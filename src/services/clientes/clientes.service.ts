import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { ClienteRow } from "@/types/database.types";

type ClienteDbRow = {
  id: string; created_at: string; updated_at: string; nome: string; telefone: string;
  email: string | null; data_nascimento: string | null; endereco_completo: string | null;
  cidade: string | null; estado: string | null; trava_humano: boolean;
  observacoes_internas: string | null;
};

const toCliente = (row: ClienteDbRow): ClienteRow => ({
  id: row.id,
  created_at: row.created_at,
  updated_at: row.updated_at,
  nome: row.nome,
  telefone: row.telefone,
  email: row.email,
  data_nascimento: row.data_nascimento,
  endereco: row.endereco_completo,
  cidade: row.cidade,
  bairro: null,
  estado: row.estado,
  trava: row.trava_humano,
  notes: row.observacoes_internas,
});

export class ClientesService {
  private get supabase() { return createClient(); }

  async getAllClientes(): Promise<ClienteRow[]> {
    const { data, error } = await this.supabase.from("clientes").select("*").order("nome");
    if (error) throw new Error("Falha ao buscar clientes");
    return ((data || []) as ClienteDbRow[]).map(toCliente);
  }

  async getClienteByTelefone(telefone: string): Promise<ClienteRow | null> {
    const { data, error } = await this.supabase.from("clientes").select("*").eq("telefone", telefone).maybeSingle();
    if (error) throw new Error("Falha ao buscar cliente");
    return data ? toCliente(data as ClienteDbRow) : null;
  }

  async updateClienteTrava(telefone: string, trava: boolean): Promise<ClienteRow | null> {
    const { data, error } = await this.supabase.from("clientes").update({ trava_humano: trava }).eq("telefone", telefone).select().maybeSingle();
    if (error) throw new Error("Falha ao atualizar trava do cliente");
    return data ? toCliente(data as ClienteDbRow) : null;
  }

  async updateClienteNotes(telefone: string, notes: string): Promise<ClienteRow | null> {
    const { data, error } = await this.supabase.from("clientes").update({ observacoes_internas: notes }).eq("telefone", telefone).select().maybeSingle();
    if (error) throw new Error("Falha ao atualizar anotações do cliente");
    return data ? toCliente(data as ClienteDbRow) : null;
  }

  async createCliente(data: Omit<ClienteRow, "id" | "created_at">): Promise<ClienteRow> {
    const { data: created, error } = await this.supabase.from("clientes").insert({
      nome: data.nome,
      telefone: data.telefone,
      email: data.email ?? null,
      data_nascimento: data.data_nascimento ?? null,
      endereco_completo: data.endereco ?? null,
      cidade: data.cidade ?? null,
      estado: data.estado ?? null,
      trava_humano: data.trava ?? false,
      observacoes_internas: data.notes ?? null,
    }).select().single();
    if (error) {
      logger.error("Erro ao criar cliente:", error);
      throw new Error(error.code === "23505" ? "Já existe um cliente com este telefone" : "Falha ao criar cliente");
    }
    return toCliente(created as ClienteDbRow);
  }

  async updateCliente(id: string, data: Partial<Omit<ClienteRow, "id" | "created_at">>): Promise<ClienteRow> {
    const update: Record<string, unknown> = {};
    if (data.nome !== undefined) update.nome = data.nome;
    if (data.telefone !== undefined) update.telefone = data.telefone;
    if (data.email !== undefined) update.email = data.email;
    if (data.data_nascimento !== undefined) update.data_nascimento = data.data_nascimento;
    if (data.endereco !== undefined) update.endereco_completo = data.endereco;
    if (data.cidade !== undefined) update.cidade = data.cidade;
    if (data.estado !== undefined) update.estado = data.estado;
    if (data.trava !== undefined) update.trava_humano = data.trava;
    if (data.notes !== undefined) update.observacoes_internas = data.notes;
    const { data: updated, error } = await this.supabase.from("clientes").update(update).eq("id", id).select().single();
    if (error) throw new Error("Falha ao atualizar cliente");
    return toCliente(updated as ClienteDbRow);
  }

  async deleteCliente(id: string): Promise<void> {
    const { error } = await this.supabase.from("clientes").delete().eq("id", id);
    if (error) throw new Error("Falha ao excluir cliente");
  }
}

export const clientesService = new ClientesService();
