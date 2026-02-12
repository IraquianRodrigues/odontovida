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
  // Clean palette — no purple, violet, indigo, or fuchsia (Purple Ban)
  const colors = [
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
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
        {/* Header — search + action only, no redundant title */}
        <div className="p-6 pb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar profissional..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Novo Profissional
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {professionals.length === 0 ? (
          <div className="p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-5 rounded-2xl bg-muted/60">
                <Users className="h-10 w-10 text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Nenhum profissional cadastrado
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Comece adicionando o primeiro profissional da sua equipe clicando no botão acima.
                </p>
              </div>
            </div>
          </div>
        ) : paginatedProfessionals.length === 0 ? (
          <div className="p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-5 rounded-2xl bg-muted/60">
                <Search className="h-10 w-10 text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Nenhum resultado encontrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Tente buscar por outro nome
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {paginatedProfessionals.map((professional, index) => (
                <Card
                  key={professional.id}
                  className="group relative overflow-hidden border hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    animationDelay: `${index * 60}ms`,
                    animation: "fadeSlideUp 0.4s ease-out both",
                  }}
                >
                  {/* Colored left accent bar on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/0 group-hover:bg-primary transition-colors duration-300 rounded-l-xl" />

                  <div className="p-5 space-y-4">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm transition-transform duration-300 group-hover:scale-105 ${getAvatarColor(
                          professional.name
                        )}`}
                      >
                        {getInitials(professional.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                          {professional.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground">
                            {professional.specialty || "Geral"}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 font-mono">
                            {professional.code}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border/50" />

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProfessionalForServices(professional)}
                        className="flex-1 gap-1.5 text-xs h-8 hover:bg-muted/80"
                      >
                        <Briefcase className="h-3.5 w-3.5" />
                        Serviços
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProfessional(professional)}
                        className="flex-1 gap-1.5 text-xs h-8 hover:bg-muted/80"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProfessionalForSchedule(professional)}
                        className="flex-1 gap-1.5 text-xs h-8 hover:bg-muted/80"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Agenda
                      </Button>
                    </div>
                  </div>
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
                  <div className="text-sm font-medium px-4 tabular-nums">
                    {currentPage} / {totalPages}
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
