"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { ClienteRow } from "@/types/database.types";
import { ClienteDetailsModal } from "@/components/cliente-details-modal";

interface ClientesTableProps {
  clientes: ClienteRow[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 5;

export function ClientesTable({
  clientes,
  isLoading = false,
}: ClientesTableProps) {
  const [selectedCliente, setSelectedCliente] = useState<ClienteRow | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredClientes = useMemo(() => {
    if (!searchQuery.trim()) return clientes;

    return clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clientes, searchQuery]);

  // Paginação
  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedClientes = filteredClientes.slice(startIndex, endIndex);

  // Reset para primeira página quando filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <Card className="p-12 border shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Carregando clientes...
          </p>
        </div>
      </Card>
    );
  }

  if (clientes.length === 0) {
    return (
      <Card className="p-12 border shadow-sm">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-muted-foreground">
            Nenhum cliente cadastrado
          </p>
          <p className="text-sm text-muted-foreground/70">
            Os clientes cadastrados aparecerão aqui
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-card rounded-[32px] border border-border shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden transition-colors dark:shadow-none">
        <div className="p-8 space-y-6 border-b border-border">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-card-foreground transition-colors">Lista de Clientes</h2>
            <p className="text-sm text-muted-foreground font-medium transition-colors">
              Visualize e gerencie os clientes cadastrados
            </p>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Buscar por nome do cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-muted/50 border-input focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring transition-all rounded-2xl font-medium text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Versão Mobile - Cards */}
        <div className="block sm:hidden space-y-3 p-4">
          {paginatedClientes.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <p className="text-base font-medium">Nenhum cliente encontrado</p>
                <p className="text-sm text-muted-foreground/70">
                  Tente ajustar a busca ou verificar os filtros
                </p>
              </div>
            </div>
          ) : (
            paginatedClientes.map((cliente) => {
              const isBlocked = cliente.trava;
              return (
                <div
                  key={cliente.id}
                  className={`p-4 border rounded-2xl transition-all ${isBlocked ? "bg-red-50/30 border-red-100 dark:bg-red-900/20 dark:border-red-900/50" : "bg-card border-border"
                    }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-base truncate ${isBlocked ? "text-red-700 dark:text-red-400" : "text-card-foreground"
                            }`}
                        >
                          {cliente.nome}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                          {cliente.telefone}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {cliente.trava ? (
                          <Badge
                            variant="destructive"
                            className="font-semibold shadow-none text-xs rounded-lg px-2"
                          >
                            Bloqueado
                          </Badge>
                        ) : (
                          <Badge
                            className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 border-0 font-semibold shadow-none text-xs rounded-lg px-2"
                          >
                            Ativo
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCliente(cliente)}
                      className="w-full rounded-xl border-input hover:bg-muted hover:text-foreground transition-all font-medium"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Versão Desktop - Tabela */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Nome
                </th>
                <th className="text-left p-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Telefone
                </th>
                <th className="text-left p-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedClientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base font-medium">Nenhum cliente encontrado</p>
                      <p className="text-sm text-muted-foreground/70">
                        Tente ajustar a busca ou verificar os filtros
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClientes.map((cliente) => {
                  const isBlocked = cliente.trava;
                  return (
                    <tr
                      key={cliente.id}
                      className={`group transition-colors hover:bg-muted/50 ${isBlocked ? "bg-red-50/10 dark:bg-red-900/10" : ""
                        }`}
                    >
                      <td className="p-6">
                        <span
                          className={`font-medium transition-colors ${isBlocked ? "text-red-700 dark:text-red-400" : "text-card-foreground"
                            }`}
                        >
                          {cliente.nome}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-sm text-muted-foreground font-medium">
                          {cliente.telefone}
                        </span>
                      </td>
                      <td className="p-6">
                        {cliente.trava ? (
                          <Badge
                            variant="destructive"
                            className="font-semibold shadow-none rounded-lg px-2.5 py-0.5"
                          >
                            Bloqueado
                          </Badge>
                        ) : (
                          <Badge
                            className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 border-0 font-semibold shadow-none rounded-lg px-2.5 py-0.5"
                          >
                            Ativo
                          </Badge>
                        )}
                      </td>
                      <td className="p-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCliente(cliente)}
                          className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground font-medium text-center sm:text-left">
              Mostrando <span className="font-bold text-foreground">{startIndex + 1}</span> a{" "}
              <span className="font-bold text-foreground">
                {Math.min(endIndex, filteredClientes.length)}
              </span>{" "}
              de <span className="font-bold text-foreground">{filteredClientes.length}</span> clientes
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 px-4 rounded-xl border-input hover:bg-background hover:border-ring hover:text-foreground transition-all disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <div className="text-sm font-bold w-10 h-10 flex items-center justify-center bg-foreground text-background rounded-xl">
                {currentPage}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-10 px-4 rounded-xl border-input hover:bg-background hover:border-ring hover:text-foreground transition-all disabled:opacity-50"
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ClienteDetailsModal
        cliente={selectedCliente}
        onClose={() => setSelectedCliente(null)}
      />
    </>
  );
}
