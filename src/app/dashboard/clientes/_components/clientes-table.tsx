"use client";

import { useState, useMemo } from "react";
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

const ITEMS_PER_PAGE = 15;

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
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </Card>
    );
  }

  if (clientes.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Lista de Clientes</h2>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie os clientes cadastrados
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y bg-muted/30">
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Nome
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Telefone
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedClientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-muted-foreground"
                  >
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                paginatedClientes.map((cliente) => {
                  return (
                    <tr
                      key={cliente.id}
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-medium">{cliente.nome}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {cliente.telefone}
                        </span>
                      </td>
                      <td className="p-4">
                        {cliente.trava ? (
                          <Badge variant="destructive">Bloqueado</Badge>
                        ) : (
                          <Badge variant="default">Ativo</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCliente(cliente)}
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
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a{" "}
              {Math.min(endIndex, filteredClientes.length)} de{" "}
              {filteredClientes.length} clientes
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="text-sm font-medium">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ClienteDetailsModal
        cliente={selectedCliente}
        onClose={() => setSelectedCliente(null)}
      />
    </>
  );
}
