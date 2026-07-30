"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronLeft, ChevronRight, Plus, Clock, Edit2, Package } from "lucide-react";
import type { ServiceRow } from "@/types/database.types";
import { ServiceDetailsModal } from "@/components/service-details-modal";

interface ServicesTableProps {
  services: ServiceRow[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 12;

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

    const normalizedQuery = searchQuery.toLowerCase();
    return services.filter((service) =>
      service.name.toLowerCase().includes(normalizedQuery) ||
      (service.description || "").toLowerCase().includes(normalizedQuery)
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Lista de Serviços</h2>
              <p className="text-sm text-muted-foreground">
                Visualize e gerencie os serviços cadastrados
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Serviço
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Empty State */}
        {services.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Nenhum serviço cadastrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Novo Serviço" para adicionar.
                </p>
              </div>
            </div>
          </div>
        ) : paginatedServices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Nenhum serviço encontrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Tente buscar por outro termo
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 pt-0">
              {paginatedServices.map((service) => (
                <Card
                  key={service.id}
                  className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/20"
                  onClick={() => setSelectedService(service)}
                >
                  <div className="p-6 space-y-4">
                    {/* Service name */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Serviço
                      </p>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 min-h-10">
                          {service.description}
                        </p>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-muted">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Duração</p>
                          <p className="text-sm font-semibold text-foreground">
                            {service.duration_minutes} min
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Editar Serviço
                    </Button>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
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
                  <div className="text-sm font-medium px-4">
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
          </>
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

