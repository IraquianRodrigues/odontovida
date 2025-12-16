"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { ServiceRow } from "@/types/database.types";
import { ServiceDetailsModal } from "@/components/service-details-modal";

interface ServicesTableProps {
  services: ServiceRow[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 15;

export function ServicesTable({
  services,
  isLoading = false,
}: ServicesTableProps) {
  const [selectedService, setSelectedService] = useState<ServiceRow | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;

    return services.filter((service) =>
      service.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  // Paginação
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Reset para primeira página quando filtrar
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando serviços...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Lista de Serviços</h2>
              <p className="text-sm text-muted-foreground">
                Visualize e gerencie os serviços cadastrados
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Serviço
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código do serviço..."
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
                  Código
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Duração
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-12 text-center text-muted-foreground"
                  >
                    Nenhum serviço cadastrado. Clique em "Novo Serviço" para
                    adicionar.
                  </td>
                </tr>
              ) : paginatedServices.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-12 text-center text-muted-foreground"
                  >
                    Nenhum serviço encontrado
                  </td>
                </tr>
              ) : (
                paginatedServices.map((service) => {
                  return (
                    <tr
                      key={service.id}
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-medium font-mono">
                          {service.code}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {service.duration_minutes} minutos
                        </span>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedService(service)}
                          className="cursor-pointer"
                        >
                          Editar
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
              {Math.min(endIndex, filteredServices.length)} de{" "}
              {filteredServices.length} serviços
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

      <ServiceDetailsModal
        service={selectedService}
        isCreating={isCreating}
        onClose={() => {
          setSelectedService(null);
          setIsCreating(false);
        }}
      />
    </>
  );
}

