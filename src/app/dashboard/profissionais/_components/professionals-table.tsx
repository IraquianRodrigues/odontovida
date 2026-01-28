"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronLeft, ChevronRight, Plus, Briefcase, Edit2, Users, Calendar } from "lucide-react";
import type { ProfessionalRow } from "@/types/database.types";
import { ProfessionalDetailsModal } from "@/components/professional-details-modal";
import { ProfessionalServicesModal } from "@/components/professional-services-modal";
import { ProfessionalScheduleModal } from "@/components/professional-schedule-modal";

interface ProfessionalsTableProps {
  professionals: ProfessionalRow[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 12;

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
    "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
    "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function ProfessionalsTable({
  professionals,
  isLoading = false,
}: ProfessionalsTableProps) {
  const [selectedProfessional, setSelectedProfessional] =
    useState<ProfessionalRow | null>(null);
  const [professionalForServices, setProfessionalForServices] =
    useState<ProfessionalRow | null>(null);
  const [professionalForSchedule, setProfessionalForSchedule] =
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Lista de Profissionais</h2>
              <p className="text-sm text-muted-foreground">
                Visualize e gerencie os profissionais cadastrados
              </p>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="gap-2 w-full sm:w-auto"
            >
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

        {/* Empty State */}
        {professionals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Nenhum profissional cadastrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Novo Profissional" para adicionar.
                </p>
              </div>
            </div>
          </div>
        ) : paginatedProfessionals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Nenhum profissional encontrado
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
              {paginatedProfessionals.map((professional) => (
                <Card
                  key={professional.id}
                  className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
                >
                  <div className="p-6 space-y-4">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${getAvatarColor(
                          professional.name
                        )}`}
                      >
                        {getInitials(professional.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {professional.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono">
                          {professional.code}
                        </p>
                      </div>
                    </div>

                    {/* Specialty Badge */}
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {professional.specialty || "Geral"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProfessionalForServices(professional)}
                          className="flex-1 gap-2"
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          Serviços
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProfessional(professional)}
                          className="flex-1 gap-2 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Editar
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProfessionalForSchedule(professional)}
                        className="w-full gap-2"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Agenda
                      </Button>
                    </div>
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

      <ProfessionalScheduleModal
        professional={professionalForSchedule}
        onClose={() => setProfessionalForSchedule(null)}
      />
    </>
  );
}
