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
    "bg-red-100 text-red-600",
    "bg-orange-100 text-orange-600",
    "bg-amber-100 text-amber-600",
    "bg-green-100 text-green-600",
    "bg-emerald-100 text-emerald-600",
    "bg-teal-100 text-teal-600",
    "bg-cyan-100 text-cyan-600",
    "bg-blue-100 text-blue-600",
    "bg-indigo-100 text-indigo-600",
    "bg-violet-100 text-violet-600",
    "bg-purple-100 text-purple-600",
    "bg-fuchsia-100 text-fuchsia-600",
    "bg-pink-100 text-pink-600",
    "bg-rose-100 text-rose-600",
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
      <div className="bg-card rounded-[32px] border border-border shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden transition-colors dark:shadow-none">
        <div className="p-8 space-y-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground transition-colors">Lista de Profissionais</h2>
              <p className="text-sm text-muted-foreground font-medium transition-colors">
                Visualize e gerencie os profissionais cadastrados
              </p>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Buscar por nome do profissional..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-muted/50 border-input focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring transition-all rounded-2xl font-medium text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Profissional
                </th>
                <th className="text-left p-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Especialidade
                </th>
                <th className="text-left p-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Código
                </th>
                <th className="text-right p-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {professionals.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base font-medium">Nenhum profissional cadastrado</p>
                      <p className="text-sm text-muted-foreground/70">Clique em "Novo Profissional" para adicionar.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProfessionals.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base font-medium">Nenhum profissional encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProfessionals.map((professional) => {
                  return (
                    <tr
                      key={professional.id}
                      className="group transition-colors hover:bg-muted/50"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${getAvatarColor(
                              professional.name
                            )}`}
                          >
                            {getInitials(professional.name)}
                          </div>
                          <div>
                            <span className="block font-medium text-foreground group-hover:text-primary transition-colors">
                              {professional.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                          {professional.specialty || "Geral"}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground font-mono">
                          {professional.code}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProfessionalForServices(professional)}
                            className="h-9 px-4 text-xs font-medium border-input hover:bg-background hover:border-ring hover:text-foreground rounded-lg transition-all"
                          >
                            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                            Serviços
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProfessional(professional)}
                            className="h-9 px-4 text-xs font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
          <div className="p-6 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground font-medium text-center sm:text-left">
              Mostrando <span className="font-bold text-foreground">{startIndex + 1}</span> a{" "}
              <span className="font-bold text-foreground">
                {Math.min(endIndex, filteredProfessionals.length)}
              </span>{" "}
              de <span className="font-bold text-foreground">{filteredProfessionals.length}</span> profissionais
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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
