"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronLeft, ChevronRight, Plus, Briefcase } from "lucide-react";
import type { ProfessionalRow } from "@/types/database.types";
import { ProfessionalDetailsModal } from "@/components/professional-details-modal";
import { ProfessionalServicesModal } from "@/components/professional-services-modal";

interface ProfessionalsTableProps {
  professionals: ProfessionalRow[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 15;

export function ProfessionalsTable({
  professionals,
  isLoading = false,
}: ProfessionalsTableProps) {
  const [selectedProfessional, setSelectedProfessional] =
    useState<ProfessionalRow | null>(null);
  const [professionalForServices, setProfessionalForServices] =
    useState<ProfessionalRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProfessionals = useMemo(() => {
    if (!searchQuery.trim()) return professionals;

    return professionals.filter((professional) =>
      professional.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [professionals, searchQuery]);

  // Paginação
  const totalPages = Math.ceil(filteredProfessionals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProfessionals = filteredProfessionals.slice(
    startIndex,
    endIndex
  );

  // Reset para primeira página quando filtrar
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando profissionais...</p>
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
              <h2 className="text-xl font-semibold">Lista de Profissionais</h2>
              <p className="text-sm text-muted-foreground">
                Visualize e gerencie os profissionais cadastrados
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Profissional
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do profissional..."
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
                  Especialidade
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  Código
                </th>
                <th className="text-right p-4 font-medium text-sm text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {professionals.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-muted-foreground"
                  >
                    Nenhum profissional cadastrado. Clique em "Novo
                    Profissional" para adicionar.
                  </td>
                </tr>
              ) : paginatedProfessionals.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-muted-foreground"
                  >
                    Nenhum profissional encontrado
                  </td>
                </tr>
              ) : (
                paginatedProfessionals.map((professional) => {
                  return (
                    <tr
                      key={professional.id}
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-medium">{professional.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {professional.specialty || "Não informada"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground font-mono">
                          {professional.code}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProfessionalForServices(professional)}
                            className="cursor-pointer gap-1"
                          >
                            <Briefcase className="h-3 w-3" />
                            Serviços
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProfessional(professional)}
                            className="cursor-pointer"
                          >
                            Editar
                          </Button>
                        </div>
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
              {Math.min(endIndex, filteredProfessionals.length)} de{" "}
              {filteredProfessionals.length} profissionais
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

      <ProfessionalDetailsModal
        professional={selectedProfessional}
        isCreating={isCreating}
        onClose={() => {
          setSelectedProfessional(null);
          setIsCreating(false);
        }}
      />

      <ProfessionalServicesModal
        professional={professionalForServices}
        onClose={() => setProfessionalForServices(null)}
      />
    </>
  );
}
